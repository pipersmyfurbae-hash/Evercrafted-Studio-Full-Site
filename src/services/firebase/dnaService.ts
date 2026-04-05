// src/services/firebase/dnaService.ts

import { db, auth } from '../../lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { WreathDNA } from '../../types';

export const saveDNA = async (name: string, dna: WreathDNA) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  return await addDoc(collection(db, 'wreathDNA'), {
    userId: auth.currentUser.uid,
    name,
    dna,
    createdAt: new Date().toISOString()
  });
};

export const getSavedDNA = async () => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const q = query(collection(db, 'wreathDNA'), where('userId', '==', auth.currentUser.uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteDNA = async (dnaId: string) => {
  return await deleteDoc(doc(db, 'wreathDNA', dnaId));
};
