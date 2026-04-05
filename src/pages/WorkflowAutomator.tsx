import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Bot, FileText, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';

export default function WorkflowAutomator() {
  const [task, setTask] = useState('');
  const [result, setResult] = useState('');
  const [isAutomating, setIsAutomating] = useState(false);

  const handleAutomate = async () => {
    setIsAutomating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `Automate the following task for a floral design business: "${task}". Provide a detailed, step-by-step workflow or generated content as needed.`,
      });

      setResult(response.text || '');
    } catch (error) {
      console.error("Workflow automation failed:", error);
      toast.error('Failed to automate workflow');
    } finally {
      setIsAutomating(false);
    }
  };

  return (
    <div className="p-12 space-y-12">
      <header className="space-y-4">
        <span className="display-text opacity-40">Workflow & Productivity</span>
        <h1 className="editorial-title text-6xl">AI Workflow Automator</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="glass-panel p-8">
          <CardHeader>
            <CardTitle className="editorial-title text-3xl flex items-center gap-4">
              <Bot className="w-8 h-8" />
              Define Task
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="display-text text-[9px] opacity-40">Task Description</label>
              <textarea 
                className="w-full bg-muted/50 border-none p-4 text-sm font-bold focus:ring-1 ring-foreground/10 outline-none h-32" 
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="e.g., Generate a build guide for a rustic wreath, or write an Etsy listing for a spring collection."
              />
            </div>
            <Button 
              className="w-full bg-foreground text-background hover:opacity-80" 
              onClick={handleAutomate}
              disabled={isAutomating || !task}
            >
              {isAutomating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Automate Task
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="glass-panel p-8 bg-muted/20">
            <CardHeader>
              <CardTitle className="editorial-title text-3xl flex items-center gap-4">
                <FileText className="w-8 h-8" />
                Automation Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none opacity-80 whitespace-pre-wrap">
                {result}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
