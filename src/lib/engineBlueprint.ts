// engineBlueprint.ts

export type Role = "focal" | "secondary" | "accent" | "filler" | "greenery";

export interface EngineElement {
  id: string;
  role: Role;
  sku?: string;

  // 🔑 CRITICAL (REAL POSITIONING)
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

  open_arc: [number, number]; // 🔥 NEGATIVE SPACE

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
}
