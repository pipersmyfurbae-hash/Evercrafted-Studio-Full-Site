import React from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '../components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Cancel() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
        <XCircle className="w-12 h-12" />
      </div>
      
      <h1 className="text-4xl font-serif">Purchase Cancelled</h1>
      <p className="text-muted-foreground max-w-md">
        The purchase process was cancelled. No charges were made.
      </p>

      <div className="pt-4">
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
