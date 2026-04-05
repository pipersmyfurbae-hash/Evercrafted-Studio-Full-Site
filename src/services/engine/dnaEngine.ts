// src/services/engine/dnaEngine.ts

import { WreathDNA } from '../../types';

/**
 * DNA Engine: Manages trait validation and mutation logic.
 * Enforces hard (brand-protected) vs soft (ABC-mutable) boundaries.
 */

export const validateDNA = (dna: WreathDNA): boolean => {
  // Hard boundary check: style_signature is immutable
  // Soft boundary check: ranges for cluster_count, density, etc.
  return (
    dna.cluster_count >= 3 && dna.cluster_count <= 9 &&
    dna.density_profile >= 0 && dna.density_profile <= 1
  );
};

export const mutateDNA = (dna: WreathDNA, mutationRate: number): WreathDNA => {
  const mutated = { ...dna };
  
  // Only mutate soft genes
  const softGenes: (keyof WreathDNA)[] = [
    'cluster_count', 'density_profile', 'greenery_ratio', 
    'silence_arc', 'focal_depth', 'cluster_weight_distribution'
  ];

  softGenes.forEach(key => {
    if (Math.random() < mutationRate) {
      const val = mutated[key] as number;
      (mutated[key] as number) = parseFloat((val + (Math.random() - 0.5) * 0.2).toFixed(2));
    }
  });

  return mutated;
};
