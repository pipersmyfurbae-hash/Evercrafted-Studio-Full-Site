export const TIER_RANK = { bloom: 1, craft: 2, studio: 3, atelier: 4 } as const;
export type Tier = keyof typeof TIER_RANK;

export function canAccess(userTier: Tier, requiredTier: Tier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier];
}

export const TIER_LABELS: Record<Tier, string> = {
  bloom: 'Bloom',
  craft: 'Craft',
  studio: 'Studio',
  atelier: 'Atelier',
};
