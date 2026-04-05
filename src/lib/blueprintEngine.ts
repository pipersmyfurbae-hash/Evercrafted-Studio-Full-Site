
/**
 * Evercrafted Wreath Engine: Mathematical Construction Layer
 * 
 * This layer handles the deterministic, mathematical placement of elements
 * on the wreath canvas.
 */

export interface EngineElement {
  id: string;
  element: string;
  category: string;
  theta: number; // 0-360 degrees
  radius: number; // 0-1 normalized (0 = center, 1 = outer edge)
  cluster: {
    count: number;
    spread: number; // 0-1 normalized scattering spread
    seed: number;   // Deterministic seed for this specific cluster
    bias?: number;  // 0-1 (0 = center-heavy, 1 = edge-heavy, 0.5 = uniform)
    shape?: 'circular' | 'elliptical'; // elliptical stretches along the wreath arc
  };
  texture: string;
}

export interface EngineBlueprint {
  id: string;
  title: string;
  formula: string;
  palette: Record<string, string>;
  elements: EngineElement[];
  open_arc: {
    start: number; // degrees
    end: number;   // degrees
  };
  deterministic_seed: number;
  renderPrompt: string;
  emotion_profile: {
    primary: string;
  };
}

/**
 * UI Layer: Derived values for human-readable display
 */
export interface UIElement extends EngineElement {
  clock_position: string;
  radius_label: string;
  density_label: string;
}

/**
 * Transformation Layer: Engine -> UI
 */
export const engineToUI = (element: EngineElement): UIElement => {
  // Convert theta to clock position (0 deg = 12:00, 90 deg = 3:00, etc.)
  const clockHour = ((element.theta / 30 + 12) % 12) || 12;
  const clockMin = Math.round((element.theta % 30) * 2);
  const clock_position = `${Math.floor(clockHour)}:${clockMin.toString().padStart(2, '0')}`;

  // Convert numeric radius to label
  let radius_label = 'Mid';
  if (element.radius < 0.4) radius_label = 'Inner';
  else if (element.radius > 0.7) radius_label = 'Outer';

  // Convert cluster count to density label
  let density_label = 'Medium';
  if (element.cluster.count <= 3) density_label = 'Low';
  else if (element.cluster.count >= 12) density_label = 'High';

  return {
    ...element,
    clock_position,
    radius_label,
    density_label
  };
};

/**
 * Transformation Layer: UI -> Engine (for legacy editing support)
 */
export const uiToEngine = (uiElement: any): EngineElement => {
  // If it already has engine properties, use them
  if (typeof uiElement.theta === 'number' && typeof uiElement.radius === 'number') {
    return {
      id: uiElement.id,
      element: uiElement.element,
      category: uiElement.category,
      theta: uiElement.theta,
      radius: uiElement.radius,
      cluster: uiElement.cluster || {
        count: uiElement.stem_count || 1,
        spread: 0.2,
        seed: Math.random()
      },
      texture: uiElement.texture || 'Silk'
    };
  }

  // Otherwise, derive from legacy properties
  const theta = uiElement.angle_deg || 0;
  let radius = 0.5;
  if (uiElement.radius === 'inner') radius = 0.3;
  if (uiElement.radius === 'outer') radius = 0.9;

  return {
    id: uiElement.id || Math.random().toString(36).substr(2, 9),
    element: uiElement.element,
    category: uiElement.category,
    theta,
    radius,
    cluster: {
      count: uiElement.stem_count || 1,
      spread: 0.2,
      seed: Math.random()
    },
    texture: uiElement.texture || 'Silk'
  };
};

/**
 * Exclusion Logic: Check if a point falls within the open_arc (negative space)
 */
export const isPointInExclusionZone = (theta: number, open_arc: { start: number, end: number }): boolean => {
  const normalizedTheta = ((theta % 360) + 360) % 360;
  const { start, end } = open_arc;

  if (start <= end) {
    return normalizedTheta >= start && normalizedTheta <= end;
  } else {
    // Arc crosses the 0/360 boundary
    return normalizedTheta >= start || normalizedTheta <= end;
  }
};
