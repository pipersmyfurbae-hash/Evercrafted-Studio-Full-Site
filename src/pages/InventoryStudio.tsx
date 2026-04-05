import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { getInventory, addInventoryItem, deleteInventoryItem } from '../services/firebase/inventoryService';
import { auth } from '../lib/firebase';

export const InventoryStudio: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    category: 'focal',
    colorFamily: '',
    quantity: 0,
    visualWeight: 'medium'
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    if (auth.currentUser) {
      const data = await getInventory(auth.currentUser.uid);
      setInventory(data);
    }
  };

  const addItem = async () => {
    if (!auth.currentUser || !newItem.name) return;
    await addInventoryItem(auth.currentUser.uid, newItem);
    setNewItem({ name: '', category: 'focal', colorFamily: '', quantity: 0, visualWeight: 'medium' });
    fetchInventory();
  };

  const deleteItem = async (itemId: string) => {
    await deleteInventoryItem(itemId);
    fetchInventory();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-light mb-6">Inventory Studio</h1>

      <div className="bg-surface p-4 rounded mb-6">
        <h2 className="text-lg mb-4">Add New Item</h2>
        <div className="grid grid-cols-2 gap-4">
          <input className="border p-2" placeholder="Name" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} />
          <select className="border p-2" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value as any})}>
            {['base', 'greenery', 'focal', 'filler', 'accent', 'ribbon'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input className="border p-2" placeholder="Color Family" value={newItem.colorFamily} onChange={(e) => setNewItem({...newItem, colorFamily: e.target.value})} />
          <input className="border p-2" type="number" placeholder="Quantity" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})} />
          <select className="border p-2" value={newItem.visualWeight} onChange={(e) => setNewItem({...newItem, visualWeight: e.target.value as any})}>
            {['light', 'medium', 'heavy'].map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <button onClick={addItem} className="bg-gold text-black px-4 py-2 rounded">Add Item</button>
        </div>
      </div>

      <div className="bg-surface p-4 rounded">
        <h2 className="text-lg mb-4">Current Inventory</h2>
        <div className="space-y-2">
          {inventory.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-neutral-100 p-2 rounded">
              <span>{item.name} ({item.category}) - {item.quantity}</span>
              <button onClick={() => deleteItem(item.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
