import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PackageSearch, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { createProject } from '../services/projectService';
import { toast } from 'sonner';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function InventoryWeaver() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'inventory'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventory(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const generateFromInventory = async () => {
    if (inventory.length === 0 || !user) {
      toast.error("Add items to your inventory first!");
      return;
    }
    
    setGenerating(true);
    setResult(null);
    setSaved(false);

    try {
      const inventoryContext = inventory.map(item => 
        `${item.name} (${item.category}, ${item.role}, Qty: ${item.qtyOnHand})`
      ).join(', ');

      const response = await fetch('/blueprint/from-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprint: [], // Or pass current blueprint context if applicable
          inventory: inventory
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      const parsed = await response.json();
      setResult(parsed);

      // Save to Projects
      try {
        await createProject({
          userId: user.uid,
          name: parsed.name || 'Inventory Design',
          source: 'Inventory Weaver',
          blueprint: parsed.blueprint,
          render: parsed.render_prompt || '',
          status: 'active'
        });
        setSaved(true);
        toast.success("Design saved to projects!");
      } catch (error) {
        console.error("Error saving project:", error);
      }
    } catch (error) {
      console.error("Error generating design:", error);
      toast.error("Failed to generate design");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-[1px] w-8 bg-primary/30" />
          <span className="display-text text-primary/60 uppercase tracking-[0.2em] text-[10px]">Inventory Intelligence</span>
        </div>
        <h1 className="text-5xl editorial-title text-primary">Inventory Weaver</h1>
        <p className="text-muted-foreground max-w-xl font-serif italic">
          Design wreath blueprints using ONLY the materials currently available in your studio inventory.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-none bg-white/40 backdrop-blur-sm">
            <CardHeader className="px-8 py-6 border-b border-primary/5">
              <CardTitle className="display-text text-sm">Available Inventory</CardTitle>
              <CardDescription className="font-serif italic text-xs">Items currently in your studio.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {loading ? (
                <div className="flex items-center gap-2 text-primary/40 font-serif italic text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading inventory...
                </div>
              ) : inventory.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {inventory.map(item => (
                      <div key={item.id} className="p-3 bg-white border border-primary/5 flex justify-between items-center group hover:border-primary/20 transition-all">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest">{item.name}</p>
                          <p className="text-[8px] text-primary/40 uppercase tracking-tighter">{item.category} • {item.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-mono text-sage-d">x{item.qtyOnHand}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-[0.2em] text-xs font-bold mt-4" 
                    onClick={generateFromInventory}
                    disabled={generating || inventory.length === 0}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Weaving Design...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate from Stock
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4 border border-dashed border-primary/10 bg-white/20">
                  <PackageSearch className="w-8 h-8 mx-auto opacity-20" />
                  <p className="text-xs uppercase tracking-widest text-primary/40">Inventory is empty</p>
                  <Button variant="outline" size="sm" className="rounded-none text-[10px] uppercase tracking-widest">
                    Add Items
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="border-none shadow-none bg-white/40 backdrop-blur-sm h-full min-h-[600px] flex flex-col">
            <CardHeader className="px-8 py-6 border-b border-primary/5">
              <CardTitle className="display-text text-sm">Design Output</CardTitle>
              <CardDescription className="font-serif italic text-xs">Stock-aware blueprint and render prompt.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 flex-1">
              {result ? (
                <div className="space-y-12">
                  {saved && (
                    <div className="flex items-center gap-3 text-sage-d bg-sage-ll/30 p-4 border border-sage-ll">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-sans font-medium text-xs tracking-tight uppercase">Design saved to your projects.</span>
                    </div>
                  )}

                  <div className="space-y-6">
                    <h2 className="text-3xl editorial-title text-primary">{result.name}</h2>
                    <p className="text-muted-foreground font-serif italic">{result.description}</p>
                  </div>

                  <div className="space-y-6">
                    <h3 className="display-text text-xs text-primary/40 uppercase tracking-widest">Stock-Aware Blueprint</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.blueprint?.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 bg-white border border-primary/5 flex justify-between items-center">
                          <div className="space-y-1">
                            <p className="font-sans font-semibold text-xs uppercase tracking-widest">{item.element}</p>
                            <p className="text-[10px] text-primary/40 uppercase tracking-tighter">{item.category} • {item.radius}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-mono text-[10px] text-sage-d">x{item.stem_count}</p>
                            <p className="text-[10px] text-primary/40 uppercase tracking-widest">{item.angle_deg}°</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="display-text text-xs text-primary/40 uppercase tracking-widest">Render Prompt</h3>
                    <div className="bg-primary/5 p-6 border border-primary/10 font-mono text-[11px] leading-relaxed text-primary/70">
                      {result.render_prompt}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-primary/20 space-y-6">
                  <Sparkles className="w-16 h-16 opacity-10" />
                  <div className="text-center space-y-1">
                    <p className="display-text text-xs uppercase tracking-widest">Ready to Weave</p>
                    <p className="font-serif italic text-sm">Select "Generate from Stock" to begin.</p>
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
