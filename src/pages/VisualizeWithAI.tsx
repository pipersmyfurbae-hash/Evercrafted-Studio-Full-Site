import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2, Download, Share2, RefreshCw, Palette, Image as ImageIcon, Wand2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLocation } from 'react-router-dom';
import { QualityGate } from '../components/QualityGate';
import { runOrchestrator } from '../services/BlueprintOrchestrator';
import { normalizeBlueprint } from '../services/transformer';
import { toast } from 'sonner';

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
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [editPrompt, setEditPrompt] = useState('');
  const location = useLocation();
  const blueprintId = location.state?.blueprintId;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
      toast.error('No blueprint loaded. Please select a blueprint first.');
      return;
    }
    setLoading(true);
    try {
      // Robustly get elements
      const rawElements = blueprint.blueprint || (typeof blueprint.elements === 'string' ? JSON.parse(blueprint.elements) : blueprint.elements) || [];
      const elements = normalizeBlueprint(rawElements);
      
      const prompt = `Generate a photorealistic preview of a luxury faux botanical wreath based on this blueprint:
${elements.map((b: any) => `- ${b.element}: ${b.stem_count} stems, placed at ${b.angle_deg}° position, ${b.radius} radius`).join('\n')}
Style: luxury faux botanical, 85mm lens, soft daylight, neutral interior. High-end product photography.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: imageSize
          }
        }
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) throw new Error('No image generated');
      
      setRender({
        render_id: `rnd_${Date.now()}`,
        blueprint_id: blueprintId || 'manual',
        image_url: imageUrl,
        prompt: prompt,
        style: {
          lighting: 'soft daylight',
          camera: '85mm',
          background: 'neutral plaster wall'
        },
        variations: []
      });
      toast.success('Render generated successfully!');
    } catch (error) {
      console.error('Generation failed', error);
      toast.error('Failed to generate render. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!render || !editPrompt.trim()) return;
    setLoading(true);
    
    try {
      // Get base64 from current image
      const base64Data = render.image_url.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: `Edit this wreath image: ${editPrompt}. Maintain the overall composition but apply the requested changes.` }
          ]
        }
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) throw new Error('No image generated');
      
      const newVariation = {
        type: 'edit',
        palette: { primary: 'custom', secondary: 'custom', accent: 'custom' },
        image_url: imageUrl
      };
      
      setRender({
        ...render,
        variations: [...render.variations, newVariation]
      });
      setActiveVariation(imageUrl);
      setEditPrompt('');
      toast.success('Image edited successfully!');
    } catch (error) {
      console.error('Edit failed', error);
      toast.error('Failed to edit image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-serif text-primary">Visualize with AI</h1>
        <p className="text-muted-foreground">Turn your blueprint into a photorealistic preview using Gemini Pro Image.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="min-h-[600px] flex flex-col items-center justify-center p-4 bg-white/40 backdrop-blur-sm border-none shadow-none">
            {render ? (
              <div className="relative w-full">
                <img 
                  src={activeVariation || render.image_url} 
                  alt="Render" 
                  className="w-full h-auto rounded-none shadow-2xl border border-primary/5" 
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button variant="secondary" size="sm" className="rounded-none bg-white/80 backdrop-blur-md">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button variant="secondary" size="sm" className="rounded-none bg-white/80 backdrop-blur-md">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-primary/30 space-y-4">
                <ImageIcon className="w-16 h-16 mx-auto opacity-10" />
                <p className="font-serif italic">Generate a high-fidelity render to see your design come to life.</p>
              </div>
            )}
          </Card>
        </div>
        
        <div className="space-y-6">
          {scoreReport && (
            <Card className="p-6 border-none shadow-none bg-white/40 backdrop-blur-sm">
              <QualityGate 
                blueprint={blueprint} 
                onRepair={(updated) => setBlueprint({ ...blueprint, ...updated })} 
              />
            </Card>
          )}
          
          <Card className="p-6 border-none shadow-none bg-white/40 backdrop-blur-sm space-y-6">
            <div className="space-y-4">
              <h3 className="display-text text-xs text-primary/40 uppercase tracking-widest">Generation Settings</h3>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">Resolution</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1K', '2K', '4K'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={imageSize === size ? 'default' : 'outline'}
                      onClick={() => setImageSize(size)}
                      className="rounded-none h-10 text-xs"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={loading} className="w-full h-12 rounded-none bg-primary text-primary-foreground shadow-none">
                {loading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2" />}
                Generate High-End Render
              </Button>
            </div>

            <div className="pt-6 border-t border-primary/5 space-y-4">
              <h3 className="display-text text-xs text-primary/40 uppercase tracking-widest">AI Image Editor</h3>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">Edit with Text</label>
                <textarea 
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g. Add more red berries, make it moodier, change background to dark wood..." 
                  className="w-full border border-primary/10 rounded-none p-3 text-sm font-serif italic bg-white/50 focus:bg-white transition-colors h-24 resize-none"
                />
                <Button onClick={handleEdit} disabled={loading || !render || !editPrompt.trim()} className="w-full h-12 rounded-none variant-outline border-primary/20 text-primary hover:bg-primary/5">
                  <Wand2 className="mr-2 w-4 h-4" />
                  Apply AI Edit
                </Button>
              </div>
            </div>
          </Card>

          {render && render.variations.length > 0 && (
            <Card className="p-6 border-none shadow-none bg-white/40 backdrop-blur-sm">
              <h3 className="display-text text-xs text-primary/40 uppercase tracking-widest mb-4">Studio Variations</h3>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`aspect-square border-2 transition-all cursor-pointer ${!activeVariation ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setActiveVariation(null)}
                >
                  <img src={render.image_url} alt="Original" className="w-full h-full object-cover" />
                </div>
                {render.variations.map((v, i) => (
                  <div 
                    key={i} 
                    className={`aspect-square border-2 transition-all cursor-pointer ${activeVariation === v.image_url ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setActiveVariation(v.image_url)}
                  >
                    <img src={v.image_url} alt={`Variation ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
