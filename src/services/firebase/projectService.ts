import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Project } from '../../types';

const COLLECTION = 'projects';

export const saveProject = async (project: Project) => {
  await setDoc(doc(db, COLLECTION, project.id), {
    ...project,
    updatedAt: new Date().toISOString()
  });
};

export const getProjects = async (userId: string) => {
  const q = query(
    collection(db, COLLECTION), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Project);
};

export const subscribeToProjects = (userId: string, callback: (projects: Project[]) => void) => {
  const q = query(
    collection(db, COLLECTION), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => doc.data() as Project));
  });
};

export const deleteProject = async (projectId: string) => {
  await deleteDoc(doc(db, COLLECTION, projectId));
};
