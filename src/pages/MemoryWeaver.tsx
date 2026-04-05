import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BrainCircuit, Loader2, Image as ImageIcon, ListOrdered, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { QualityGate } from '../components/QualityGate';
import { runOrchestrator } from '../services/BlueprintOrchestrator';
import { translateEmotion } from '../services/emotionTranslator';

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

import { createProject } from '../services/projectService';

export default function MemoryWeaver() {
  const { user } = useAuth();
  const [memory, setMemory] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const generateBlueprint = async () => {
    if (!memory.trim() || !user) return;
    setLoading(true);
    setResult(null);
    setSaved(false);

    try {
      // 1. Translate Emotion
      const emotionProfile = await translateEmotion(memory);

      // Fetch saved trends
      const trendsQuery = query(collection(db, 'savedTrends'), where('userId', '==', user.uid));
      const trendsSnapshot = await getDocs(trendsQuery);
      const savedTrends = trendsSnapshot.docs.map(doc => doc.data().trendDescription);
      const trendsContext = savedTrends.length > 0 ? `Consider these saved trends: ${savedTrends.join(', ')}.` : '';

      const response = await fetch('/blueprint/from-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${memory}. Context: ${trendsContext}` })
      });

      if (!response.ok) throw new Error('Failed to generate blueprint');
      const parsedResult = await response.json();
      
      // Ensure the parsed result uses the emotion profile we generated
      parsedResult.emotion_profile = emotionProfile;

      // Run Orchestrator
      const { report } = await runOrchestrator(parsedResult, emotionProfile);
      
      setResult({ ...parsedResult, report });

      // Save to Projects
      try {
        await createProject({
          userId: user.uid,
          name: (parsedResult.name || 'Untitled Design').substring(0, 199),
          source: 'Memory Weaver',
          blueprint: parsedResult.blueprint,
          render: parsedResult.render_prompt,
          status: 'active'
        });
        setSaved(true);
      } catch (error) {
        console.error('Error saving project:', error);
      }
    } catch (error) {
      console.error('Error generating blueprint:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-[1px] w-8 bg-primary/30" />
          <span className="display-text text-primary/60">Creative Intelligence</span>
        </div>
        <h1 className="text-5xl editorial-title text-primary">
          Memory Weaver
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Transforms personal memories and emotional prompts into professionally designed wreaths.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-none bg-white/40 backdrop-blur-sm">
            <CardHeader className="px-8 py-6 border-b border-primary/5">
              <CardTitle className="display-text text-sm text-primary/60">Memory Input</CardTitle>
              <CardDescription className="font-serif italic text-xs">Tell us about a memory you'd like to preserve...</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Textarea 
                placeholder="My grandmother's garden in spring. Soft pink roses, white daisies, morning light filtering through the trees. Peaceful and full of love."
                className="min-h-[240px] resize-none rounded-none border-primary/10 bg-white/50 focus:bg-white transition-colors text-sm font-serif italic leading-relaxed"
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
              />
              <Button 
                className="w-full h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 shadow-none transition-all" 
                onClick={generateBlueprint}
                disabled={loading || !memory.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Weaving Memory...
                  </>
                ) : (
                  'Generate Design Package'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="border-none shadow-none bg-white/40 backdrop-blur-sm h-full min-h-[600px] flex flex-col">
            <CardHeader className="px-8 py-6 border-b border-primary/5 bg-primary/[0.02]">
              <CardTitle className="display-text text-sm text-primary/60">Design Package</CardTitle>
              <CardDescription className="font-serif italic text-xs">The deterministic output of your memory.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 flex-1">
              {result ? (
                <div className="space-y-12">
                  {saved && (
                    <div className="flex items-center gap-3 text-primary bg-primary/5 p-4 rounded-none border border-primary/10">
                      <CheckCircle2 className="w-5 h-5 text-primary/60" />
                      <span className="font-sans font-medium text-xs tracking-tight uppercase">Design blueprint saved to your account.</span>
                    </div>
                  )}
                  
                  {result.report && (
                    <QualityGate 
                      blueprint={result} 
                      emotionProfile={result.emotion_profile} 
                      onRepair={(updatedBlueprint) => setResult({ ...result, ...updatedBlueprint })} 
                    />
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Emotion Profile */}
                    <section className="space-y-6">
                      <h3 className="display-text text-xs text-primary/40 uppercase tracking-widest flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" /> Emotion Profile
                      </h3>
                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                          {result.emotion_profile?.colors?.map((color: string) => (
                            <span key={color} className="px-3 py-1 bg-primary/5 text-primary text-[10px] uppercase tracking-wider font-medium border border-primary/10">
                              {color}
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-6 text-sm">
                          <div className="space-y-1">
                            <span className="display-text text-[10px] text-primary/40 uppercase tracking-widest block">Intent</span>
                            <span className="font-serif italic text-primary">{result.emotion_profile?.intent}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="display-text text-[10px] text-primary/40 uppercase tracking-widest block">Contrast</span>
                            <span className="font-serif italic text-primary capitalize">{result.emotion_profile?.contrast}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="display-text text-[10px] text-primary/40 uppercase tracking-widest block">Shapes</span>
                            <span className="font-serif italic text-primary capitalize">{result.emotion_profile?.shapes}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="display-text text-[10px] text-primary/40 uppercase tracking-widest block">Density</span>
                            <span className="font-serif italic text-primary capitalize">{result.emotion_profile?.density}</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Render Prompt */}
                    <section className="space-y-6">
                      <h3 className="display-text text-xs text-primary/40 uppercase tracking-widest flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Render Prompt
                      </h3>
                      <div className="bg-primary/5 p-6 border border-primary/10 font-mono text-[11px] leading-relaxed text-primary/70">
                        {result.render_prompt}
                      </div>
                    </section>
                  </div>

                  {/* Trend Alignment */}
                  {result.trend_alignment && (
                    <section className="space-y-6">
                      <h3 className="display-text text-xs text-primary/40 uppercase tracking-widest flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" /> Trend Alignment
                      </h3>
                      <div className="bg-primary/5 p-6 border border-primary/10 font-serif italic text-primary/80 leading-relaxed">
                        {result.trend_alignment}
                      </div>
                    </section>
                  )}

                  {/* Blueprint */}
                  <section className="space-y-6">
                    <h3 className="display-text text-xs text-primary/40 uppercase tracking-widest flex items-center gap-2">
                      <ListOrdered className="w-4 h-4" /> Composition Blueprint
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.blueprint?.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 bg-white/60 border border-primary/5 rounded-none text-sm flex justify-between items-center hover:border-primary/20 transition-all group">
                          <div className="space-y-1">
                            <p className="font-sans font-semibold text-primary tracking-tight">{item.element}</p>
                            <p className="text-[10px] text-primary/40 uppercase tracking-widest">{item.category} • {item.radius} radius</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-mono text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded-none inline-block">{item.angle_deg}°</p>
                            <p className="text-[10px] text-primary/40 uppercase tracking-widest block">{item.stem_count} stems</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Build Guide */}
                  <section className="space-y-6">
                    <h3 className="display-text text-xs text-primary/40 uppercase tracking-widest flex items-center gap-2">
                      <ListOrdered className="w-4 h-4" /> Build Instructions
                    </h3>
                    <div className="bg-white/60 p-8 border border-primary/5">
                      <ol className="space-y-4">
                        {result.build_guide?.map((step: string, idx: number) => (
                          <li key={idx} className="flex gap-4 text-sm text-primary/80 leading-relaxed">
                            <span className="display-text text-primary/20 text-xl leading-none">{(idx + 1).toString().padStart(2, '0')}</span>
                            <span className="font-serif italic">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-primary/20 space-y-6">
                  <BrainCircuit className="w-16 h-16 opacity-10" />
                  <div className="text-center space-y-1">
                    <p className="display-text text-xs uppercase tracking-widest">Awaiting Memory Input</p>
                    <p className="font-serif italic text-sm">Your generated design package will appear here.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
