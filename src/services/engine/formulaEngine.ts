// src/services/engine/formulaEngine.ts

import { CompositionFormula } from '../../types';

export interface FormulaRule {
  name: string;
  generateZones: (zoneCount: number) => Array<{ angle_start: number; angle_end: number; type: 'focal' | 'silence' | 'fill' }>;
}

export const FORMULA_REGISTRY: Record<string, FormulaRule> = {
  'Crescent': {
    name: 'Crescent',
    generateZones: (zoneCount) => Array.from({ length: zoneCount }, (_, i) => ({
      angle_start: Math.floor((i / zoneCount) * 360),
      angle_end: Math.floor(((i + 1) / zoneCount) * 360),
      type: i === 0 ? 'focal' : i % 3 === 0 ? 'silence' : 'fill'
    }))
  },
  'Full Halo': {
    name: 'Full Halo',
    generateZones: (zoneCount) => Array.from({ length: zoneCount }, (_, i) => ({
      angle_start: Math.floor((i / zoneCount) * 360),
      angle_end: Math.floor(((i + 1) / zoneCount) * 360),
      type: 'fill'
    }))
  },
  // ... Add remaining 10 formulas here
};

export const getFormula = (name: string): FormulaRule => {
  return FORMULA_REGISTRY[name] || FORMULA_REGISTRY['Crescent'];
};
