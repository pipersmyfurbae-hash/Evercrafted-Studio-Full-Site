// src/services/orchestration/blueprintCompiler.ts

import { Blueprint, WreathDNA, InventoryItem, EngineBlueprint } from '../../types';
import { generatePlacement } from '../engine/placementEngine';
import { engineToUI } from '../transformer';

/**
 * Compiles raw AI output into a strict EngineBlueprint object.
 */
export const compileBlueprint = (
  rawAIOutput: any,
  formula: string,
  dna: WreathDNA,
  diameter_inches: number,
  inventory: InventoryItem[]
): Blueprint => {
  // 1. Construct the basic EngineBlueprint structure
  const engineBlueprint: EngineBlueprint = {
    id: rawAIOutput.blueprint_id || `EC-${Date.now().toString(36).toUpperCase()}`,
    seed: rawAIOutput.seed || Math.random().toString(36).substr(2, 9),
    formula: formula,
    diameter: diameter_inches,
    open_arc: rawAIOutput.open_arc || [0, 0],
    clusters: rawAIOutput.clusters || [],
    elements: [],
    constraints: {
      max_elements: 100,
      collision: {
        focal: 18,
        secondary: 12,
        accent: 8,
        filler: 6
      }
    }
  };

  // 2. Generate placements
  engineBlueprint.elements = generatePlacement(engineBlueprint);

  // 3. Construct the full Blueprint object
  const blueprint: Blueprint = {
    ...engineBlueprint,
    blueprint_id: engineBlueprint.id,
    wreath_id: `WR-${Date.now().toString(36).toUpperCase()}`,
    emotion_profile: rawAIOutput.emotion_profile || {
      colors: [],
      contrast: 'medium',
      shapes: 'rounded',
      density: 'balanced',
      textures: 'soft',
      intent: 'calm'
    },
    base: {
      form: 'circular',
      diameter_inches: diameter_inches,
      frame_type: 'wire_wreath_frame'
    },
    // Populate legacy blueprint array for backward compatibility
    blueprint: engineBlueprint.elements.map(engineToUI) as any
  };

  return blueprint;
};
