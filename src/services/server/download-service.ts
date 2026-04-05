// SECURE DOWNLOAD SERVICE

import { hasAccess } from "./purchase-verification";
import { exportBlueprintSVG } from "../engine/blueprint-exporter";

export function downloadBlueprint(userId: string, blueprint: any) {
  if (!hasAccess(userId, blueprint.id)) {
    throw new Error("Access denied");
  }

  const svg = exportBlueprintSVG(blueprint.layout || blueprint.elements || []);

  // On the server, we return the SVG string.
  // The API route will handle the response (e.g., setting headers for download).
  return svg;
}
