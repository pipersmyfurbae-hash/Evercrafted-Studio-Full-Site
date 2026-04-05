import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MessageSquare, Send, User, Bot, Globe, MapPin, ExternalLink } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'model';
  text: string;
  groundingChunks?: any[];
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat
  const chatRef = useRef<any>(null);

  useEffect(() => {
    chatRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'You are an expert floral designer and assistant for the Evercrafted platform. You help users design wreaths, choose flowers, understand color theory, and manage their inventory. You have access to Google Search and Google Maps to provide real-time information about trends, suppliers, and locations. Your tone is professional, editorial, and inspiring.',
        tools: [
          { googleSearch: {} },
          { googleMaps: {} }
        ]
      }
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatRef.current) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: response.text || 'I processed your request.',
        groundingChunks 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 h-full flex flex-col">
      <header className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-[1px] w-8 bg-primary/30" />
          <span className="display-text text-primary/60">Creative Support</span>
        </div>
        <h1 className="text-5xl editorial-title text-primary">
          Floral Assistant
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Chat with our expert floral design AI for inspiration, technical advice, or inventory help. Now with real-time search and maps.
        </p>
      </header>

      <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-none bg-white/40 backdrop-blur-sm">
        <CardHeader className="px-8 py-6 border-b border-primary/5 bg-primary/[0.02]">
          <CardTitle className="display-text text-sm text-primary/60">Studio Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-8 space-y-8">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-primary/30 space-y-4">
              <MessageSquare className="w-12 h-12 opacity-10" />
              <p className="font-serif italic text-sm">Ask me about floral design, color theory, or find local suppliers.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-10 h-10 rounded-none bg-primary/5 border border-primary/10 flex items-center justify-center text-primary/40 shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                <div className={`px-6 py-4 rounded-none max-w-[80%] shadow-sm space-y-4 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-white text-primary border border-primary/5'
                }`}>
                  <p className={`whitespace-pre-wrap text-sm ${msg.role === 'model' ? 'font-serif italic leading-relaxed' : 'font-sans font-medium tracking-tight'}`}>
                    {msg.text}
                  </p>
                  
                  {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                    <div className="pt-4 border-t border-primary/5 space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-primary/40 font-sans font-bold">Sources & Locations</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.groundingChunks.map((chunk, i) => {
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
                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center text-primary/60 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 rounded-none bg-primary/5 border border-primary/10 flex items-center justify-center text-primary/40 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-6 py-4 rounded-none bg-white text-primary/40 border border-primary/5 text-sm font-serif italic">
                Searching and thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="p-8 border-t border-primary/5 bg-white/60">
          <form onSubmit={handleSend} className="flex gap-4">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type your message..." 
              className="flex-1 h-12 rounded-none border-primary/10 bg-white/50 focus:bg-white transition-colors"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()} className="h-12 w-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 shadow-none">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
