// EVERCRAFTED MARKETPLACE SERVICE

import { MarketplaceBlueprint } from "./marketplace-schema";

let marketplaceDB: MarketplaceBlueprint[] = [];

// ----------------------------
// CREATE LISTING
// ----------------------------

export function publishBlueprint(listing: MarketplaceBlueprint) {
  marketplaceDB.push(listing);
  return listing;
}

// ----------------------------
// FETCH LISTINGS
// ----------------------------

export function getMarketplaceFeed() {
  return [...marketplaceDB].sort((a, b) => b.downloads - a.downloads);
}

// ----------------------------
// PURCHASE FLOW (SIMPLIFIED)
// ----------------------------

export function purchaseBlueprint(id: string) {
  const item = marketplaceDB.find((x) => x.id === id);

  if (!item) throw new Error("Blueprint not found");

  item.downloads += 1;

  return item;
}
