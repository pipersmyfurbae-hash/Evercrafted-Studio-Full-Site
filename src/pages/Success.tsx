import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button, buttonVariants } from '../components/ui/button';
import { CheckCircle, Download, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function Success() {
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get('item');
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (itemId && user) {
      verifyPurchase();
    }
  }, [itemId, user]);

  const verifyPurchase = async () => {
    try {
      const response = await fetch("/api/verify-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, userId: user?.uid }),
      });
      
      if (response.ok) {
        toast.success("Purchase verified!");
      } else {
        toast.error("Failed to verify purchase");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = async () => {
    if (!itemId || !user) return;
    setIsDownloading(true);
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, userId: user.uid }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Download failed");
      }

      const { url } = await response.json();
      
      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `blueprint-${itemId}.svg`;
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
        <CheckCircle className="w-12 h-12" />
      </div>
      
      <h1 className="text-4xl font-serif">Purchase Successful!</h1>
      <p className="text-muted-foreground max-w-md">
        Thank you for your purchase. Your blueprint is now ready for download.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button 
          size="lg" 
          onClick={handleDownload} 
          disabled={isVerifying || isDownloading}
          className="px-8"
        >
          <Download className="mr-2 w-5 h-5" />
          {isDownloading ? "Preparing Download..." : "Download Blueprint"}
        </Button>
        
        <Link 
          to="/app/marketplace" 
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-8")}
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back to Marketplace
        </Link>
      </div>
    </div>
  );
}
