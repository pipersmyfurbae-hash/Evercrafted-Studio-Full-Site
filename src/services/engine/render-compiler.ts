// EVERCRAFTED RENDER PROMPT COMPILER

import { RenderElement } from "./evercrafted-engine";

// ----------------------------
// MAIN ENTRY
// ----------------------------

export function compileRenderPrompts(elements: RenderElement[]) {
  const composition = buildComposition(elements);
  const materials = buildMaterialBlock();
  const lighting = buildLightingBlock();
  const negative = buildNegativeBlock();

  return {
    midjourney: buildMidjourneyPrompt(composition, materials, lighting, negative),
    vertex: buildVertexPrompt(composition, materials, lighting, negative),
    firefly: buildFireflyPrompt(composition, materials, lighting, negative),
  };
}

// ----------------------------
// COMPOSITION BUILDER
// ----------------------------

function buildComposition(elements: RenderElement[]) {
  const clusters = groupByCluster(elements);

  const clusterDescriptions = clusters.map((cluster) => {
    const avgAngle =
      cluster.reduce((sum, el) => sum + el.angle_deg, 0) / cluster.length;

    const clock = angleToClock(avgAngle);

    const florals = cluster
      .map((el) => `${el.element}`)
      .join(", ");

    return `${florals} clustered at ${clock}`;
  });

  return `
24-inch luxury faux botanical wreath,
asymmetrical composition,
${clusterDescriptions.join(", ")},
natural grapevine base,
`;
}

// ----------------------------
// MATERIAL DNA (LOCKED)
// ----------------------------

function buildMaterialBlock() {
  return `
silk flowers with matte fabric petals,
slight fraying edges,
latex-coated leaves with subtle vein texture,
semi-gloss foliage,
visible wired stems integrated into grapevine base,
`;
}

// ----------------------------
// LIGHTING DNA (LOCKED)
// ----------------------------

function buildLightingBlock() {
  return `
soft directional daylight from left (12–2pm),
85mm lens,
shallow depth of field,
editorial product photography,
neutral plaster wall background,
`;
}

// ----------------------------
// NEGATIVE RULES (CRITICAL)
// ----------------------------

function buildNegativeBlock() {
  return `
NO fresh flowers,
NO water droplets,
NO hyper-saturated colors,
NO plastic shine,
NO artificial gloss reflections,
`;
}

// ----------------------------
// PLATFORM BUILDERS
// ----------------------------

function buildMidjourneyPrompt(comp: string, mat: string, light: string, neg: string) {
  return `
${comp}
${mat}
${light}
${neg}
--style raw --s 150 --q 2
`.trim();
}

function buildVertexPrompt(comp: string, mat: string, light: string, neg: string) {
  return `
${comp}
${mat}
${light}
${neg}
high-end faux botanical product render
`.trim();
}

function buildFireflyPrompt(comp: string, mat: string, light: string, neg: string) {
  return `
Luxury faux wreath, editorial catalog style,
${comp}
${mat}
${light}
${neg}
`.trim();
}

// ----------------------------
// CLUSTER GROUPING
// ----------------------------

function groupByCluster(elements: RenderElement[], tolerance = 20) {
  const clusters: RenderElement[][] = [];

  elements.forEach((el) => {
    let placed = false;

    for (const cluster of clusters) {
      const avg =
        cluster.reduce((sum, e) => sum + e.angle_deg, 0) / cluster.length;

      if (angleDistance(el.angle_deg, avg) < tolerance) {
        cluster.push(el);
        placed = true;
        break;
      }
    }

    if (!placed) clusters.push([el]);
  });

  return clusters;
}

// ----------------------------
// UTILITIES
// ----------------------------

function angleDistance(a: number, b: number) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function angleToClock(angle: number) {
  const hour = Math.round(angle / 30) % 12 || 12;
  const minutes = Math.round((angle % 30) / 30 * 60);

  if (minutes === 0) return `${hour} o’clock`;
  return `${hour}:${minutes.toString().padStart(2, "0")}`;
}
