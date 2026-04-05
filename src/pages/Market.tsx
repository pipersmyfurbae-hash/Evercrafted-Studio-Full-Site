import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { motion } from 'motion/react';

const marketImages = [
  { id: '09', src: '/market-09.jpg', title: 'Dried Statice & Lavender' },
  { id: '10', src: '/market-10.jpg', title: 'Eucalyptus & Seeded Pods' },
  { id: '11', src: '/market-11.jpg', title: 'Preserved Hydrangea' },
  { id: '12', src: '/market-12.jpg', title: 'Grapevine Base - Large' },
  { id: '13', src: '/market-13.jpg', title: 'Silk Peony - Blush' },
  { id: '14', src: '/market-14.jpg', title: 'Velvet Ribbon - Moss' },
  { id: '15', src: '/market-15.jpg', title: 'Wired Pine Branches' },
  { id: '16', src: '/market-16.jpg', title: 'Dried Wheat Stems' },
  { id: '17', src: '/market-17.jpg', title: 'Cotton Bolls - Natural' },
  { id: '18', src: '/market-18.jpg', title: 'Preserved Boxwood' },
];

export default function Market() {
  return (
    <div className="p-8 lg:p-12 space-y-16">
      <header className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-[1px] w-12 bg-ink/20" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-studio font-bold">Curated Inventory</span>
        </div>
        <h1 className="text-6xl editorial-title text-ink leading-[0.9]">
          The Floral <br />
          <span className="italic font-light">Marketplace</span>
        </h1>
        <p className="text-muted-studio/80 font-serif italic text-lg leading-relaxed">
          Explore our curated selection of high-end faux botanicals and preserved elements for your next Evercrafted design.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {marketImages.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group border-none bg-transparent shadow-none cursor-pointer">
              <CardContent className="p-0 space-y-4">
                <div className="aspect-[3/4] overflow-hidden bg-muted-studio/5 relative">
                  <img 
                    src={image.src} 
                    alt={image.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 group-hover:scale-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 border border-ink/5 group-hover:border-ink/20 transition-colors" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink">{image.title}</h3>
                    <span className="text-[9px] text-muted-studio/40 font-mono">#{image.id}</span>
                  </div>
                  <p className="text-[9px] uppercase tracking-tighter text-muted-studio/60 italic">Available for Blueprinting</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <footer className="pt-12 border-t border-ink/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink">Evercrafted Master Engine v1</p>
            <p className="text-[9px] text-muted-studio/40 uppercase tracking-tighter">Deterministic Floral Design System</p>
          </div>
          <div className="flex gap-12">
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink">Materials</p>
              <p className="text-[9px] text-muted-studio/40 uppercase tracking-tighter">10 Curated Items</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink">Status</p>
              <p className="text-[9px] text-sage-d uppercase tracking-tighter font-bold">Ready for Build</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
