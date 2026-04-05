// EVERCRAFTED RENDER SCORING ENGINE

export interface RenderScore {
  realism: number;         // faux realism (materials)
  composition: number;     // cluster + layout adherence
  lighting: number;        // editorial lighting quality
  materialAccuracy: number;// silk/latex correctness
  luxuryScore: number;     // overall high-end feel
  issues: string[];
  total: number;
}

// ----------------------------
// KEY DETECTION RULES
// ----------------------------

const NEGATIVE_FLAGS = [
  "fresh flowers",
  "water droplets",
  "dew",
  "hyper realistic petals",
  "translucent petals",
  "wet surface",
];

const POSITIVE_SIGNALS = [
  "silk",
  "matte petals",
  "latex-coated",
  "wired stems",
  "grapevine base",
  "editorial photography",
  "85mm lens",
  "soft daylight",
];

// ----------------------------
// MAIN SCORER
// ----------------------------

export function renderScore(prompt: string): RenderScore {
  const lower = prompt.toLowerCase();

  let realism = 0;
  let composition = 0;
  let lighting = 0;
  let materialAccuracy = 0;
  let luxuryScore = 0;

  const issues: string[] = [];

  // ----------------------------
  // MATERIAL CHECK
  // ----------------------------

  POSITIVE_SIGNALS.forEach((signal) => {
    if (lower.includes(signal)) {
      materialAccuracy += 10;
      realism += 8;
    }
  });

  NEGATIVE_FLAGS.forEach((flag) => {
    if (lower.includes(flag)) {
      realism -= 15;
      issues.push(`Detected unwanted realism: ${flag}`);
    }
  });

  // ----------------------------
  // LIGHTING CHECK
  // ----------------------------

  if (lower.includes("soft daylight")) lighting += 15;
  if (lower.includes("85mm")) lighting += 10;
  if (lower.includes("editorial")) lighting += 15;

  if (!lower.includes("shadow")) {
    issues.push("Missing shadow detail");
    lighting -= 5;
  }

  // ----------------------------
  // COMPOSITION CHECK
  // ----------------------------

  if (lower.includes("asymmetrical")) composition += 15;
  if (lower.includes("cluster")) composition += 10;
  if (lower.includes("negative space")) composition += 15;

  // ----------------------------
  // LUXURY SIGNALS
  // ----------------------------

  if (lower.includes("luxury")) luxuryScore += 20;
  if (lower.includes("restoration hardware")) luxuryScore += 20;
  if (lower.includes("high-end")) luxuryScore += 15;

  // ----------------------------
  // TOTAL
  // ----------------------------

  const total =
    realism * 0.25 +
    composition * 0.2 +
    lighting * 0.2 +
    materialAccuracy * 0.2 +
    luxuryScore * 0.15;

  return {
    realism,
    composition,
    lighting,
    materialAccuracy,
    luxuryScore,
    issues,
    total,
  };
}
