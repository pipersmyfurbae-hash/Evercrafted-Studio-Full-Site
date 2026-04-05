import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PenTool, Search, Filter, ArrowRight, MoreVertical, Trash2, ExternalLink, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { buttonVariants } from '../components/ui/button';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[1px] w-8 bg-primary/30" />
            <span className="display-text text-primary/60 uppercase tracking-[0.2em] text-[10px]">Studio Archive</span>
          </div>
          <h1 className="text-5xl editorial-title text-primary">Your Projects</h1>
          <p className="text-muted-studio/60 font-serif italic">A collection of your generated designs and blueprints.</p>
        </div>
      </header>

      <div className="flex items-center gap-4 bg-white/40 backdrop-blur-sm p-4 border border-ink/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-studio/40" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest">
          <Filter className="w-3 h-3 mr-2" /> Filter
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-none" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="group border border-ink/5 bg-white overflow-hidden hover:border-ink/20 transition-all flex flex-col">
              <div className="aspect-video relative overflow-hidden bg-cream">
                {project.imageUrl ? (
                  <img 
                    src={project.imageUrl} 
                    alt={project.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-studio/20">
                    <PenTool className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Link 
                    to={`/app/blueprint-studio?id=${project.id}`}
                    className={cn(buttonVariants({ variant: "secondary" }), "rounded-none text-[10px] uppercase tracking-widest")}
                  >
                    Open in Studio
                  </Link>
                </div>
              </div>
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm uppercase tracking-widest truncate flex-1 mr-4">{project.name}</h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="text-muted-studio/40 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-studio/60 line-clamp-2 font-serif italic">
                    {project.description || 'No description provided.'}
                  </p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-ink/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-muted-studio/40 uppercase tracking-tighter">
                    <Clock className="w-3 h-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div className="px-2 py-0.5 bg-sage-ll text-sage-d text-[8px] font-bold uppercase tracking-widest">
                    {project.status || 'Active'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="h-96 flex flex-col items-center justify-center border border-dashed border-ink/10 bg-white/20 text-muted-studio/40">
          <PenTool className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-serif italic text-lg">No projects found.</p>
          <p className="text-xs uppercase tracking-widest mt-2">Start by creating a design in one of our apps.</p>
        </div>
      )}
    </div>
  );
}
