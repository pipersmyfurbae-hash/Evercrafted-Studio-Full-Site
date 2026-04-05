import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { createProject } from '../services/projectService';
import { TierGuard } from '../components/TierGuard';

export default function PlacementEditor() {
  const { user } = useAuth();
  const [placements, setPlacements] = useState<any[]>([]);
  const [designName, setDesignName] = useState('Untitled Blueprint');
  const [wreathSize, setWreathSize] = useState(24);

  const handleSave = async () => {
    if (!user) return;
    try {
      await createProject({
        userId: user.uid,
        name: designName,
        source: 'QACS Editor',
        blueprint: placements,
        render: '',
        status: 'active'
      });
      toast.success('Blueprint saved to projects!');
    } catch (error) {
      toast.error('Failed to save blueprint');
    }
  };

  const handleAIPlacement = async (prompt: string) => {
    try {
      const response = await fetch('/ai/placement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, wreathSize })
      });
      if (!response.ok) throw new Error('AI placement failed');
      const newPlacements = await response.json();
      setPlacements([...placements, ...newPlacements]);
      toast.success('AI placements added!');
    } catch (error) {
      toast.error('Failed to generate AI placements');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl font-serif italic">QACS Blueprint Editor</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Canvas Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-slate-100 flex items-center justify-center border-2 border-dashed">
                Canvas Preview
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <TierGuard feature="hasDesignStudio">
            <Card>
              <CardHeader>
                <CardTitle>AI Placement Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handleAIPlacement('Place 3 focal flowers in the bottom arc')}>Generate with AI</Button>
              </CardContent>
            </Card>
          </TierGuard>
          <Button onClick={handleSave}>Save Blueprint</Button>
        </div>
      </div>
    </div>
  );
}
