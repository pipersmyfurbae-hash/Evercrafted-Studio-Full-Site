// src/pages/ABCLab.tsx

import React, { useState, useEffect } from 'react';
import { Blueprint, WreathDNA, SavedWreathDNA, InventoryItem } from '../types';
import { mutateDNA } from '../services/engine/dnaEngine';
import { compileBlueprint } from '../services/orchestration/blueprintCompiler';
import { saveDNA, getSavedDNA } from '../services/firebase/dnaService';
import { getInventory } from '../services/firebase/inventoryService';
import { auth } from '../lib/firebase';

import { WreathCanvas } from '../components/WreathCanvas';

import { createProject } from '../services/projectService';
import { toast } from 'sonner';

export const ABCLab: React.FC = () => {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [dna, setDna] = useState<WreathDNA | null>(null);
  const [gen, setGen] = useState(0);
  const [mutations, setMutations] = useState(0);
  const [savedDNA, setSavedDNA] = useState<SavedWreathDNA[]>([]);
  const [dnaName, setDnaName] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [debug, setDebug] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSavedDNA();
    fetchInventory();
  }, []);

  const fetchSavedDNA = async () => {
    const data = await getSavedDNA();
    setSavedDNA(data as SavedWreathDNA[]);
  };

  const fetchInventory = async () => {
    if (auth.currentUser) {
      const data = await getInventory(auth.currentUser.uid);
      setInventory(data);
    }
  };

  const saveCurrentDNA = async () => {
    if (!dna || !dnaName || !auth.currentUser) return;
    setSaving(true);
    try {
      // 1. Save DNA (legacy)
      await saveDNA(dnaName, dna);
      
      // 2. Save as Project (unified)
      await createProject({
        userId: auth.currentUser.uid,
        name: dnaName,
        source: 'ABCLab',
        blueprint: blueprint?.elements || [],
        render: '',
        status: 'active'
      });
      
      setDnaName('');
      fetchSavedDNA();
      toast.success('Design saved to projects!');
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error('Failed to save design');
    } finally {
      setSaving(false);
    }
  };

  const loadDNA = (saved: SavedWreathDNA) => {
    setDna(saved.dna);
    const newBlueprint = compileBlueprint({ blueprint_id: `EC-${Date.now().toString(36).toUpperCase()}` }, 'Crescent', saved.dna, 20, inventory);
    setBlueprint(newBlueprint);
    setGen(0);
    setMutations(0);
  };

  const seedBlueprint = (formula: string, emotion: string) => {
    const initialDNA: WreathDNA = {
      cluster_count: 4,
      cluster_weight_distribution: 0.5,
      cluster_spread_deg: 60,
      density_profile: 0.7,
      greenery_direction: 'balanced',
      silhouette_bias: 'mixed',
      greenery_ratio: 0.4,
      focal_ratio: 0.15,
      silence_arc: 30,
      focal_depth: 0.5,
      style_signature: 'abundant',
      color_bias: 'neutral'
    };
    
    setDna(initialDNA);
    const newBlueprint = compileBlueprint({ blueprint_id: `EC-${Date.now().toString(36).toUpperCase()}` }, formula, initialDNA, 20, inventory);
    setBlueprint(newBlueprint);
    setGen(0);
    setMutations(0);
  };

  const mutate = (formula: string) => {
    if (!dna) return;
    const newDNA = mutateDNA(dna, 0.3);
    setDna(newDNA);
    const newBlueprint = compileBlueprint({ blueprint_id: `EC-${Date.now().toString(36).toUpperCase()}` }, formula, newDNA, 20, inventory);
    setBlueprint(newBlueprint);
    setGen(prev => prev + 1);
    setMutations(prev => prev + 1);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-light mb-4">Design Studio (ABC Lab)</h1>
      <div className="flex gap-4 mb-4">
        <button onClick={() => seedBlueprint('Crescent', 'Cozy & Calm')} className="bg-gold text-black px-4 py-2 rounded">Seed Blueprint</button>
        <button onClick={() => mutate('Crescent')} className="bg-sage text-white px-4 py-2 rounded" disabled={!dna}>Mutate DNA</button>
        <button onClick={() => setDebug(!debug)} className={`px-4 py-2 rounded ${debug ? 'bg-red-500 text-white' : 'bg-neutral-200 text-black'}`}>
          {debug ? 'Hide Debug' : 'Show Debug'}
        </button>
        <div className="flex gap-2">
          <input className="border p-2" placeholder="DNA Name" value={dnaName} onChange={(e) => setDnaName(e.target.value)} />
          <button onClick={saveCurrentDNA} className="bg-gold text-black px-4 py-2 rounded" disabled={!dna || !dnaName}>Save DNA</button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-surface p-4 rounded">
          {blueprint && <WreathCanvas blueprint={blueprint} debug={debug} />}
        </div>
        <div className="bg-surface p-4 rounded">
          <h2 className="text-lg mb-2">Metrics</h2>
          <p>Generation: {gen}</p>
          <p>Mutations: {mutations}</p>
          <h2 className="text-lg mt-4 mb-2">DNA State</h2>
          <pre className="text-xs">{JSON.stringify(dna, null, 2)}</pre>
          
          <h2 className="text-lg mt-4 mb-2">DNA Library</h2>
          <div className="space-y-2">
            {savedDNA.map(saved => (
              <div key={saved.id} className="flex justify-between items-center bg-neutral-100 p-2 rounded">
                <span className="text-sm">{saved.name}</span>
                <button onClick={() => loadDNA(saved)} className="bg-sage text-white px-2 py-1 rounded text-xs">Load</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
