import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BrainCircuit, PackageSearch, PenTool, ArrowRight, ShoppingBag, Camera, TrendingUp, Calendar, Image, Truck, Bot, LayoutDashboard, Heart, Zap, X, Package, Palette, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const slides = ["/home-01.jpg", "/home-02.jpg", "/home-03.jpg", "/home-04.jpg", "/home-05.jpg"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const tools = [
    { 
      title: 'Build Your Inventory', 
      path: '/inventory-marketing', 
      icon: Package, 
      desc: 'Log, organize, and manage all floral design materials.', 
      longDesc: 'The foundational system within Evercrafted that allows users to log, organize, and manage all floral design materials in one centralized place. Ensures all downstream design generation is inventory-aware.' 
    },
    { 
      title: 'Memory Weaver', 
      path: '/app/memory-weaver', 
      icon: BrainCircuit, 
      desc: 'Map emotional data to floral palettes.', 
      longDesc: 'Transforms personal memories, stories, or emotional prompts into professionally designed wreath blueprints using deterministic floral composition rules.' 
    },
    { 
      title: 'Inventory', 
      path: '/app/inventory', 
      icon: PackageSearch, 
      desc: 'Manage your studio materials.', 
      longDesc: 'The foundational system within Evercrafted that allows users to log, organize, and manage all floral design materials in one centralized place.' 
    },
    { 
      title: 'Inventory Weaver', 
      path: '/app/inventory-weaver', 
      icon: BrainCircuit, 
      desc: 'Design blueprints from client inventory.', 
      longDesc: 'A deterministic design engine that generates wreath blueprints using ONLY the materials currently available in your studio inventory.' 
    },
    { 
      title: 'Visualize with AI', 
      path: '/app/visualize-with-ai', 
      icon: Palette, 
      desc: 'Generate photorealistic previews.', 
      longDesc: 'Transform your completed blueprint into a high-end, photorealistic preview of the final wreath before it is physically built.' 
    },
    { 
      title: 'Blueprint Studio', 
      path: '/app/blueprint-studio', 
      icon: PenTool, 
      desc: '360° radial composition engine.', 
      longDesc: 'Your professional design canvas. Define structural layers, map element placement, and calculate material costs in real-time.' 
    },
    { 
      title: 'Marketplace', 
      path: '/app/marketplace', 
      icon: ShoppingBag, 
      desc: 'Browse buildable designs.', 
      longDesc: 'Discover and purchase buildable wreath designs from top creators.' 
    },
    { 
      title: 'Creator Dashboard', 
      path: '/app/creator-dashboard', 
      icon: BarChart3, 
      desc: 'Manage your listings and earnings.', 
      longDesc: 'Track your sales, manage your listings, and view your earnings from your wreath design sales.' 
    },
    { 
      title: 'Inventory Vision', 
      path: '/app/inventory-vision', 
      icon: Camera, 
      desc: 'AI-powered workbench scanning.', 
      longDesc: 'Uses AI-powered workbench scanning to visually identify floral items and automatically update your inventory levels.' 
    },
    { 
      title: 'Profit Predictor', 
      path: '/app/profit-predictor', 
      icon: TrendingUp, 
      desc: 'AI-driven pricing optimization.', 
      longDesc: 'Optimizes your pricing strategy by analyzing your material costs, labor time, and market trends to ensure every design is profitable.' 
    },
    { 
      title: 'Wreath Remixer', 
      path: '/app/wreath-remixer', 
      icon: Zap, 
      desc: 'Generative design iteration.', 
      longDesc: 'Iterates on existing wreath blueprints using generative AI constraints, allowing you to quickly create variations or adapt designs.' 
    },
    { 
      title: 'Workflow Automator', 
      path: '/app/workflow-automator', 
      icon: Bot, 
      desc: 'Automate design and business tasks.', 
      longDesc: 'Automates repetitive design and business tasks, such as generating client emails, scheduling posts, or organizing project files.' 
    },
    { 
      title: 'Productivity Dashboard', 
      path: '/app/productivity-dashboard', 
      icon: LayoutDashboard, 
      desc: 'Centralized task and deadline view.', 
      longDesc: 'A centralized view of all your active tasks, project deadlines, and business statuses to keep your studio running smoothly.' 
    },
    { 
      title: 'Customer Retention', 
      path: '/app/customer-retention', 
      icon: Heart, 
      desc: 'AI-suggested retention strategies.', 
      longDesc: 'Uses AI to analyze client history and suggest personalized strategies to improve customer loyalty and repeat business.' 
    },
    { 
      title: 'Moodboard Parser', 
      path: '/app/moodboard-parser', 
      icon: Image, 
      desc: 'AI client board DNA extraction.', 
      longDesc: 'Extracts design DNA (color palettes, textures, floral types) from client-provided moodboards using AI.' 
    },
    { 
      title: 'Trend Forecaster', 
      path: '/app/trend-forecaster', 
      icon: Calendar, 
      desc: 'Predictive seasonal mood analysis.', 
      longDesc: 'Analyzes seasonal trends, social media aesthetics, and market data to predict upcoming floral mood and style preferences.' 
    },
    { 
      title: 'Shipping Optimizer', 
      path: '/app/shipping-optimizer', 
      icon: Truck, 
      desc: 'AI-driven logistics optimization.', 
      longDesc: 'Analyzes logistics data to optimize your shipping methods, reducing costs and improving delivery times.' 
    },
  ];

  return (
    <div className="p-8 space-y-12">
      <header className="space-y-2">
        <span className="display-text opacity-40">Studio Overview</span>
        <h1 className="font-display text-5xl tracking-tighter">
          Welcome Back <br />
          <span className="editorial-title text-4xl">to the Studio</span>
        </h1>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tools.map((item, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedTool(item)}
            className="group bg-background p-6 h-full space-y-4 hover:bg-muted/50 transition-all border border-foreground/5 rounded-lg text-left"
          >
            <item.icon className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="space-y-1">
              <h3 className="editorial-title text-xl">{item.title}</h3>
              <p className="text-[10px] opacity-50 leading-relaxed uppercase tracking-widest">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedTool && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            onClick={() => setSelectedTool(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background p-12 max-w-lg w-full rounded-lg border border-foreground/10 shadow-2xl space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <selectedTool.icon className="w-12 h-12 opacity-20" />
                <button onClick={() => setSelectedTool(null)}><X className="w-6 h-6 opacity-40 hover:opacity-100" /></button>
              </div>
              <h2 className="editorial-title text-4xl">{selectedTool.title}</h2>
              <p className="text-sm opacity-70 leading-relaxed">{selectedTool.longDesc}</p>
              <Link to={selectedTool.path} className="block w-full text-center py-4 bg-foreground text-background font-bold uppercase tracking-widest text-xs hover:opacity-80 transition-opacity">
                Activate Tool
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="glass-panel p-8 space-y-6">
          <span className="display-text opacity-40">Recent Activity</span>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b border-foreground/5 pb-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium">Summer Solstice Wreath</p>
                  <p className="text-[9px] opacity-40 uppercase tracking-widest">Modified 2 hours ago</p>
                </div>
                <Link to="/app/blueprint-studio" className="display-text text-[8px] hover:opacity-50 transition-opacity">Open</Link>
              </div>
            ))}
          </div>
        </div>
        <div className="aspect-video bg-muted overflow-hidden relative group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <img 
                src={slides[currentSlide]} 
                alt="Studio" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all duration-1000" />
          <div className="absolute bottom-6 left-6">
            <span className="display-text text-white drop-shadow-md text-sm">Inspiration Gallery</span>
          </div>
        </div>
      </section>
    </div>
  );
}
