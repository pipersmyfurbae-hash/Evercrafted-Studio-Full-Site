import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Image, Upload, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { toast } from 'sonner';

export default function MoodboardParser() {
  const [image, setImage] = useState<string | null>(null);
  const [dna, setDna] = useState<any>(null);
  const [isParsing, setIsParsing] = useState(false);

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

  const handleParse = async () => {
    if (!image) return;
    setIsParsing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: {
          parts: [
            { text: "Analyze this moodboard and extract its 'Emotional DNA'. Identify key colors, textures, shapes, and the overall design intent. Return a JSON object with these fields." },
            { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              colors: { type: Type.ARRAY, items: { type: Type.STRING } },
              textures: { type: Type.ARRAY, items: { type: Type.STRING } },
              shapes: { type: Type.ARRAY, items: { type: Type.STRING } },
              intent: { type: Type.STRING }
            },
            required: ["colors", "textures", "shapes", "intent"]
          }
        }
      });

      setDna(JSON.parse(response.text));
    } catch (error) {
      console.error("Moodboard parsing failed:", error);
      toast.error('Failed to parse moodboard');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="p-12 space-y-12">
      <header className="space-y-4">
        <span className="display-text opacity-40">Business Intelligence</span>
        <h1 className="editorial-title text-6xl">AI Moodboard Parser</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="glass-panel p-8">
          <CardHeader>
            <CardTitle className="editorial-title text-3xl flex items-center gap-4">
              <Image className="w-8 h-8" />
              Upload Moodboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-foreground/20 p-8 text-center">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 opacity-50" />
                <span>Upload moodboard image</span>
              </label>
              {image && <img src={image} alt="Preview" className="mt-4 max-h-48 mx-auto" />}
            </div>
            <Button 
              className="w-full bg-foreground text-background hover:opacity-80" 
              onClick={handleParse}
              disabled={isParsing || !image}
            >
              {isParsing ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Parse Emotional DNA
            </Button>
          </CardContent>
        </Card>

        {dna && (
          <Card className="glass-panel p-8 bg-muted/20">
            <CardHeader>
              <CardTitle className="editorial-title text-3xl flex items-center gap-4">
                <BrainCircuit className="w-8 h-8" />
                Emotional DNA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-bold mb-2">Intent</h3>
                <p className="opacity-80">{dna.intent}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Colors</h3>
                <div className="flex gap-2">
                  {dna.colors.map((c: string, i: number) => <span key={i} className="px-2 py-1 bg-background/50 border border-foreground/5">{c}</span>)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
