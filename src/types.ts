export interface InventoryItem {
  id: string;
  name: string;
  category: 'base' | 'greenery' | 'focal' | 'filler' | 'accent' | 'ribbon';
  colorFamily: string;
  quantity: number;
  visualWeight: 'light' | 'medium' | 'heavy';
}

export interface FloralAsset {
  sku: string;
  name: string;
  floral_type: string;
  color: string;
  category: string;
  dimension_profile: {
    bloom_diameter_inches: { typical: number };
    bloom_shape: string;
    svg_bloom_radius: number;
  };
  svg_asset: {
    svg_code: string;
    bloom_shape: string;
  };
}

export interface WreathDNA {
  cluster_count: number;
  cluster_weight_distribution: number;
  cluster_spread_deg: number;
  density_profile: number;
  greenery_direction: 'outward' | 'inward' | 'balanced';
  silhouette_bias: 'structured' | 'organic' | 'mixed';
  greenery_ratio: number;
  focal_ratio: number;
  silence_arc: number;
  focal_depth: number;
  style_signature: 'abundant' | 'minimal' | 'editorial' | 'memorial';
  color_bias: 'warm' | 'cool' | 'split' | 'neutral';
}

export interface SavedWreathDNA {
  id: string;
  userId: string;
  name: string;
  dna: WreathDNA;
  createdAt: string;
}

export interface CompositionFormula {
  name: string;
  formula_index: number;
  zone_count: number;
}

export type Role = "focal" | "secondary" | "accent" | "filler" | "greenery";

export interface EngineElement {
  id: string;
  role: Role;
  sku?: string;
  theta: number;        // 0–360 degrees
  radius: number;       // 0.0–1.0 (center → outer edge)
  layer: "inner" | "mid" | "outer" | "edge";
  scale: number;        // visual size multiplier (0.6–1.4)
  rotation?: number;    // natural rotation offset
}

export interface Cluster {
  center: number;       // angle in degrees
  spread: number;       // width of cluster
  count: number;        // element count
  bias?: number;        // 0-1 (0: center, 1: edge)
  shape?: number;       // 0-1 (0: circular, 1: elongated)
}

export interface EngineBlueprint {
  id: string;
  seed: string;
  formula: string;
  open_arc: [number, number]; // [start_deg, end_deg]
  clusters: Cluster[];
  elements: EngineElement[];
  
  // Metadata for UI
  name?: string;
  title?: string;
  emotion_profile?: EmotionProfile;
  base?: {
    form: 'circular' | 'oval' | 'square';
    diameter_inches: number;
    frame_type: string;
  };
}

export interface Blueprint extends EngineBlueprint {
  // Legacy support
  blueprint_id: string;
  wreath_id: string;
  composition?: CompositionFormula;
  dna?: WreathDNA;
  emotion_space?: {
    valence: number;
    arousal: number;
    quadrant_label: string;
    palette_bias: 'warm' | 'cool' | 'neutral' | 'split';
  };
  blueprint?: Array<{
    element: string;
    category: 'greenery' | 'focal' | 'filler' | 'accent';
    color: string;
    clock_position: string;
    angle_deg: number;
    radius: 'inner' | 'mid' | 'outer';
    density: 'low' | 'medium' | 'high';
    stem_count: number;
  }>;
}

export interface EmotionProfile {
  colors: string[];
  contrast: 'low' | 'medium' | 'high';
  shapes: 'rounded' | 'mixed' | 'angular';
  density: 'airy' | 'balanced' | 'full';
  textures: 'soft' | 'mixed' | 'sharp';
  intent: string;
}

export interface ScoreReport {
  dimensions: {
    emotionalAlignment: number;
    visualBalance: number;
    stemDensity: number;
    colorHarmony: number;
  };
  total: number;
  status: 'PASS' | 'REPAIR NEEDED';
  warnings: string[];
}

export interface RepairOption {
  id: string;
  label: string;
  description: string;
  type: 'basic' | 'advanced';
  apply: (blueprint: Blueprint) => Blueprint;
}
