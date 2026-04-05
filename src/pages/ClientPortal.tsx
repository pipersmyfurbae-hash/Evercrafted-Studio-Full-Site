import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { AppCard } from '../components/AppCard';
import { BrainCircuit, PackageSearch, PenTool, Sparkles, ShoppingBag, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

import { checkFeatureAccess, Tier } from '../services/tierService';

import { buttonVariants } from '../components/ui/button';
import { cn } from '../lib/utils';

export default function ClientPortal() {
  const { user, userData } = useAuth();
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(4)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentProjects(docs);
    });

    return () => unsubscribe();
  }, [user]);

  const allApps = [
    { title: "Memory Weaver", link: "/app/apps/memory", icon: <BrainCircuit className="w-5 h-5" />, description: "AI-driven trend and memory analysis." },
    { title: "Inventory Weaver", link: "/app/apps/inventory", icon: <PackageSearch className="w-5 h-5" />, description: "Smart inventory management and matching.", feature: 'hasInventoryWeaver' },
    { title: "Design Studio", link: "/app/apps/studio", icon: <PenTool className="w-5 h-5" />, description: "Full-featured wreath design environment.", feature: 'hasDesignStudio' },
    { title: "Motion Engine", link: "/app/apps/motion", icon: <Sparkles className="w-5 h-5" />, description: "Animate your designs.", feature: 'hasDesignStudio' },
    { title: "Creator Upload", link: "/app/apps/upload", icon: <Sparkles className="w-5 h-5" />, description: "Auto-publish your designs to the market.", feature: 'hasCreatorUpload' },
  ];

  const userTier = (userData?.tier || 'free') as Tier;
  const apps = allApps.filter(app => {
    if (!app.feature) return true;
    return checkFeatureAccess(userTier, app.feature as any);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-16">
      <header className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-[1px] w-8 bg-primary/30" />
          <span className="display-text text-primary/60 uppercase tracking-[0.2em] text-[10px]">Studio Hub</span>
        </div>
        <h1 className="text-6xl editorial-title text-primary">Your Studio</h1>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-sage-ll text-sage-d text-[10px] font-bold uppercase tracking-widest rounded-none">
            Tier: {userData?.tier || 'Free'}
          </div>
          <p className="text-muted-studio/60 font-serif italic">Welcome back, {user?.displayName || 'Maker'}.</p>
        </div>
      </header>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="display-text text-sm uppercase tracking-[0.2em]">Your Recent Projects</h2>
          <Link to="/app/projects" className={cn(buttonVariants({ variant: "ghost" }), "text-[10px] uppercase tracking-widest group")}>
            View All <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProjects.map((project) => (
              <Card key={project.id} className="group border border-ink/5 bg-white overflow-hidden hover:border-ink/20 transition-all">
                <div className="aspect-square relative overflow-hidden bg-cream">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-studio/20">
                      <PenTool className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-[10px] uppercase tracking-widest truncate">{project.name}</h3>
                  <p className="text-[9px] text-muted-studio/40 mt-1 uppercase tracking-tighter">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-ink/10 bg-white/20 text-muted-studio/40">
            <Plus className="w-8 h-8 mb-4 opacity-20" />
            <p className="font-serif italic text-xs">No projects yet. Start by using an app below.</p>
          </div>
        )}
      </section>

      <section className="space-y-8">
        <h2 className="display-text text-sm uppercase tracking-[0.2em]">Studio Apps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {apps.map((app, i) => (
            <AppCard key={i} {...app} />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="display-text text-sm uppercase tracking-[0.2em]">Marketplace</h2>
          <Link to="/app/marketplace" className={cn(buttonVariants({ variant: "ghost" }), "text-[10px] uppercase tracking-widest group")}>
            Explore Market <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <Card className="border border-ink/5 bg-bark/5 p-12 flex flex-col items-center text-center space-y-6">
          <ShoppingBag className="w-12 h-12 text-bark/20" />
          <div className="space-y-2">
            <h3 className="display-text text-lg">Marketplace is Live</h3>
            <p className="text-muted-studio/60 font-serif italic max-w-md mx-auto">
              Browse designs from the community or publish your own to start earning.
            </p>
          </div>
          <Link to="/app/marketplace" className={cn(buttonVariants(), "rounded-none bg-ink text-white uppercase tracking-[0.2em] text-[10px] px-8 h-12")}>
            Go to Marketplace
          </Link>
        </Card>
      </section>
    </div>
  );
}
