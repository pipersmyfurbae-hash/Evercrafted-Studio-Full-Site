import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Heart, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';

export default function CustomerRetention() {
  const [customerData, setCustomerData] = useState('');
  const [strategy, setStrategy] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `Analyze the following customer data and suggest personalized retention strategies: "${customerData}". Provide actionable advice to improve customer loyalty.`,
      });

      setStrategy(response.text || '');
    } catch (error) {
      console.error("Retention analysis failed:", error);
      toast.error('Failed to analyze retention strategies');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-12 space-y-12">
      <header className="space-y-4">
        <span className="display-text opacity-40">Workflow & Productivity</span>
        <h1 className="editorial-title text-6xl">AI Customer Retention</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="glass-panel p-8">
          <CardHeader>
            <CardTitle className="editorial-title text-3xl flex items-center gap-4">
              <Users className="w-8 h-8" />
              Customer Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="display-text text-[9px] opacity-40">Customer Insights</label>
              <textarea 
                className="w-full bg-muted/50 border-none p-4 text-sm font-bold focus:ring-1 ring-foreground/10 outline-none h-32" 
                value={customerData}
                onChange={(e) => setCustomerData(e.target.value)}
                placeholder="e.g., Customer A purchased 3 wreaths, hasn't ordered in 6 months. Customer B is a frequent buyer of summer collections."
              />
            </div>
            <Button 
              className="w-full bg-foreground text-background hover:opacity-80" 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !customerData}
            >
              {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Generate Strategy
            </Button>
          </CardContent>
        </Card>

        {strategy && (
          <Card className="glass-panel p-8 bg-muted/20">
            <CardHeader>
              <CardTitle className="editorial-title text-3xl flex items-center gap-4">
                <Heart className="w-8 h-8" />
                Retention Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none opacity-80 whitespace-pre-wrap">
                {strategy}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
