import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function InventoryWeaver() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'inventory'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventory(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl editorial-title text-primary">
            Inventory Weaver
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Design wreath blueprints using ONLY the materials currently available in your studio inventory.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <Card className="border-none shadow-none bg-white/40 backdrop-blur-sm p-6">
            <CardHeader className="px-0 pt-0 border-b border-primary/5 pb-4 mb-6">
              <CardTitle className="display-text text-sm">Available Inventory</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {loading ? (
                <p className="text-primary/40 font-serif italic">Loading inventory...</p>
              ) : (
                <ul className="space-y-2">
                  {inventory.map(item => (
                    <li key={item.id} className="p-2 border border-primary/10 bg-white/50">
                      {item.name} ({item.qtyOnHand} in stock)
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="border-none shadow-none bg-white/20 backdrop-blur-sm p-8">
            <CardTitle className="display-text text-sm mb-6">Design Canvas</CardTitle>
            <p className="text-primary/40 font-serif italic">Design tool interface will be implemented here.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
