import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2, Download, Share2, RefreshCw, Palette } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLocation } from 'react-router-dom';
import { QualityGate } from '../components/QualityGate';
import { runOrchestrator } from '../services/BlueprintOrchestrator';

// Interface for the Render Object
interface RenderObject {
  render_id: string;
  blueprint_id: string;
  image_url: string;
  prompt: string;
  style: {
    lighting: string;
    camera: string;
    background: string;
  };
  variations: {
    type: string;
    palette: {
      primary: string;
      secondary: string;
      accent: string;
    };
    image_url: string;
  }[];
}

export default function VisualizeWithAI() {
  const [loading, setLoading] = useState(false);
  const [render, setRender] = useState<RenderObject | null>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [scoreReport, setScoreReport] = useState<any>(null);
  const location = useLocation();
  const blueprintId = location.state?.blueprintId;

  useEffect(() => {
    if (blueprintId) {
      const fetchBlueprint = async () => {
        const docRef = doc(db, 'blueprints', blueprintId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const bpData = docSnap.data();
          setBlueprint(bpData);
          runOrchestrator(bpData as any, bpData.emotion_profile).then(({ report }) => {
            setScoreReport(report);
          });
        }
      };
      fetchBlueprint();
    }
  }, [blueprintId]);

  const [activeVariation, setActiveVariation] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!blueprint) {
      alert('No blueprint loaded. Please select a blueprint first.');
      return;
    }
    setLoading(true);
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Robustly get elements
      const elements = blueprint.blueprint || (typeof blueprint.elements === 'string' ? JSON.parse(blueprint.elements) : blueprint.elements) || [];
      
      const prompt = `Generate a photorealistic preview of a luxury faux botanical wreath based on this blueprint:
${elements.map((b: any) => `- ${b.element}: ${b.stem_count} stems, placed at ${b.clock_position} position, ${b.radius} radius`).join('\n')}
Style: luxury faux botanical, 85mm lens, soft daylight, neutral interior.`;
      
      // In a real implementation, call the AI model here
      // const response = await ai.models.generateContent({ ... });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRender({
        render_id: 'rnd_001',
        blueprint_id: blueprintId,
        image_url: 'https://picsum.photos/seed/wreath1/800/800',
        prompt: prompt,
        style: {
          lighting: 'soft daylight',
          camera: '85mm',
          background: 'neutral plaster wall'
        },
        variations: [
          {
            type: 'colorway',
            palette: { primary: 'blue', secondary: 'green', accent: 'gold' },
            image_url: 'https://picsum.photos/seed/wreath2/400/400'
          }
        ]
      });
    } catch (error) {
      console.error('Generation failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateColorway = async () => {
    if (!render) return;
    setLoading(true);
    const colorInput = document.getElementById('colorInput') as HTMLInputElement;
    const color = colorInput.value || 'random';
    
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newVariation = {
        type: 'colorway',
        palette: { primary: color, secondary: 'green', accent: 'gold' },
        image_url: `https://picsum.photos/seed/${Math.random()}/400/400`
      };
      
      setRender({
        ...render,
        variations: [...render.variations, newVariation]
      });
    } catch (error) {
      console.error('Generation failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-serif text-primary">Visualize with AI</h1>
        <p className="text-muted-foreground">Turn your blueprint into a photorealistic preview.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="min-h-[500px] flex flex-col items-center justify-center p-4">
            {render ? (
              <img src={activeVariation || render.image_url} alt="Render" className="w-full h-auto rounded-lg" />
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Generate a render to see the preview.</p>
              </div>
            )}
          </Card>
        </div>
        
        <div className="space-y-6">
          {scoreReport && (
            <Card className="p-6">
              <QualityGate 
                blueprint={blueprint} 
                emotionProfile={blueprint.emotion_profile} 
                onRepair={(updated) => setBlueprint({ ...blueprint, ...updated })} 
              />
            </Card>
          )}
          <Card className="p-6">
            <CardTitle className="mb-4">Controls</CardTitle>
            <div className="space-y-4">
              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2" />}
                Generate Render
              </Button>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Palette Color</label>
                <input type="text" id="colorInput" placeholder="e.g., Deep Burgundy" className="w-full border rounded p-2" />
                <Button onClick={handleGenerateColorway} disabled={loading} className="w-full" variant="outline">
                  <Palette className="mr-2" />
                  Generate Colorways
                </Button>
              </div>
            </div>
          </Card>

          {render && (
            <Card className="p-6">
              <CardTitle className="mb-4">Variations</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                {render.variations.map((v, i) => (
                  <img 
                    key={i} 
                    src={v.image_url} 
                    alt={`Variation ${i}`} 
                    className="w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition"
                    onClick={() => setActiveVariation(v.image_url)}
                  />
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
