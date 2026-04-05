import { Blueprint, EmotionProfile, ScoreReport, RepairOption } from '../types';

export const scoreBlueprint = (blueprint: Blueprint, emotionProfile?: EmotionProfile): ScoreReport => {
  const dimensions = {
    emotionalAlignment: calculateEmotionalAlignment(blueprint, emotionProfile),
    visualBalance: calculateVisualBalance(blueprint),
    stemDensity: calculateStemDensity(blueprint),
    colorHarmony: calculateColorHarmony(blueprint),
  };
  const total = Object.values(dimensions).reduce((a, b) => a + b, 0);
  
  const warnings: string[] = [];
  if (dimensions.visualBalance < 15) {
    warnings.push('Visual distribution is highly uneven across quadrants.');
  }
  if (dimensions.stemDensity < 15) {
    warnings.push('Stem density is significantly outside the target range for this wreath size.');
  }
  if (dimensions.colorHarmony < 15) {
    warnings.push('Color distribution deviates significantly from the 60-30-10 rule.');
  }

  return {
    dimensions,
    total,
    status: total >= 80 ? 'PASS' : 'REPAIR NEEDED',
    warnings
  };
};

// --- Scoring Helpers ---

const calculateEmotionalAlignment = (blueprint: Blueprint, emotionProfile?: EmotionProfile): number => {
  if (!emotionProfile) return 12; // Neutral score if no profile

  const elements = blueprint.elements || [];
  if (elements.length === 0) return 12;

  // Simple mapping - in a real system, this would be a more robust database
  const roleEmotions: Record<string, string[]> = {
    'focal': ['romantic', 'dramatic', 'elevated'],
    'greenery': ['calm', 'grounded'],
    'accent': ['playful', 'nostalgic'],
    'filler': ['balanced', 'calm']
  };

  let matches = 0;
  elements.forEach(item => {
    const tags = roleEmotions[item.role] || [];
    if (tags.some(tag => emotionProfile.intent.includes(tag))) {
      matches++;
    }
  });

  // Heuristic: score based on percentage of matches
  const score = Math.min(25, Math.floor((matches / Math.max(1, elements.length)) * 25 * 1.5));
  return score;
};

const calculateVisualBalance = (blueprint: Blueprint): number => {
  const quadrantMass = [0, 0, 0, 0];
  const elements = blueprint.elements || [];

  elements.forEach(item => {
    const mass = item.scale || 1;
    const quadrant = Math.floor(item.theta / 90) % 4;
    quadrantMass[quadrant] += mass;
  });

  // Calculate variance of quadrant mass
  const mean = quadrantMass.reduce((a, b) => a + b, 0) / 4;
  const variance = quadrantMass.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 4;
  
  // Score: 25 max, penalty for high variance
  const penalty = Math.min(25, Math.sqrt(variance) * 5);
  return Math.max(0, 25 - Math.floor(penalty));
};

const calculateStemDensity = (blueprint: Blueprint): number => {
  const elements = blueprint.elements || [];
  const totalElements = elements.length;
  
  // Target density depends on wreath size
  const diameter = blueprint.base?.diameter_inches || 24;
  const targetCount = diameter === 24 ? 80 : 50; 
  
  const diff = Math.abs(totalElements - targetCount);
  return Math.max(0, 25 - Math.floor(diff / 2));
};

const calculateColorHarmony = (blueprint: Blueprint): number => {
  const elements = blueprint.elements || [];
  if (elements.length === 0) return 12;

  // For Engine Pack, we might not have explicit colors on elements yet, 
  // but we can use roles as a proxy for color distribution (e.g. greenery vs focal)
  const roleCounts: Record<string, number> = {};
  elements.forEach(item => {
    roleCounts[item.role] = (roleCounts[item.role] || 0) + 1;
  });

  const total = elements.length;
  const ratios = Object.values(roleCounts).map(count => count / total);
  
  // Ideal: 0.6 (greenery), 0.3 (focal/secondary), 0.1 (accent)
  const idealRatios = [0.6, 0.3, 0.1];
  const sortedRatios = ratios.sort((a, b) => b - a);
  
  let diff = 0;
  for (let i = 0; i < 3; i++) {
    diff += Math.pow((sortedRatios[i] || 0) - (idealRatios[i] || 0), 2);
  }
  
  return Math.max(0, 25 - Math.floor(diff * 40));
};

// --- Repair Logic ---
// ... (rest of the file remains the same)

export const getBasicRepairs = (blueprint: Blueprint, dimension: string): RepairOption[] => {
  return [
    {
      id: 'basic-1',
      label: 'Redistribute clusters',
      description: 'Move 1–2 clusters to underrepresented quadrants.',
      type: 'basic',
      apply: (b) => b // Placeholder
    }
  ];
};

export const getAdvancedRepairs = (blueprint: Blueprint, dimension: string): RepairOption[] => {
  return [
    {
      id: 'advanced-1',
      label: 'AI-Powered Rebalance',
      description: 'Use AI to re-balance the entire color story for a more dramatic, high-contrast look.',
      type: 'advanced',
      apply: (b) => b // Placeholder
    }
  ];
};
