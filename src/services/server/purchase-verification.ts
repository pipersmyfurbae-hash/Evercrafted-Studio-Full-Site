// VERIFY PURCHASE BEFORE DOWNLOAD

import { getFirestore } from 'firebase-admin/firestore';

type PurchaseRecord = {
  userId: string;
  blueprintId: string;
  paymentReference?: string;
  createdAt: string;
};

function getPurchaseDocId(userId: string, blueprintId: string): string {
  return `${userId}_${blueprintId}`;
}

export async function recordPurchase(
  userId: string,
  blueprintId: string,
  paymentReference?: string
) {
  const db = getFirestore();
  const record: PurchaseRecord = {
    userId,
    blueprintId,
    paymentReference,
    createdAt: new Date().toISOString(),
  };

  await db
    .collection('purchases')
    .doc(getPurchaseDocId(userId, blueprintId))
    .set(record, { merge: true });
}

export async function hasAccess(userId: string, blueprintId: string) {
  const db = getFirestore();
  const purchaseDoc = await db
    .collection('purchases')
    .doc(getPurchaseDocId(userId, blueprintId))
    .get();

  return purchaseDoc.exists;
}
