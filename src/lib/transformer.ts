// transformer.ts

import { EngineBlueprint } from "./engineBlueprint";

export function engineToUI(engine: EngineBlueprint) {
  return engine.elements.map((el) => ({
    id: el.id,
    element: el.role,

    category: el.role,

    angle_deg: el.theta,

    clock_position: thetaToClock(el.theta),

    radius: radiusToLabel(el.radius),

    stem_count: Math.ceil(el.scale * 2),

    density: scaleToDensity(el.scale),

    texture: "Silk"
  }));
}

function thetaToClock(theta: number) {
  const hours = Math.round(theta / 30);
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
