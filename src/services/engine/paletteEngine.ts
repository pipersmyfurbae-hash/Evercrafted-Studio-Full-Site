import { InventoryItem, Blueprint } from '../../types';

export interface PaletteMapping {
  focal: InventoryItem[];
  greenery: InventoryItem[];
  filler: InventoryItem[];
  accent: InventoryItem[];
}

export class PaletteEngine {
  static mapInventoryToBlueprint(inventory: InventoryItem[], blueprint: Blueprint): PaletteMapping {
    const palette: PaletteMapping = {
      focal: [],
      greenery: [],
      filler: [],
      accent: [],
    };

    // Filter and sort inventory based on blueprint needs (simplified)
    inventory.forEach(item => {
      if (palette.hasOwnProperty(item.category)) {
        palette[item.category as keyof PaletteMapping].push(item);
      }
    });

    return palette;
  }

  static getBestMatch(category: 'focal' | 'greenery' | 'filler' | 'accent', palette: PaletteMapping, colorBias: string, visualWeight: 'light' | 'medium' | 'heavy'): InventoryItem | null {
    const items = palette[category];
    if (items.length === 0) return null;

    // Simple matching: prioritize color match, then visualWeight
    const match = items.find(item => (item.color === colorBias || item.colorFamily === colorBias) && item.visualWeight === visualWeight) ||
                  items.find(item => item.color === colorBias || item.colorFamily === colorBias) ||
                  items[0];

    return match;
  }
}
