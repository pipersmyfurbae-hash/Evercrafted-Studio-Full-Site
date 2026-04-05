// VERIFY PURCHASE BEFORE DOWNLOAD

const purchases = new Map<string, string[]>();
// userId → [blueprintIds]

export function recordPurchase(userId: string, blueprintId: string) {
  if (!purchases.has(userId)) {
    purchases.set(userId, []);
  }

  purchases.get(userId)!.push(blueprintId);
}

export function hasAccess(userId: string, blueprintId: string) {
  return purchases.get(userId)?.includes(blueprintId);
}
