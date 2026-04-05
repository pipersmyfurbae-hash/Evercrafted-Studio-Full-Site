// src/services/transformer.ts

import { EngineBlueprint, EngineElement, Role, BlueprintElement, Category, Radius } from "../types";

/**
 * Normalizes any blueprint input into the canonical BlueprintElement format.
 * MANDATORY for all system outputs.
 */
export function normalizeBlueprint(input: any[]): BlueprintElement[] {
  if (!Array.isArray(input)) return [];
  return input.map((el, i) => ({
    id: el.id || `el-${i}`,
    element: el.element || el.name || 'unknown',
    category: mapCategory(el.category || el.role),
    angle_deg: Number(el.angle_deg || el.angle || el.theta || 0),
    radius: mapRadius(el.radius),
    stem_count: Number(el.stem_count || el.stems || 1)
  }));
}

function mapCategory(cat: any): Category {
  const c = String(cat).toLowerCase();
  if (c.includes('focal')) return 'focal';
  if (c.includes('secondary')) return 'secondary';
  if (c.includes('accent')) return 'accent';
  if (c.includes('filler')) return 'filler';
  return 'greenery';
}

function mapRadius(rad: any): Radius {
  const r = String(rad).toLowerCase();
  if (r.includes('inner')) return 'inner';
  if (r.includes('mid')) return 'mid';
  return 'outer';
}

/**
 * Groups elements into clusters based on angular proximity.
 * Essential for "Designer-Grade" visual balance.
 */
export function groupByCluster(elements: BlueprintElement[], tolerance = 15) {
  if (elements.length === 0) return [];
  
  const sorted = [...elements].sort((a, b) => a.angle_deg - b.angle_deg);
  const clusters: BlueprintElement[][] = [];
  let currentCluster: BlueprintElement[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    if (curr.angle_deg - prev.angle_deg <= tolerance) {
      currentCluster.push(curr);
    } else {
      clusters.push(currentCluster);
      currentCluster = [curr];
    }
  }
  clusters.push(currentCluster);

  // Handle wrap-around (360 to 0)
  if (clusters.length > 1) {
    const first = clusters[0];
    const last = clusters[clusters.length - 1];
    const lastAngle = last[last.length - 1].angle_deg;
    const firstAngle = first[0].angle_deg;
    
    if ((360 - lastAngle + firstAngle) <= tolerance) {
      clusters[0] = [...last, ...first];
      clusters.pop();
    }
  }

  return clusters;
}

/**
 * Converts an EngineBlueprint element to a canonical BlueprintElement.
 * Every system must output EXACTLY this schema. No variations.
 */
export function engineToUI(element: EngineElement) {
  return {
    id: element.id,
    element: element.role,
    category: element.role as any,
    angle_deg: element.theta,
    radius: radiusToLabel(element.radius) as any,
    stem_count: Math.ceil(element.scale * 2)
  };
}

function thetaToClock(theta: number) {
  const hours = (Math.round(theta / 30) % 12) || 12;
  return `${hours}:00`;
}

function radiusToLabel(r: number) {
  if (r < 0.4) return "inner";
  if (r < 0.7) return "mid";
  return "outer";
}

function scaleToDensity(scale: number) {
  if (scale > 1.2) return "high";
  if (scale > 0.8) return "medium";
  return "low";
}

/**
 * Transforms an entire EngineBlueprint for UI display.
 */
export const transformBlueprintForUI = (blueprint: EngineBlueprint) => {
  return {
    ...blueprint,
    elements: blueprint.elements.map(engineToUI)
  };
};

/**
 * Converts a UI element back to an EngineElement.
 */
export const uiToEngine = (uiElement: any): EngineElement => {
  const { theta, radius_val, layer, role, id, scale, rotation } = uiElement;
  
  return {
    id,
    role: role as Role,
    theta: Number(theta),
    radius: Number(radius_val),
    layer: layer as any,
    scale: Number(scale),
    rotation: Number(rotation)
  };
};
