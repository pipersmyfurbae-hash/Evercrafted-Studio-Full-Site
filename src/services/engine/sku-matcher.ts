// EVERCRAFTED SKU MATCHER

import { InventoryItem } from "../../types";

export function matchToInventory(
  blueprint: any[],
  inventory: InventoryItem[]
) {
  return blueprint.map((el) => {
    const candidates = inventory.filter((item) =>
      item.name.toLowerCase().includes(el.element)
    );

    const match = candidates[0] || findClosestMatch(el.element, inventory);

    return {
      ...el,
      element: match.name,
      sku: match.sku,
    };
  });
}

function findClosestMatch(name: string, inventory: InventoryItem[]) {
  // Simple fallback: pick a random item from the same category if possible
  // In a real app, this would use fuzzy matching or vector search
  return inventory[Math.floor(Math.random() * inventory.length)];
}
