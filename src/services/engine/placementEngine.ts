// src/services/engine/placementEngine.ts

import { EngineBlueprint, EngineElement, Cluster } from '../../types';

/**
 * Generates element placements based on the EngineBlueprint's cluster definitions.
 * Uses Vogel's model for organic distribution within clusters.
 */
export const generatePlacement = (blueprint: EngineBlueprint): EngineElement[] => {
  const elements: EngineElement[] = [];
  const { clusters, seed, open_arc } = blueprint;
  
  // Deterministic random generator based on seed
  const seededRandom = (s: string) => {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i);
      hash |= 0;
    }
    return () => {
      hash = (hash * 16807) % 2147483647;
      return (hash - 1) / 2147483646;
    };
  };

  const rng = seededRandom(seed || 'evercrafted');

  clusters.forEach((cluster, clusterIdx) => {
    const { center, spread, count, bias = 0.5, shape = 0.5 } = cluster;
    
    for (let i = 0; i < count; i++) {
      // Vogel's model / Golden Angle distribution for organic scattering
      const goldenAngle = 137.508;
      const r = Math.sqrt(i / count); // Vogel's radius
      const thetaOffset = i * goldenAngle;
      
      // Map Vogel's model to our cluster properties
      // Spread controls the angular width
      const angularJitter = (rng() - 0.5) * spread * r;
      const theta = (center + angularJitter + (thetaOffset % spread) - (spread / 2) + 360) % 360;
      
      // Radius calculation with bias and shape
      // bias: 0 (inner) to 1 (outer)
      // shape: 0 (circular) to 1 (elongated/radial)
      const radiusBase = bias + (rng() - 0.5) * 0.2 * (1 - shape);
      const radius = Math.max(0.1, Math.min(0.95, radiusBase + (r * 0.15 * shape)));
      
      // Determine layer based on radius
      let layer: "inner" | "mid" | "outer" | "edge" = "mid";
      if (radius < 0.4) layer = "inner";
      else if (radius < 0.7) layer = "mid";
      else if (radius < 0.9) layer = "outer";
      else layer = "edge";

      // Role assignment (simplified for now, can be improved)
      const role = clusterIdx === 0 ? "greenery" : clusterIdx === 1 ? "focal" : "filler";

      // Collision detection & Open Arc enforcement
      const isInOpenArc = open_arc && theta >= open_arc[0] && theta <= open_arc[1];
      
      if (!isInOpenArc) {
        elements.push({
          id: `e-${clusterIdx}-${i}-${Math.floor(rng() * 1000)}`,
          role: role as any,
          theta,
          radius,
          layer,
          scale: 0.8 + rng() * 0.4,
          rotation: rng() * 360
        });
      }
    }
  });

  return elements;
};
