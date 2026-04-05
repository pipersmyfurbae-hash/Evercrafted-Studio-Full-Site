import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Image as ImageSearch, Upload, Loader2, CheckCircle2, Save, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

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

  const analyzeImage = async () => {
    if (!image || !user) return;
    setLoading(true);
    setAnalysis(null);
    setSaved(false);

    try {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            { text: 'Analyze this floral item. Identify the type of flower/material, the color family, and its role in a wreath (focal, secondary, accent, filler, greenery, base, ribbon). Estimate the bloom diameter in inches. Also, generate a simple, flat, single-color SVG representation (just the <svg> tag and its contents) of this exact item to be used as a placeholder in a design visualizer. Return the result as JSON.' },
            { inlineData: { data: base64Data, mimeType } }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'The name of the flower or item.' },
              category: { type: Type.STRING, description: 'The general category (e.g., rose, eucalyptus).' },
              colorFamily: { type: Type.STRING, description: 'The dominant color family.' },
              role: { type: Type.STRING, description: 'The role in a wreath (focal, secondary, accent, filler, greenery, base, ribbon).' },
              bloomDiameter: { type: Type.NUMBER, description: 'Estimated bloom diameter in inches.' },
              stemLength: { type: Type.NUMBER, description: 'Estimated stem length in inches (if visible, else 0).' },
              svg: { type: Type.STRING, description: 'A valid, simple SVG string representing the item.' },
              description: { type: Type.STRING, description: 'A detailed analysis of the item.' }
            },
            required: ['name', 'category', 'colorFamily', 'role', 'bloomDiameter', 'stemLength', 'svg', 'description']
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        const parsedResult = JSON.parse(resultText);
        setAnalysis(parsedResult);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setLoading(false);
    }
  };

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
          Image Analyzer
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Upload a photo of a floral item to analyze it and automatically add it to your inventory.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-12">
          <Card className="border-none shadow-none bg-white/40 backdrop-blur-sm p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="display-text text-sm">Concept Generator</CardTitle>
              <CardDescription className="font-serif italic">Describe a floral element to generate a concept image.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="space-y-2">
                <Label className="display-text text-[0.6rem] text-primary/60">Prompt</Label>
                <Textarea 
                  placeholder="e.g., A deep burgundy velvet rose with realistic petal textures..."
                  className="rounded-none border-primary/10 bg-white/50 focus:bg-white transition-colors font-serif italic min-h-[100px]"
                  value={genPrompt}
                  onChange={(e) => setGenPrompt(e.target.value)}
                />
              </div>
              <Button 
                className="w-full h-12 rounded-none bg-ink text-white hover:bg-ink/90 uppercase tracking-[0.2em] text-xs font-bold" 
                onClick={generateImage}
                disabled={generating || !genPrompt || !user}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Concept
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              <CardTitle className="display-text text-sm">Upload Image</CardTitle>
              <CardDescription className="font-serif italic">Select a photo to analyze.</CardDescription>
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
                onClick={analyzeImage}
                disabled={loading || !image || !user}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Item'
                )}
              </Button>
              {!user && <p className="text-xs text-destructive text-center font-serif italic">You must be logged in to analyze and save items.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-none bg-white/40 backdrop-blur-sm p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="display-text text-sm">Analysis Results</CardTitle>
              <CardDescription className="font-serif italic">AI breakdown of the floral item.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {analysis ? (
                <div className="space-y-8">
                  {saved && (
                    <div className="flex items-center gap-3 text-primary bg-primary/5 p-4 border border-primary/10">
                      <CheckCircle2 className="w-5 h-5 opacity-60" />
                      <span className="font-serif italic text-sm">Successfully saved to your inventory.</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                    <div className="space-y-2">
                      <Label className="display-text text-[0.6rem] text-primary/60">Name</Label>
                      <Input 
                        className="rounded-none border-primary/10 bg-white/50 focus:bg-white transition-colors"
                        value={analysis.name} 
                        onChange={(e) => setAnalysis({...analysis, name: e.target.value})} 
                        disabled={saved}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="display-text text-[0.6rem] text-primary/60">Category</Label>
                      <Input 
                        className="rounded-none border-primary/10 bg-white/50 focus:bg-white transition-colors"
                        value={analysis.category} 
                        onChange={(e) => setAnalysis({...analysis, category: e.target.value})} 
                        disabled={saved}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="display-text text-[0.6rem] text-primary/60">Color Family</Label>
                      <Input 
                        className="rounded-none border-primary/10 bg-white/50 focus:bg-white transition-colors"
                        value={analysis.colorFamily} 
                        onChange={(e) => setAnalysis({...analysis, colorFamily: e.target.value})} 
                        disabled={saved}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="display-text text-[0.6rem] text-primary/60">Role</Label>
                      <Select 
                        value={analysis.role.toLowerCase()} 
                        onValueChange={(val) => setAnalysis({...analysis, role: val})}
                        disabled={saved}
                      >
                        <SelectTrigger className="rounded-none border-primary/10 bg-white/50 focus:bg-white">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="base">Base</SelectItem>
                          <SelectItem value="greenery">Greenery</SelectItem>
                          <SelectItem value="focal">Focal</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                          <SelectItem value="filler">Filler</SelectItem>
                          <SelectItem value="accent">Accent</SelectItem>
                          <SelectItem value="ribbon">Ribbon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="display-text text-[0.6rem] text-primary/60">Bloom Size (in)</Label>
                      <Input 
                        className="rounded-none border-primary/10 bg-white/50 focus:bg-white transition-colors"
                        type="number"
                        value={analysis.bloomDiameter} 
                        onChange={(e) => setAnalysis({...analysis, bloomDiameter: e.target.value})} 
                        disabled={saved}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="display-text text-[0.6rem] text-primary/60">Stem Length (in)</Label>
                      <Input 
                        className="rounded-none border-primary/10 bg-white/50 focus:bg-white transition-colors"
                        type="number"
                        value={analysis.stemLength} 
                        onChange={(e) => setAnalysis({...analysis, stemLength: e.target.value})} 
                        disabled={saved}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="display-text text-[0.6rem] text-primary/60">Description</Label>
                    <Textarea 
                      className="rounded-none border-primary/10 bg-white/50 focus:bg-white transition-colors font-serif italic"
                      value={analysis.description} 
                      onChange={(e) => setAnalysis({...analysis, description: e.target.value})} 
                      disabled={saved}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="space-y-2">
                      <Label className="display-text text-[0.6rem] text-primary/60 mb-2 block">SVG Preview</Label>
                      <div 
                        className="w-24 h-24 border border-primary/10 bg-white flex items-center justify-center p-3 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-primary/60"
                        dangerouslySetInnerHTML={{ __html: analysis.svg }}
                      />
                    </div>
                  </div>

                  {!saved && (
                    <Button 
                      className="w-full h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-[0.2em] text-xs font-bold mt-4" 
                      onClick={saveToInventory}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save to Inventory
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-primary/30 border border-dashed border-primary/10 bg-white/20">
                  <ImageSearch className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-serif italic text-sm">Analysis results will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
