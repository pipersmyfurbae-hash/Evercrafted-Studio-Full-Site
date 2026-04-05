import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ShoppingCart, Download, Clock, Star, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Simulated listing data
  const listing = {
    id,
    title: 'Soft Summer Crescent',
    price: 18,
    difficulty: 'Intermediate',
    time: '2 hours',
    description: 'A delicate, asymmetrical crescent wreath featuring soft summer blooms and airy foliage. Perfect for entryways.',
    materials: ['Blue Hydrangea (4)', 'White Rose (6)', 'Eucalyptus (2)'],
    image: 'https://picsum.photos/seed/wreath1/800/600',
    // Mock blueprint data for the engine
    blueprint: {
      id,
      elements: [
        { id: '1', element: 'Hydrangea', category: 'focal', angle_deg: 0, radius: 'inner', stem_count: 4 },
        { id: '2', element: 'Rose', category: 'secondary', angle_deg: 45, radius: 'mid', stem_count: 6 }
      ]
    }
  };

  useEffect(() => {
    // Check if user already has access (mock check)
    // In a real app, you'd fetch this from the backend
  }, [id, user]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please login to purchase");
      return;
    }
    setIsPurchasing(true);
    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: listing.id,
          title: listing.title,
          price: listing.price,
          // Pass blueprint data so it's stored on the server for download
          elements: listing.blueprint.elements
        }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Failed to start checkout");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleDownload = async () => {
    if (!user) return;
    setIsDownloading(true);
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, userId: user.uid }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Download failed");
      }

      const { url } = await response.json();
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `blueprint-${id}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error instanceof Error ? error.message : "Download failed");
    } finally {
      setIsDownloading(false);
    }
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

        {hasAccess ? (
          <Button className="w-full" size="lg" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
            Download Blueprint
          </Button>
        ) : (
          <Button className="w-full" size="lg" onClick={handlePurchase} disabled={isPurchasing}>
            {isPurchasing ? <Loader2 className="mr-2 animate-spin" /> : <ShoppingCart className="mr-2" />}
            {isPurchasing ? "Processing..." : "Buy & Download"}
          </Button>
        )}
      </div>
    </div>
  );
}
