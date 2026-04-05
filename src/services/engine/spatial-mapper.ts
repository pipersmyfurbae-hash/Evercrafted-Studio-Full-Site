// CLEAN + NORMALIZE AI OUTPUT

import { Category, Radius } from "../../types";

export function mapToBlueprintElements(detected: any[]) {
  return detected.map((el, i) => ({
    id: `vision-${i}`,
    element: normalizeName(el.element),
    category: normalizeCategory(el.category),
    angle_deg: normalizeAngle(el.angle_deg),
    radius: normalizeRadius(el.radius),
    stem_count: estimateStemCount(el),
  }));
}

function normalizeName(name: string) {
  return name.toLowerCase().trim();
}

function normalizeCategory(cat: string): Category {
  const c = cat.toLowerCase();

  if (c.includes("focal")) return "focal";
  if (c.includes("secondary")) return "secondary";
  if (c.includes("accent")) return "accent";
  if (c.includes("green")) return "greenery";
  return "filler";
}

function normalizeRadius(r: string): Radius {
  const radius = r.toLowerCase();
  if (radius === "inner" || radius === "outer") return radius as Radius;
  return "mid";
}

function normalizeAngle(a: number) {
  return ((a % 360) + 360) % 360;
}

function estimateStemCount(el: any) {
  if (el.category === "focal") return 3;
  if (el.category === "greenery") return 4;
  return 2;
}
