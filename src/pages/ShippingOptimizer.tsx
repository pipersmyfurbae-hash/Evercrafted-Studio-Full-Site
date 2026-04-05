import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Truck, Package, MapPin } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { toast } from 'sonner';

export default function ShippingOptimizer() {
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('');
  const [shippingOptions, setShippingOptions] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `Analyze shipping options for a package weighing ${weight}kg to ${destination}. Suggest 3 cost-effective and reliable shipping methods. Return a JSON object with an 'options' key containing an array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });

      const { options } = JSON.parse(response.text);
      setShippingOptions(options);
    } catch (error) {
      console.error("Shipping optimization failed:", error);
      toast.error('Failed to optimize shipping');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="p-12 space-y-12">
      <header className="space-y-4">
        <span className="display-text opacity-40">Business Intelligence</span>
        <h1 className="editorial-title text-6xl">AI Shipping Optimizer</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="glass-panel p-8">
          <CardHeader>
            <CardTitle className="editorial-title text-3xl flex items-center gap-4">
              <Package className="w-8 h-8" />
              Package Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="display-text text-[9px] opacity-40">Destination</label>
              <input 
                type="text" 
                className="w-full bg-muted/50 border-none p-4 text-sm font-bold focus:ring-1 ring-foreground/10 outline-none" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="City, State, or Country"
              />
            </div>
            <div className="space-y-2">
              <label className="display-text text-[9px] opacity-40">Weight (kg)</label>
              <input 
                type="number" 
                className="w-full bg-muted/50 border-none p-4 text-sm font-bold focus:ring-1 ring-foreground/10 outline-none" 
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <Button 
              className="w-full bg-foreground text-background hover:opacity-80" 
              onClick={handleOptimize}
              disabled={isOptimizing || !destination || !weight}
            >
              {isOptimizing ? 'Optimizing...' : 'Find Best Shipping'}
            </Button>
          </CardContent>
        </Card>

        {shippingOptions.length > 0 && (
          <Card className="glass-panel p-8 bg-muted/20">
            <CardHeader>
              <CardTitle className="editorial-title text-3xl flex items-center gap-4">
                <Truck className="w-8 h-8" />
                Recommended Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shippingOptions.map((option, i) => (
                <div key={i} className="p-4 bg-background/50 border border-foreground/5">
                  <p className="text-sm font-bold">{option}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
