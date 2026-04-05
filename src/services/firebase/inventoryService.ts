import { db } from '../../lib/firebase';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { InventoryItem } from '../../types';

export const getInventory = async (userId: string): Promise<InventoryItem[]> => {
  const q = query(collection(db, 'inventory'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as InventoryItem));
};

export const addInventoryItem = async (userId: string, item: Omit<InventoryItem, 'id'>) => {
  return await addDoc(collection(db, 'inventory'), { ...item, userId });
};

export const deleteInventoryItem = async (itemId: string) => {
  return await deleteDoc(doc(db, 'inventory', itemId));
};
