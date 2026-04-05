// EVERCRAFTED CORE VISUALIZER ENGINE
// Handles: normalization → clustering → polar math → render-ready output

// ----------------------------
// TYPES (LOCKED CANONICAL)
// ----------------------------

export type Radius = "inner" | "mid" | "outer";
export type Category = "focal" | "secondary" | "accent" | "filler" | "greenery";

export interface BlueprintElement {
  id: string;
  element: string;
  category: Category;
  angle_deg: number;
  radius: Radius;
  stem_count: number;
}

// Render-ready element
export interface RenderElement extends BlueprintElement {
  x: number;
  y: number;
  cluster_id: string;
}

// ----------------------------
// NORMALIZATION LAYER
// ----------------------------

export function normalizeBlueprint(input: any[]): BlueprintElement[] {
  if (!Array.isArray(input)) return [];
  return input.map((el, i) => ({
    id: el.id || `el-${i}`,
    element: el.element || el.name || "unknown",
    category: mapCategory(el.category || el.role),
    angle_deg: normalizeAngle(el.angle_deg ?? el.angle ?? el.theta ?? 0),
    radius: mapRadius(el.radius || el.layer),
    stem_count: Number(el.stem_count ?? el.stems ?? 1),
  }));
}

function normalizeAngle(angle: number): number {
  let a = Number(angle);
  while (a < 0) a += 360;
  while (a >= 360) a -= 360;
  return a;
}

function mapCategory(cat: string): Category {
  const c = (cat || "").toLowerCase();

  if (c.includes("focal")) return "focal";
  if (c.includes("secondary")) return "secondary";
  if (c.includes("accent")) return "accent";
  if (c.includes("green")) return "greenery";
  return "filler";
}

function mapRadius(r: string): Radius {
  const val = (r || "").toLowerCase();

  if (val.includes("inner")) return "inner";
  if (val.includes("outer")) return "outer";
  return "mid";
}

// ----------------------------
// POLAR → CARTESIAN ENGINE
// ----------------------------

const RADIUS_MAP = {
  inner: 70,
  mid: 130,
  outer: 190,
};

export function polarToXY(
  angle_deg: number,
  radius: Radius,
  centerX: number,
  centerY: number
) {
  // Offset by -90 to make 0 degrees at 12 o'clock
  const angle = ((angle_deg - 90) * Math.PI) / 180;
  const r = RADIUS_MAP[radius];

  return {
    x: centerX + r * Math.cos(angle),
    y: centerY + r * Math.sin(angle),
  };
}

// ----------------------------
// CLUSTER ENGINE
// ----------------------------

export function clusterElements(
  elements: BlueprintElement[],
  tolerance = 18
) {
  const clusters: BlueprintElement[][] = [];

  elements.forEach((el) => {
    let placed = false;

    for (const cluster of clusters) {
      const avgAngle =
        cluster.reduce((sum, c) => sum + c.angle_deg, 0) / cluster.length;

      if (angleDistance(el.angle_deg, avgAngle) < tolerance) {
        cluster.push(el);
        placed = true;
        break;
      }
    }

    if (!placed) clusters.push([el]);
  });

  return clusters;
}

function angleDistance(a: number, b: number) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

// ----------------------------
// MAIN ENGINE PIPELINE
// ----------------------------

export function buildRenderLayout(
  rawBlueprint: any[],
  width: number,
  height: number
): RenderElement[] {
  const normalized = normalizeBlueprint(rawBlueprint);
  const clusters = clusterElements(normalized);

  const centerX = width / 2;
  const centerY = height / 2;

  const output: RenderElement[] = [];

  clusters.forEach((cluster, clusterIndex) => {
    cluster.forEach((el) => {
      const { x, y } = polarToXY(
        el.angle_deg,
        el.radius,
        centerX,
        centerY
      );

      output.push({
        ...el,
        x,
        y,
        cluster_id: `cluster-${clusterIndex}`,
      });
    });
  });

  return output;
}

// ----------------------------
// DEBUG UTILITIES
// ----------------------------

export function generateDebugOverlay(
  width: number,
  height: number
) {
  const centerX = width / 2;
  const centerY = height / 2;

  const rings = ["inner", "mid", "outer"].map((r) => ({
    radius: RADIUS_MAP[r as Radius],
  }));

  const angles = Array.from({ length: 24 }).map((_, i) => ({
    angle: i * 15,
  }));

  return {
    center: { x: centerX, y: centerY },
    rings,
    angles,
  };
}
