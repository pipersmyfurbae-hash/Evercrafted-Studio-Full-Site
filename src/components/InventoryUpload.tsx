import React, { useState } from 'react';
import { buttonVariants } from '../components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function InventoryUpload({ onUpload }: { onUpload: (data: any) => void }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/inventory/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      onUpload(data.records);
      toast.success('Inventory uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload inventory');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        id="csv-upload"
      />
      <label 
        htmlFor="csv-upload" 
        className={cn(buttonVariants({ variant: 'default' }), "cursor-pointer", isUploading && "pointer-events-none opacity-50")}
      >
        {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
        Upload Inventory CSV
      </label>
    </div>
  );
}
