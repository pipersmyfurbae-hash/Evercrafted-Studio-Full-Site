import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TrendingUp, DollarSign, Package } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { toast } from 'sonner';

export default function ProfitPredictor() {
  const [materialCost, setMaterialCost] = useState('');
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handlePredict = async () => {
    setIsPredicting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `Analyze a wreath with material cost of $${materialCost}. Suggest a "Sweet Spot" retail price for maximum profitability based on high-end floral design market trends. Return a JSON object with a 'price' key containing the suggested price as a number.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              price: { type: Type.NUMBER },
            },
          },
        },
      });

      const { price } = JSON.parse(response.text);
      setPredictedPrice(price);
    } catch (error) {
      console.error("Profit prediction failed:", error);
      toast.error('Failed to predict price');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="p-12 space-y-12">
      <header className="space-y-4">
        <span className="display-text opacity-40">Business Intelligence</span>
        <h1 className="editorial-title text-6xl">Profitability Predictor</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="glass-panel p-8">
          <CardHeader>
            <CardTitle className="editorial-title text-3xl flex items-center gap-4">
              <DollarSign className="w-8 h-8" />
              Analyze Blueprint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="display-text text-[9px] opacity-40">Total Material Cost ($)</label>
              <input 
                type="number" 
                className="w-full bg-muted/50 border-none p-4 text-sm font-bold focus:ring-1 ring-foreground/10 outline-none" 
                value={materialCost}
                onChange={(e) => setMaterialCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <Button 
              className="w-full bg-foreground text-background hover:opacity-80" 
              onClick={handlePredict}
              disabled={isPredicting || !materialCost}
            >
              {isPredicting ? 'Analyzing...' : 'Predict Sweet Spot Price'}
            </Button>
          </CardContent>
        </Card>

        {predictedPrice !== null && (
          <Card className="glass-panel p-8 bg-muted/20">
            <CardHeader>
              <CardTitle className="editorial-title text-3xl flex items-center gap-4">
                <TrendingUp className="w-8 h-8" />
                Prediction Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-6xl font-bold editorial-title">${predictedPrice.toFixed(2)}</p>
              <p className="text-sm opacity-60 mt-4">This price point maximizes your margin while remaining competitive in the high-end faux botanical market.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
