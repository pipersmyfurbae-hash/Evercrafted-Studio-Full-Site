// src/services/inventory-matching.ts

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  role: string;
}

export function matchToInventory(detectedFlower: string, inventory: InventoryItem[]) {
  // Simple fuzzy match for now
  const match = inventory.find(item => 
    item.name.toLowerCase().includes(detectedFlower.toLowerCase()) ||
    detectedFlower.toLowerCase().includes(item.name.toLowerCase())
  );
  
  return match || {
    id: 'unknown',
    name: detectedFlower,
    sku: `GEN-${detectedFlower.substring(0, 3).toUpperCase()}`,
    category: 'flower',
    role: 'focal'
  };
}
