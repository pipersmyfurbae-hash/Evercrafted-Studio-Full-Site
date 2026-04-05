// EVERCRAFTED FULL IMAGE PIPELINE

import { analyzeWreathImage } from "./vision-flower-engine";
import { mapToBlueprintElements } from "./spatial-mapper";
import { matchToInventory } from "./sku-matcher";
import { InventoryItem } from "../../types";

export async function processWreathImage(
  imageUrl: string,
  inventory: InventoryItem[]
) {
  // 1. AI detection (Gemini Vision)
  const detected = await analyzeWreathImage(imageUrl);

  // 2. Normalize and map to blueprint structure
  const blueprint = mapToBlueprintElements(detected);

  // 3. Match to real SKUs from inventory
  const enriched = matchToInventory(blueprint, inventory);

  return enriched;
}
