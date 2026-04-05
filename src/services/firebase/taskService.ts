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
import { Task } from '../../types';

const COLLECTION = 'tasks';

export const saveTask = async (task: Task) => {
  await setDoc(doc(db, COLLECTION, task.id), {
    ...task,
    updatedAt: new Date().toISOString()
  });
};

export const getTasks = async (userId: string) => {
  const q = query(
    collection(db, COLLECTION), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Task);
};

export const subscribeToTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  const q = query(
    collection(db, COLLECTION), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => doc.data() as Task));
  });
};

export const updateTaskStatus = async (taskId: string, status: Task['status']) => {
  await updateDoc(doc(db, COLLECTION, taskId), {
    status,
    updatedAt: new Date().toISOString()
  });
};

export const deleteTask = async (taskId: string) => {
  await deleteDoc(doc(db, COLLECTION, taskId));
};
