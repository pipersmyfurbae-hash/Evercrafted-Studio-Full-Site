import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, BarChart3, DollarSign, Package, Upload, Loader2, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';

import { buttonVariants } from '../components/ui/button';
import { cn } from '../lib/utils';

import { createProject } from '../services/projectService';

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [designs, setDesigns] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'designs'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDesigns(docs);
    });

    return () => unsubscribe();
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setUploadProgress('Analyzing design...');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', user.uid);

      const response = await fetch('/api/upload-design', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      
      // Save as a Project as well
      await createProject({
        userId: user.uid,
        name: result.title,
        source: 'Creator Studio',
        blueprint: result.blueprint,
        render: result.renderPreview,
        status: 'active'
      });

      toast.success('Design published and saved to projects!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to publish design');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const stats = [
    { title: 'Total Revenue', value: '$2,160', icon: DollarSign, color: 'text-sage-d' },
    { title: 'Total Sales', value: designs.length * 12, icon: Package, color: 'text-bark' },
    { title: 'Conversion Rate', value: '4.2%', icon: BarChart3, color: 'text-sage' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[1px] w-8 bg-primary/30" />
            <span className="display-text text-primary/60">Creator Studio</span>
          </div>
          <h1 className="text-5xl editorial-title text-primary">Creator Dashboard</h1>
          <p className="text-muted-foreground font-serif italic">Manage your designs, track sales, and publish new creations.</p>
        </div>
        
        <div className="relative">
          <input
            type="file"
            id="design-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
            accept="image/*"
          />
          <Button 
            className="h-12 rounded-none bg-ink text-white hover:bg-ink/90 uppercase tracking-[0.2em] text-xs font-bold px-8"
          >
            <label htmlFor="design-upload" className="cursor-pointer flex items-center gap-2">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Publish New Design
                </>
              )}
            </label>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-none bg-white/40 backdrop-blur-sm p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
              <CardTitle className="display-text text-[0.6rem] uppercase tracking-widest text-primary/60">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-3xl font-bold text-ink">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              <CardTitle className="display-text text-sm">Your Published Designs</CardTitle>
              <CardDescription className="font-serif italic">Designs reverse-engineered and listed in the marketplace.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {designs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {designs.map((design) => (
                    <Card key={design.id} className="group border border-ink/5 bg-white overflow-hidden hover:border-ink/20 transition-all">
                      <div className="aspect-square relative overflow-hidden bg-cream">
                        <img 
                          src={design.imageUrl} 
                          alt={design.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors" />
                      </div>
                      <CardContent className="p-4 space-y-2">
                        <h3 className="font-bold text-xs uppercase tracking-widest truncate">{design.title}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">Score: {design.score}%</span>
                          <span className="text-xs font-bold text-sage-d">{design.price}</span>
                        </div>
                        <Button variant="ghost" className="w-full h-8 rounded-none text-[10px] uppercase tracking-widest mt-2 group-hover:bg-cream">
                          View Listing <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center border border-dashed border-ink/10 bg-white/20 text-muted-foreground">
                  <Package className="w-8 h-8 mb-4 opacity-20" />
                  <p className="font-serif italic text-sm">No designs published yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-none bg-sage-ll/30 p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="display-text text-sm">AI Insights</CardTitle>
              <CardDescription className="font-serif italic">Market trends and design suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="p-4 bg-white/60 border border-sage/10 space-y-2">
                <div className="flex items-center gap-2 text-sage-d">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Trending Now</span>
                </div>
                <p className="text-xs font-serif italic">"Velvet textures and deep burgundy tones are seeing a 24% increase in search volume."</p>
              </div>
              <div className="p-4 bg-white/60 border border-sage/10 space-y-2">
                <div className="flex items-center gap-2 text-bark">
                  <BarChart3 className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Optimization Tip</span>
                </div>
                <p className="text-xs font-serif italic">"Adding more 'filler' elements to your blueprints increases perceived value without raising material costs."</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
