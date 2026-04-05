import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { getInventory, addInventoryItem, deleteInventoryItem } from '../services/firebase/inventoryService';
import { auth } from '../lib/firebase';

export const InventoryStudio: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    sku: '',
    name: '',
    category: 'focal',
    color: '',
    colorFamily: '',
    stock: 0,
    quantity: 0,
    role: 'focal',
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
    setNewItem({ 
      sku: '',
      name: '', 
      category: 'focal', 
      color: '',
      colorFamily: '', 
      stock: 0,
      quantity: 0, 
      role: 'focal',
      visualWeight: 'medium' 
    });
    fetchInventory();
  };

  const deleteItem = async (itemId: string) => {
    await deleteInventoryItem(itemId);
    fetchInventory();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-light mb-6 font-serif">Inventory Studio</h1>

      <div className="bg-surface p-6 rounded-lg mb-8 border border-foreground/5">
        <h2 className="text-lg mb-6 display-text opacity-60">Add New Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest opacity-40">SKU</label>
            <input className="w-full border p-3 bg-background" placeholder="e.g. ROSE-RED-01" value={newItem.sku} onChange={(e) => setNewItem({...newItem, sku: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest opacity-40">Name</label>
            <input className="w-full border p-3 bg-background" placeholder="e.g. Red Silk Rose" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest opacity-40">Category</label>
            <select className="w-full border p-3 bg-background" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})}>
              {['focal', 'secondary', 'accent', 'filler', 'greenery', 'base', 'ribbon'].map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest opacity-40">Color</label>
            <input className="w-full border p-3 bg-background" placeholder="e.g. Crimson" value={newItem.color} onChange={(e) => setNewItem({...newItem, color: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest opacity-40">Stock (Units)</label>
            <input className="w-full border p-3 bg-background" type="number" value={newItem.stock} onChange={(e) => setNewItem({...newItem, stock: parseInt(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest opacity-40">Role</label>
            <select className="w-full border p-3 bg-background" value={newItem.role} onChange={(e) => setNewItem({...newItem, role: e.target.value as any})}>
              {['focal', 'secondary', 'accent', 'filler', 'greenery'].map(role => <option key={role} value={role}>{role.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="md:col-span-3">
            <button onClick={addItem} className="w-full bg-foreground text-background px-8 py-4 rounded hover:opacity-90 transition-opacity display-text uppercase tracking-widest">Add to Inventory</button>
          </div>
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
