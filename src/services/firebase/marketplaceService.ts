import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Blueprint } from '../../types';

export const publishToMarketplace = async (blueprint: Blueprint, price: number, creatorId: string) => {
  try {
    const docRef = await addDoc(collection(db, 'marketplace_listings'), {
      ...blueprint,
      price,
      creatorId,
      createdAt: serverTimestamp(),
      status: 'published'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error publishing to marketplace:', error);
    throw error;
  }
};
