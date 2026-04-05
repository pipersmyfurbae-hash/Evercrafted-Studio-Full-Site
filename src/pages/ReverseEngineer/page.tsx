import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, Zap, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { GoogleGenAI } from "@google/genai";
import { BLUEPRINT_RE_SYSTEM_PROMPT } from '../../lib/prompts';

export default function ReverseEngineer() {
  const [inputType, setInputType] = useState<'photo' | 'text' | 'mj'>('photo');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRun = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3.1-pro-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `Analyze this wreath. Estimated size: 24 inches.`,
        config: {
          systemInstruction: BLUEPRINT_RE_SYSTEM_PROMPT,
          responseMimeType: "application/json"
        }
      });
      
      setResult(JSON.parse(response.text));
    } catch (error) {
      console.error("Reverse engineer failed:", error);
      toast.error("Failed to reverse engineer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-serif mb-8">Blueprint Reverse Engineer</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="flex gap-2 p-1 bg-neutral-100 rounded-lg">
            {(['photo', 'text', 'mj'] as const).map(type => (
              <button 
                key={type}
                onClick={() => setInputType(type)}
                className={`flex-1 py-2 rounded-md text-sm font-medium ${inputType === type ? 'bg-white shadow' : ''}`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
          <button 
            onClick={handleRun}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Zap />}
            Reverse Engineer
          </button>
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          {result ? (
            <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          ) : (
            <div className="text-neutral-500 text-center py-20">No output yet.</div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
