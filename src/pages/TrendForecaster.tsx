import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, TrendingUp, Save } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { toast } from 'sonner';
import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function TrendForecaster() {
  const [trends, setTrends] = useState<string[]>([]);
  const [isForecasting, setIsForecasting] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const handleForecast = async () => {
    setIsForecasting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `Analyze current trends in high-end floral design and wreath aesthetics from social media. Suggest 3 "Moods" to feature next month. Return a JSON object with a 'trends' key containing an array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trends: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });

      const { trends } = JSON.parse(response.text);
      setTrends(trends);
    } catch (error) {
      console.error("Trend forecasting failed:", error);
      toast.error('Failed to forecast trends');
    } finally {
      setIsForecasting(false);
    }
  };

  const handleSave = async (trend: string) => {
    if (!auth.currentUser) return;
    setSaving(trend);
    try {
      await addDoc(collection(db, 'savedTrends'), {
        userId: auth.currentUser.uid,
        trendDescription: trend,
        createdAt: new Date().toISOString()
      });
      toast.success('Trend saved!');
    } catch (error) {
      console.error("Failed to save trend:", error);
      toast.error('Failed to save trend');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="p-12 space-y-12">
      <header className="space-y-4">
        <span className="display-text opacity-40">Business Intelligence</span>
        <h1 className="editorial-title text-6xl">Seasonal Trend Forecaster</h1>
      </header>

      <div className="grid grid-cols-1 gap-12">
        <Card className="glass-panel p-8">
          <CardHeader>
            <CardTitle className="editorial-title text-3xl flex items-center gap-4">
              <Calendar className="w-8 h-8" />
              Next Month's Moods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              className="w-full bg-foreground text-background hover:opacity-80" 
              onClick={handleForecast}
              disabled={isForecasting}
            >
              {isForecasting ? 'Analyzing Trends...' : 'Forecast Trends'}
            </Button>
            
            {trends.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {trends.map((trend, i) => (
                  <Card key={i} className="glass-panel p-6 bg-muted/20 flex flex-col justify-between">
                    <CardTitle className="editorial-title text-2xl flex items-center gap-2 mb-4">
                      <TrendingUp className="w-6 h-6" />
                      {trend}
                    </CardTitle>
                    <Button 
                      variant="outline"
                      onClick={() => handleSave(trend)}
                      disabled={saving === trend}
                    >
                      {saving === trend ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Trend</>}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
