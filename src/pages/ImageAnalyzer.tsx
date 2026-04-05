import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Image as ImageSearch, Upload, Loader2, CheckCircle2, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { createProject } from '../services/projectService';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: any[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function ImageAnalyzer() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [blueprint, setBlueprint] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [genPrompt, setGenPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateImage = async () => {
    if (!genPrompt || !user) return;
    setGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `Generate a high-quality, professional studio photo of a single floral item or botanical element for a wreath design. The item should be on a clean, neutral background. Prompt: ${genPrompt}`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64Data}`;
          setImage(imageUrl);
          setAnalysis(null);
          setSaved(false);
          break;
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeWreath = async () => {
    if (!image || !user) return;
    setLoading(true);
    setAnalysis(null);
    setBlueprint(null);
    setSaved(false);

    try {
      // Convert data URL to Blob for multipart upload
      const response = await fetch(image);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'wreath.jpg');
      // In a real app, we'd fetch the actual inventory here
      formData.append('inventory', JSON.stringify([])); 

      const apiResponse = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) throw new Error('Analysis failed');

      const result = await apiResponse.json();
      setBlueprint(result);

      // Auto-save as project
      try {
        await createProject({
          userId: user.uid,
          name: `Wreath Analysis ${new Date().toLocaleDateString()}`,
          source: 'Image Analyzer',
          blueprint: result,
          render: image,
          status: 'active'
        });
        setSaved(true);
      } catch (error) {
        console.error('Error saving project:', error);
      }
    } catch (error) {
      console.error('Error analyzing wreath:', error);
      toast.error('Failed to analyze wreath');
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of the component UI)

  const saveToInventory = async () => {
    if (!analysis || !user || !image) return;
    setSaving(true);
    
    try {
      // Resize image to ensure it fits in Firestore (1MB limit)
      const resizedImage = await new Promise<string>((resolve) => {
        const img = new Image();
        img.src = image;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      });

      const VALID_ROLES = ['focal', 'secondary', 'accent', 'filler', 'greenery', 'base', 'ribbon'];
      const normalizedRole = VALID_ROLES.find(r => analysis.role.toLowerCase().includes(r)) || 'focal';

      const newDocRef = doc(collection(db, 'inventory'));
      await setDoc(newDocRef, {
        id: newDocRef.id,
        name: analysis.name.substring(0, 99),
        category: analysis.category,
        colorFamily: analysis.colorFamily,
        role: normalizedRole,
        qtyOnHand: 1,
        bloomDiameter: Number(analysis.bloomDiameter) || 0,
        stemLength: Number(analysis.stemLength) || 0,
        costPerUnit: 0,
        supplierSku: '',
        description: analysis.description,
        svg: analysis.svg,
        imageUrl: resizedImage, 
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setSaved(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'inventory');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <header className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-[1px] w-8 bg-primary/30" />
          <span className="display-text text-primary/60">Inventory Tools</span>
        </div>
        <h1 className="text-5xl editorial-title text-primary">
          Wreath Analyzer
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Upload a photo of a full wreath to reverse-engineer its design and generate a production-ready blueprint.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-12">
          {/* ... (Concept Generator Card) */}

          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              <CardTitle className="display-text text-sm">Upload Wreath Image</CardTitle>
              <CardDescription className="font-serif italic">Select a photo of a completed wreath to analyze.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-80 border border-primary/10 rounded-none cursor-pointer bg-white/50 hover:bg-white transition-colors group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-primary/40 mb-4 group-hover:text-primary/60 transition-colors" />
                    <p className="mb-2 text-sm text-primary/60 uppercase tracking-widest font-semibold">
                      Click to upload
                    </p>
                    <p className="text-xs text-primary/40 font-serif italic">PNG, JPG or WEBP (MAX. 5MB)</p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              
              {image && (
                <div className="mt-4 p-4 bg-white border border-primary/5">
                  <img src={image} alt="Preview" className="max-h-80 mx-auto object-contain" />
                </div>
              )}

              <Button 
                className="w-full h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-[0.2em] text-xs font-bold" 
                onClick={analyzeWreath}
                disabled={loading || !image || !user}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Wreath...
                  </>
                ) : (
                  'Analyze Wreath'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-none bg-white/40 backdrop-blur-sm p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="display-text text-sm">Blueprint Results</CardTitle>
              <CardDescription className="font-serif italic">Detected elements and their placement.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {blueprint ? (
                <div className="space-y-8">
                  <div className="space-y-4">
                    {blueprint.map((el, i) => (
                      <div key={i} className="p-4 bg-white border border-primary/5 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest">{el.element}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                            {el.category} • {el.radius} • {el.angle_deg}°
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-mono text-primary/40">SKU: {el.sku || 'N/A'}</p>
                          <p className="text-xs font-bold text-sage-d">x{el.stem_count}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className="w-full h-12 rounded-none bg-ink text-white hover:bg-ink/90 uppercase tracking-[0.2em] text-xs font-bold mt-4" 
                    onClick={() => toast.success('Blueprint saved to studio!')}
                  >
                    Save to Blueprint Studio
                  </Button>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-primary/30 border border-dashed border-primary/10 bg-white/20">
                  <ImageSearch className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-serif italic text-sm">Blueprint results will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
