// EVERCRAFTED INVENTORY ENGINE

import { InventoryItem } from "../../types";

// ----------------------------
// FILTER INVENTORY BY ROLE
// ----------------------------

export function buildInventoryPools(inventory: InventoryItem[]) {
  return {
    focal: inventory.filter(i => i.role === "focal"),
    secondary: inventory.filter(i => i.role === "secondary"),
    accent: inventory.filter(i => i.role === "accent"),
    filler: inventory.filter(i => i.role === "filler"),
    greenery: inventory.filter(i => i.role === "greenery"),
  };
}

// ----------------------------
// SELECT ELEMENTS FROM INVENTORY
// ----------------------------

export function assignInventoryToBlueprint(
  blueprint: any[],
  inventoryPools: ReturnType<typeof buildInventoryPools>
) {
  return blueprint.map((el) => {
    const pool = inventoryPools[el.category as keyof ReturnType<typeof buildInventoryPools>];

    if (!pool || pool.length === 0) {
      throw new Error(`No inventory available for ${el.category}`);
    }

    const item = pickBestMatch(pool);

    return {
      ...el,
      element: item.name,
      sku: item.sku,
    };
  });
}

// ----------------------------
// SMART PICK LOGIC
// ----------------------------

function pickBestMatch(pool: InventoryItem[]) {
  return pool[Math.floor(Math.random() * pool.length)];
}
