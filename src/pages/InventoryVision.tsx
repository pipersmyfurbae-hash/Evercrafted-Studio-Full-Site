import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Camera, Upload, Loader2, Package, Sparkles } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { toast } from 'sonner';

export default function InventoryVision() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: {
          parts: [
            { text: "Identify the flowers and materials in this workbench image. Return a JSON object with a list of items found, including name and estimated quantity." },
            { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    quantity: { type: Type.INTEGER }
                  },
                  required: ["name", "quantity"]
                }
              }
            },
            required: ["items"]
          }
        }
      });

      setAnalysis(JSON.parse(response.text));
    } catch (error) {
      console.error("Inventory analysis failed:", error);
      toast.error('Failed to analyze inventory');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-12 space-y-12">
      <header className="space-y-4">
        <span className="display-text opacity-40">Business Intelligence</span>
        <h1 className="editorial-title text-6xl">AI Inventory Vision</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="glass-panel p-8">
          <CardHeader>
            <CardTitle className="editorial-title text-3xl flex items-center gap-4">
              <Camera className="w-8 h-8" />
              Scan Workbench
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-foreground/20 p-8 text-center">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 opacity-50" />
                <span>Upload workbench photo</span>
              </label>
              {image && <img src={image} alt="Preview" className="mt-4 max-h-48 mx-auto" />}
            </div>
            <Button 
              className="w-full bg-foreground text-background hover:opacity-80" 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !image}
            >
              {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Analyze Inventory
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <Card className="glass-panel p-8 bg-muted/20">
            <CardHeader>
              <CardTitle className="editorial-title text-3xl flex items-center gap-4">
                <Package className="w-8 h-8" />
                Detected Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between p-4 bg-background/50 border border-foreground/5">
                  <span className="font-bold">{item.name}</span>
                  <span className="opacity-60">{item.quantity}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
