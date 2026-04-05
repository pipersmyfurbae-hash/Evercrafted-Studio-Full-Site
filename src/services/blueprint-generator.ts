// src/services/blueprint-generator.ts

export interface DetectedElement {
  element: string;
  category: string;
  role: string;
  radius: 'inner' | 'mid' | 'outer';
  angle_deg: number;
  stem_count: number;
}

export function generateEvercraftedBlueprint(elements: DetectedElement[]) {
  // This takes raw vision detections and formats them into the Evercrafted Blueprint standard
  return elements.map(el => ({
    ...el,
    id: `EL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    theta: el.angle_deg,
    layer: el.category,
    status: 'active'
  }));
}
