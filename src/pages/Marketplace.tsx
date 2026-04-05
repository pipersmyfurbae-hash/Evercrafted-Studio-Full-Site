import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { buttonVariants } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const designs = [
  { id: 'lst_001', title: 'Soft Summer Crescent', price: 18, difficulty: 'Intermediate', image: 'https://picsum.photos/seed/wreath1/400/400' },
  { id: 'lst_002', title: 'Rustic Fall Wreath', price: 22, difficulty: 'Advanced', image: 'https://picsum.photos/seed/wreath2/400/400' },
  { id: 'lst_003', title: 'Minimalist Spring Hoop', price: 15, difficulty: 'Beginner', image: 'https://picsum.photos/seed/wreath3/400/400' },
];

export default function Marketplace() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-serif text-primary">Evercrafted Marketplace</h1>
        <p className="text-muted-foreground">Discover and purchase buildable wreath designs from top creators.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {designs.map((design) => (
          <motion.div key={design.id} whileHover={{ y: -5 }}>
            <Card className="overflow-hidden">
              <img src={design.image} alt={design.title} className="w-full h-64 object-cover" />
              <CardHeader>
                <CardTitle>{design.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{design.difficulty}</span>
                  <span className="font-bold text-primary">${design.price}</span>
                </div>
                <Link to={`/app/marketplace/${design.id}`} className={cn(buttonVariants({ variant: 'default' }), "w-full")}>
                  View Details
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
