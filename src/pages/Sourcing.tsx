import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { MapPin, Search, Loader2, Store, Globe, ExternalLink } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Sourcing() {
  const [queryText, setQuery] = useState('');
  const [results, setResults] = useState<{text: string, groundingChunks?: any[]} | any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'maps' | 'search' | 'local'>('maps');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    setLoading(true);
    setResults(null);

    try {
      if (searchType === 'local') {
        const q = query(collection(db, 'inventory'));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filtered = items.filter((item: any) => item.name.toLowerCase().includes(queryText.toLowerCase()));
        setResults(filtered);
      } else {
        const tools = searchType === 'maps' ? [{ googleMaps: {} }] : [{ googleSearch: {} }];
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: queryText,
          config: {
            tools: tools as any
          }
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        setResults({
          text: response.text || 'No detailed information found.',
          groundingChunks
        });
      }
    } catch (error) {
      console.error('Error searching:', error);
      setResults({ text: 'Failed to perform search. Please check your API key and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <header className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-[1px] w-8 bg-primary/30" />
          <span className="display-text text-primary/60">Global Resources</span>
        </div>
        <h1 className="text-5xl editorial-title text-primary">
          Sourcing & Inspiration
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Find local floral suppliers or search the web for current wreath trends and materials.
        </p>
      </header>

      <Card className="border-none shadow-none bg-white/40 backdrop-blur-sm">
        <CardHeader className="px-8 py-6 border-b border-primary/5 bg-primary/[0.02]">
          <CardTitle className="display-text text-sm text-primary/60">Search Studio</CardTitle>
          <CardDescription className="font-serif italic text-xs">Use Google Maps, Google Search, or search our local inventory.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant={searchType === 'maps' ? 'default' : 'outline'} 
                onClick={() => setSearchType('maps')}
                className={`flex-1 h-12 rounded-none shadow-none transition-all ${
                  searchType === 'maps' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-transparent border-primary/10 text-primary/60 hover:bg-primary/5'
                }`}
              >
                <MapPin className="w-4 h-4 mr-2" /> 
                <span className="display-text text-xs uppercase tracking-widest">Maps</span>
              </Button>
              <Button 
                type="button" 
                variant={searchType === 'search' ? 'default' : 'outline'} 
                onClick={() => setSearchType('search')}
                className={`flex-1 h-12 rounded-none shadow-none transition-all ${
                  searchType === 'search' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-transparent border-primary/10 text-primary/60 hover:bg-primary/5'
                }`}
              >
                <Search className="w-4 h-4 mr-2" /> 
                <span className="display-text text-xs uppercase tracking-widest">Web</span>
              </Button>
              <Button 
                type="button" 
                variant={searchType === 'local' ? 'default' : 'outline'} 
                onClick={() => setSearchType('local')}
                className={`flex-1 h-12 rounded-none shadow-none transition-all ${
                  searchType === 'local' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-transparent border-primary/10 text-primary/60 hover:bg-primary/5'
                }`}
              >
                <Store className="w-4 h-4 mr-2" /> 
                <span className="display-text text-xs uppercase tracking-widest">Local</span>
              </Button>
            </div>

            <div className="flex gap-4">
              <Input 
                value={queryText} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder={searchType === 'maps' ? "e.g. Wholesale florists near me" : searchType === 'local' ? "Search inventory..." : "e.g. Trending fall wreath designs 2026"} 
                className="flex-1 h-12 rounded-none border-primary/10 bg-white/50 focus:bg-white transition-colors text-sm font-serif italic"
              />
              <Button type="submit" disabled={loading || !queryText.trim()} className="h-12 px-8 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 shadow-none">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="display-text text-xs uppercase tracking-widest">Search</span>}
              </Button>
            </div>
          </form>

          {results && (
            <div className="mt-12 p-8 bg-white/60 border border-primary/5 rounded-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="display-text text-xs text-primary/40 uppercase tracking-widest mb-6">Results</h3>
              <div className="prose prose-sm max-w-none text-primary/80 font-sans leading-relaxed">
                {Array.isArray(results) ? (
                  <div className="grid gap-4">
                    {results.map((item: any) => (
                      <div key={item.id} className="flex justify-between p-4 border border-primary/5 bg-white/40">
                        <span className="font-serif italic">{item.name} - ${item.costPerUnit}</span>
                        <Button size="sm" variant="ghost" className="text-[10px] uppercase tracking-widest">View in Inventory</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="whitespace-pre-wrap font-serif italic leading-relaxed">{results.text}</p>
                    
                    {results.groundingChunks && results.groundingChunks.length > 0 && (
                      <div className="pt-6 border-t border-primary/5 space-y-3">
                        <p className="text-[10px] uppercase tracking-widest text-primary/40 font-sans font-bold">Verified Sources & Locations</p>
                        <div className="flex flex-wrap gap-2">
                          {results.groundingChunks.map((chunk: any, i: number) => {
                            const uri = chunk.web?.uri || chunk.maps?.uri;
                            const title = chunk.web?.title || chunk.maps?.title || 'View Source';
                            const isMap = !!chunk.maps;
                            
                            if (!uri) return null;
                            
                            return (
                              <a 
                                key={i}
                                href={uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-[10px] font-medium transition-colors border border-primary/5"
                              >
                                {isMap ? <MapPin className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                {title}
                                <ExternalLink className="w-2 h-2 opacity-50" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
