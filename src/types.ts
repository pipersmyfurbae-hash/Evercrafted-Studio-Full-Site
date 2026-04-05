export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  color: string;
  colorFamily?: string;
  stock: number;
  quantity?: number;
  role: "focal" | "secondary" | "accent" | "filler" | "greenery";
  visualWeight?: 'light' | 'medium' | 'heavy';
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

export type Radius = "inner" | "mid" | "outer";
export type Category = "focal" | "secondary" | "accent" | "filler" | "greenery";

export interface BlueprintElement {
  id: string;
  element: string;
  category: Category;
  angle_deg: number;
  radius: Radius;
  stem_count: number;
}

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
  density: number;      // 0–1 (controls element count)
}

export interface EngineBlueprint {
  id: string;
  seed: string;
  formula: string;
  diameter: number;
  open_arc: [number, number]; // [start_deg, end_deg]
  clusters: Cluster[];
  elements: EngineElement[];
  constraints: {
    max_elements: number;
    collision: {
      focal: number;
      secondary: number;
      accent: number;
      filler: number;
    };
  };
  
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
  blueprint?: BlueprintElement[];
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

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'active' | 'on_hold' | 'completed' | 'archived';
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  active_projects: number;
  pending_tasks: number;
  completed_tasks: number;
  upcoming_deadlines: number;
}
