// placementEngine.ts

import { EngineBlueprint, EngineElement } from "./engineBlueprint";

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

      placed.push({
        id: `el_${clusterIndex}_${i}`,
        role: assignRole(i),
        theta: normalize(theta),
        radius,
        layer: radiusToLayer(radius),
        scale: roleToScale(assignRole(i)),
        rotation: randomRange(-20, 20)
      });
    }
  });

  return resolveCollisions(placed, blueprint);
}

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
  const normTheta = normalize(theta);
  if (start <= end) {
    return normTheta >= start && normTheta <= end;
  } else {
    return normTheta >= start || normTheta <= end;
  }
}

function radiusToLayer(radius: number) {
  if (radius < 0.4) return "inner";
  if (radius < 0.7) return "mid";
  if (radius < 0.9) return "outer";
  return "edge";
}

function assignRole(i: number) {
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

function resolveCollisions(
  elements: EngineElement[],
  blueprint: EngineBlueprint
): EngineElement[] {
  const result: EngineElement[] = [];

  elements.forEach((el) => {
    const tooClose = result.some((existing) => {
      const dist = angularDistance(el.theta, existing.theta);
      return dist < getCollisionThreshold(el.role);
    });

    if (!tooClose) result.push(el);
  });

  return result;
}

function angularDistance(a: number, b: number) {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

function getCollisionThreshold(role: string) {
  switch (role) {
    case "focal": return 18;
    case "secondary": return 12;
    case "accent": return 8;
    default: return 6;
  }
}
