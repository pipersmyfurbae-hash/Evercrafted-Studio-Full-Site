import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { createProject } from '../services/projectService';
import { TierGuard } from '../components/TierGuard';

export default function MotionEngine() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !user) return;
    setGenerating(true);
    try {
      // Call engine
      const response = await fetch('/motion/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      });
      if (!response.ok) throw new Error('Motion generation failed');
      
      // Save to project
      await createProject({
        userId: user.uid,
        name: 'Animated Wreath',
        source: 'Motion Engine',
        blueprint: [], // Placeholder
        render: image, // Placeholder for animated output
        motion: { type: 'sway', profile: 'whisper', intensity: 30, duration: 10, fps: 30 },
        status: 'active'
      });
      
      toast.success('Motion generated and saved to project!');
    } catch (error) {
      toast.error('Failed to generate motion');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-serif italic">Motion Engine</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload Render</CardTitle>
        </CardHeader>
        <CardContent>
          <input type="file" accept="image/*" onChange={handleFileUpload} />
          {image && <img src={image} alt="Preview" className="mt-4 max-h-64" />}
          <Button className="mt-4" onClick={handleGenerate} disabled={!image || generating}>
            {generating ? 'Generating...' : 'Generate Motion'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
