import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { createProject } from '../services/projectService';
import { TierGuard } from '../components/TierGuard';

import { useParams } from 'react-router-dom';

export default function MotionEngine() {
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const [motionType, setMotionType] = useState<'rotation' | 'sway'>('sway');
  const [motionIntensity, setMotionIntensity] = useState(30);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!user || !projectId) return;
    setGenerating(true);
    try {
      const response = await fetch('/motion/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId,
          motion_type: motionType,
          motion_intensity: motionIntensity
        })
      });
      if (!response.ok) throw new Error('Motion generation failed');
      
      toast.success('Motion generation initiated!');
    } catch (error) {
      toast.error('Failed to initiate motion generation');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-serif italic">Motion Engine</h1>
      <p>Project ID: {projectId}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Motion Controls</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label>Motion Style</label>
              <select className="w-full p-2 border" value={motionType} onChange={(e) => setMotionType(e.target.value as any)}>
                <option value="sway">Sway (Whisper/Breeze/Statement)</option>
                <option value="rotation">Rotation</option>
              </select>
            </div>
            <div className="space-y-2">
              <label>Intensity: {motionIntensity}</label>
              <input type="range" min="30" max="90" step="30" value={motionIntensity} onChange={(e) => setMotionIntensity(Number(e.target.value))} className="w-full" />
            </div>
            <Button className="w-full" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate Animation'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
