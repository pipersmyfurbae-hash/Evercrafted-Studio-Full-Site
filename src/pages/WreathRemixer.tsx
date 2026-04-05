import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Zap, Loader2, RefreshCw, FileJson } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';
import { QualityGate } from '../components/QualityGate';
import { runOrchestrator } from '../services/BlueprintOrchestrator';

const MOCK_BLUEPRINT = {
  "wreath_id": "spring-joy-001",
  "size_in": 24,
  "emotion_profile": {
    "colors": ["soft pink", "creamy white", "sage green"],
    "contrast": "low",
    "shapes": "rounded",
    "density": "airy",
    "textures": "soft",
    "intent": "calm"
  },
  "inventory_used": [
    { "name": "pink peony", "category": "focal", "quantity": 3 },
    { "name": "white ranunculus", "category": "focal", "quantity": 3 },
    { "name": "sage eucalyptus", "category": "greenery", "quantity": 5 }
  ],
  "blueprint": [
    { "element": "pink peony", "category": "focal", "clock_position": "12:00", "angle_deg": 0, "radius": "mid", "density": "medium", "stem_count": 3 },
    { "element": "sage eucalyptus", "category": "greenery", "clock_position": "03:00", "angle_deg": 90, "radius": "outer", "density": "high", "stem_count": 5 }
  ],
  "layers": ["base", "greenery", "focal", "filler", "accent"]
};

export default function WreathRemixer() {
  const [blueprint, setBlueprint] = useState(JSON.stringify(MOCK_BLUEPRINT, null, 2));
  const [remixPrompt, setRemixPrompt] = useState('');
  const [remixedBlueprint, setRemixedBlueprint] = useState<any>(null);
  const [isRemixing, setIsRemixing] = useState(false);

  const handleRemix = async () => {
    setIsRemixing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `Remix the following floral wreath blueprint based on this constraint: "${remixPrompt}". 
        Return ONLY the updated JSON blueprint.
        Blueprint: ${blueprint}`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsedBlueprint = JSON.parse(response.text);
      const { report } = await runOrchestrator(parsedBlueprint, parsedBlueprint.emotion_profile);
      
      setRemixedBlueprint({ ...parsedBlueprint, report });
    } catch (error) {
      console.error("Remixing failed:", error);
      toast.error('Failed to remix blueprint');
    } finally {
      setIsRemixing(false);
    }
  };

  return (
    <div className="p-12 space-y-12">
      <header className="space-y-4">
        <span className="display-text opacity-40">Generative Design</span>
        <h1 className="editorial-title text-6xl">AI Wreath Remixer</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="glass-panel p-8">
          <CardHeader>
            <CardTitle className="editorial-title text-3xl flex items-center gap-4">
              <Zap className="w-8 h-8" />
              Remix Blueprint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="display-text text-[9px] opacity-40">Current Blueprint (JSON)</label>
              <textarea 
                className="w-full bg-muted/50 border-none p-4 text-xs font-mono focus:ring-1 ring-foreground/10 outline-none h-64" 
                value={blueprint}
                onChange={(e) => setBlueprint(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="display-text text-[9px] opacity-40">Remix Constraint</label>
              <input 
                className="w-full bg-muted/50 border-none p-4 text-sm font-bold focus:ring-1 ring-foreground/10 outline-none" 
                value={remixPrompt}
                onChange={(e) => setRemixPrompt(e.target.value)}
                placeholder="e.g., make it more dramatic for autumn"
              />
            </div>
            <Button 
              className="w-full bg-foreground text-background hover:opacity-80" 
              onClick={handleRemix}
              disabled={isRemixing || !remixPrompt}
            >
              {isRemixing ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2" />}
              Generate Remix
            </Button>
          </CardContent>
        </Card>

        {remixedBlueprint && (
          <Card className="glass-panel p-8 bg-muted/20">
            <CardHeader>
              <CardTitle className="editorial-title text-3xl flex items-center gap-4">
                <FileJson className="w-8 h-8" />
                Remixed Blueprint
              </CardTitle>
            </CardHeader>
            <CardContent>
              {remixedBlueprint.report && (
                <QualityGate 
                  blueprint={remixedBlueprint} 
                  emotionProfile={remixedBlueprint.emotion_profile} 
                  onRepair={(updated) => setRemixedBlueprint({ ...remixedBlueprint, ...updated })} 
                />
              )}
              <pre className="text-xs font-mono opacity-80 overflow-auto h-96 mt-4">
                {JSON.stringify(remixedBlueprint, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
