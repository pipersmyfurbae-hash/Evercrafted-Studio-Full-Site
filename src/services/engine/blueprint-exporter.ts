// EVERCRAFTED SVG BLUEPRINT EXPORTER

import { RenderElement } from "./evercrafted-engine";

// ----------------------------
// CONFIG
// ----------------------------

const SIZE = 600;
const CENTER = SIZE / 2;

const RADIUS_MAP = {
  inner: 90,
  mid: 170,
  outer: 250,
};

// ----------------------------
// MAIN EXPORT FUNCTION
// ----------------------------

export function exportBlueprintSVG(elements: RenderElement[]): string {
  const svgElements = elements.map((el) => {
    // Offset by -90 to make 0 degrees at 12 o'clock (matching visualizer)
    const angle = ((el.angle_deg - 90) * Math.PI) / 180;
    const r = RADIUS_MAP[el.radius];

    const x = CENTER + r * Math.cos(angle);
    const y = CENTER + r * Math.sin(angle);

    return `
      <g>
        <circle cx="${x}" cy="${y}" r="6" fill="${getColor(el.category)}" />
        <text x="${x + 8}" y="${y + 4}" font-size="10" font-family="serif" fill="#333">
          ${el.element} (${el.stem_count})
        </text>
      </g>
    `;
  });

  return `
  <svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
    
    <!-- Background -->
    <rect width="100%" height="100%" fill="#F9F7F4" />

    <!-- Rings -->
    ${drawRing(90)}
    ${drawRing(170)}
    ${drawRing(250)}

    <!-- Clock Lines -->
    ${drawClockLines()}

    <!-- Elements -->
    ${svgElements.join("\n")}

  </svg>
  `;
}

// ----------------------------
// HELPERS
// ----------------------------

function drawRing(radius: number) {
  return `<circle cx="${CENTER}" cy="${CENTER}" r="${radius}" fill="none" stroke="#DDD" stroke-dasharray="4 4"/>`;
}

function drawClockLines() {
  return Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const x = CENTER + 260 * Math.cos(angle);
    const y = CENTER + 260 * Math.sin(angle);

    return `<line x1="${CENTER}" y1="${CENTER}" x2="${x}" y2="${y}" stroke="#EEE"/>`;
  }).join("\n");
}

function getColor(category: string) {
  switch (category) {
    case "focal":
      return "#C08457";
    case "secondary":
      return "#6B8E23";
    case "accent":
      return "#B22222";
    case "greenery":
      return "#4A6741";
    default:
      return "#999";
  }
}
