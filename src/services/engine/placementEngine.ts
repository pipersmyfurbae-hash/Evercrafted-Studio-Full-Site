// src/services/engine/placementEngine.ts

import { EngineBlueprint, EngineElement } from "../../types";

export function generatePlacement(
  blueprint: EngineBlueprint
): EngineElement[] {
  const placed: EngineElement[] = [];

  blueprint.clusters.forEach((cluster, clusterIndex) => {
    const elementCount = Math.floor(cluster.density * 10);

    for (let i = 0; i < elementCount; i++) {
      const theta =
        cluster.center +
        randomSpread(cluster.spread);

      if (isInsideOpenArc(theta, blueprint.open_arc)) continue;

      const radius = randomRange(0.6, 0.95);
      const role = assignRole(i);

      placed.push({
        id: `el_${clusterIndex}_${i}`,
        role: role,
        theta: normalize(theta),
        radius,
        layer: radiusToLayer(radius),
        scale: roleToScale(role),
        rotation: randomRange(-20, 20)
      });
    }
  });

  return resolveCollisions(placed, blueprint);
}

// 🧮 Helpers (REQUIRED)
function randomSpread(spread: number) {
  return (Math.random() - 0.5) * spread;
}

function randomRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function normalize(theta: number) {
  return (theta + 360) % 360;
}

function isInsideOpenArc(theta: number, arc: [number, number]) {
  const [start, end] = arc;
  // Handle circular wrap-around if needed, but for now simple range
  if (start <= end) {
    return theta >= start && theta <= end;
  } else {
    // Arc crosses 0/360
    return theta >= start || theta <= end;
  }
}

function radiusToLayer(radius: number): "inner" | "mid" | "outer" | "edge" {
  if (radius < 0.4) return "inner";
  if (radius < 0.7) return "mid";
  if (radius < 0.9) return "outer";
  return "edge";
}

function assignRole(i: number): any {
  if (i === 0) return "focal";
  if (i < 3) return "secondary";
  if (i < 6) return "accent";
  return "filler";
}

function roleToScale(role: string) {
  switch (role) {
    case "focal": return 1.3;
    case "secondary": return 1.0;
    case "accent": return 0.8;
    default: return 0.6;
  }
}

// 🧱 Collision Engine (CRITICAL FOR REALISM)
function resolveCollisions(
  elements: EngineElement[],
  blueprint: EngineBlueprint
): EngineElement[] {
  const result: EngineElement[] = [];

  elements.forEach((el) => {
    const tooClose = result.some((existing) => {
      const dist = angularDistance(el.theta, existing.theta);
      return dist < getCollisionThreshold(el.role, blueprint);
    });

    if (!tooClose) result.push(el);
  });

  return result;
}

function angularDistance(a: number, b: number) {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

function getCollisionThreshold(role: string, blueprint: EngineBlueprint) {
  const collision = blueprint.constraints?.collision;
  if (!collision) {
    switch (role) {
      case "focal": return 18;
      case "secondary": return 12;
      case "accent": return 8;
      default: return 6;
    }
  }
  
  return (collision as any)[role] || 6;
}
