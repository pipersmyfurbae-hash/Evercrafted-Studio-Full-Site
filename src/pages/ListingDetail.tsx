import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ShoppingCart, Download, Clock, Star } from 'lucide-react';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [purchased, setPurchased] = useState(false);

  // Simulated listing data
  const listing = {
    id,
    title: 'Soft Summer Crescent',
    price: 18,
    difficulty: 'Intermediate',
    time: '2 hours',
    description: 'A delicate, asymmetrical crescent wreath featuring soft summer blooms and airy foliage. Perfect for entryways.',
    materials: ['Blue Hydrangea (4)', 'White Rose (6)', 'Eucalyptus (2)'],
    image: 'https://picsum.photos/seed/wreath1/800/600'
  };

  return (
    <div className="p-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
      <img src={listing.image} alt={listing.title} className="w-full h-auto rounded-lg shadow-lg" />
      
      <div className="space-y-6">
        <h1 className="text-4xl font-serif">{listing.title}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1"><Star className="w-4 h-4" /> {listing.difficulty}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {listing.time}</span>
        </div>
        <p className="text-xl font-bold text-primary">${listing.price}</p>
        <p className="text-muted-foreground">{listing.description}</p>
        
        <Card>
          <CardHeader><CardTitle>Materials List</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {listing.materials.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </CardContent>
        </Card>

        {purchased ? (
          <Button className="w-full" size="lg">
            <Download className="mr-2" /> Download Blueprint
          </Button>
        ) : (
          <Button className="w-full" size="lg" onClick={() => setPurchased(true)}>
            <ShoppingCart className="mr-2" /> Buy & Download
          </Button>
        )}
      </div>
    </div>
  );
}
