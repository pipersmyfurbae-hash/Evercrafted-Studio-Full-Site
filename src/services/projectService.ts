import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export interface ProjectData {
  userId: string;
  name: string;
  source: string; // e.g., 'Memory Weaver', 'Inventory Weaver', 'Design Studio'
  blueprint: any;
  render: string; // The generated image URL or SVG
  createdAt?: any;
  status: 'active' | 'archived';
  motion?: {
    type: string;
    profile: string;
    intensity: number;
    duration: number;
    fps: number;
  };
}

export async function createProject(data: ProjectData) {
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export function subscribeToUserProjects(userId: string, callback: (projects: any[]) => void) {
  const q = query(
    collection(db, 'projects'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(projects);
  });
}
