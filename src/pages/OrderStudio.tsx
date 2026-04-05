// src/pages/OrderStudio.tsx

import React, { useState, useEffect } from 'react';
import { Blueprint, InventoryItem } from '../types';
import { runOrchestrator } from '../services/BlueprintOrchestrator';
import { compileBlueprint } from '../services/orchestration/blueprintCompiler';
import { getInventory } from '../services/firebase/inventoryService';
import { publishToMarketplace } from '../services/firebase/marketplaceService';
import { toast } from 'sonner';
import { auth } from '../lib/firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { engineToUI, normalizeBlueprint } from '../services/transformer';

export const OrderStudio: React.FC = () => {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    if (auth.currentUser) {
      const data = await getInventory(auth.currentUser.uid);
      setInventory(data);
    }
  };

  const handleGenerateOrder = async () => {
    // 1. Compile raw AI output (simulated)
    const rawAI = { blueprint_id: `EC-${Date.now().toString(36).toUpperCase()}` };
    const dna = {
      cluster_count: 4,
      cluster_weight_distribution: 0.5,
      cluster_spread_deg: 60,
      density_profile: 0.7,
      greenery_direction: 'balanced' as const,
      silhouette_bias: 'mixed' as const,
      greenery_ratio: 0.4,
      focal_ratio: 0.15,
      silence_arc: 30,
      focal_depth: 0.5,
      style_signature: 'abundant' as const,
      color_bias: 'neutral' as const
    };

    const newBlueprint = compileBlueprint(rawAI, 'Crescent', dna, 20, inventory);

    // 2. Run Orchestrator to score and validate
    const { report, blueprint: validatedBlueprint } = await runOrchestrator(
      newBlueprint,
      undefined
    );

    setBlueprint(validatedBlueprint);
    console.log('Order generated:', report);
  };

  const downloadPDF = () => {
    if (!blueprint) return;
    const doc = new jsPDF();
    doc.text(`Wreath Order: ${blueprint.blueprint_id}`, 10, 10);
    doc.text(`Customer: ${customerName}`, 10, 20);
    
    const rawElements = blueprint.blueprint || (blueprint.elements ? blueprint.elements.map(engineToUI) : []);
    const elements = normalizeBlueprint(rawElements);
    const tableData = elements.map((item: any) => [
      item.element, 
      item.category, 
      `${item.angle_deg || 0}°`
    ]);
    
    autoTable(doc, {
      head: [['Element', 'Category', 'Angle']],
      body: tableData,
      startY: 30,
    });
    
    doc.save(`order_${blueprint.blueprint_id}.pdf`);
  };

  const handlePublish = async () => {
    if (!blueprint || !auth.currentUser) return;
    try {
      await publishToMarketplace(blueprint, 15, auth.currentUser.uid);
      toast.success('Design published to marketplace!');
    } catch (error) {
      toast.error('Failed to publish design.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-light mb-4">Order Studio</h1>
      <input 
        className="border p-2 mb-4 w-full"
        placeholder="Customer Name" 
        value={customerName} 
        onChange={(e) => setCustomerName(e.target.value)} 
      />
      <div className="flex gap-2">
        <button onClick={handleGenerateOrder} className="bg-gold text-black px-4 py-2 rounded">
          Generate Order
        </button>
        {blueprint && (
          <>
            <button onClick={downloadPDF} className="bg-sage text-white px-4 py-2 rounded">
              Download PDF Guide
            </button>
            <button onClick={handlePublish} className="bg-emerald-600 text-white px-4 py-2 rounded">
              Publish to Marketplace
            </button>
          </>
        )}
      </div>
      {blueprint && (
        <div className="mt-4 p-4 bg-surface rounded">
          <h2 className="text-lg">Generated Blueprint: {blueprint.blueprint_id}</h2>
        </div>
      )}
    </div>
  );
};
