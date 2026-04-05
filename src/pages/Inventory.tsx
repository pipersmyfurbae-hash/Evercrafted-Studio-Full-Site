import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInventory() {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ name: '', category: '', qtyOnHand: 0, costPerUnit: 0 });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const querySnapshot = await getDocs(collection(db, 'inventory'));
    setItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAdd = async () => {
    try {
      await addDoc(collection(db, 'inventory'), {
        ...newItem,
        role: 'focal', // Default role for now
        userId: 'admin', // Placeholder
        createdAt: new Date().toISOString()
      });
      toast.success('Item added');
      fetchInventory();
    } catch (e) {
      toast.error('Failed to add item');
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'inventory', id));
    fetchInventory();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Admin Inventory Management</h1>
      <Card>
        <CardHeader><CardTitle>Add New Item</CardTitle></CardHeader>
        <CardContent className="flex gap-4">
          <Input placeholder="Name" onChange={e => setNewItem({...newItem, name: e.target.value})} />
          <Input placeholder="Category" onChange={e => setNewItem({...newItem, category: e.target.value})} />
          <Input type="number" placeholder="Qty" onChange={e => setNewItem({...newItem, qtyOnHand: parseInt(e.target.value)})} />
          <Input type="number" placeholder="Cost" onChange={e => setNewItem({...newItem, costPerUnit: parseFloat(e.target.value)})} />
          <Button onClick={handleAdd}><Plus /></Button>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="flex justify-between p-4 border rounded">
            <span>{item.name} - {item.qtyOnHand} in stock</span>
            <Button variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
