import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, BarChart3, Zap, ArrowRight } from 'lucide-react';

export default function InventoryMarketing() {
  return (
    <div className="min-h-screen bg-white-studio font-sans text-ink">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white-studio/90 backdrop-blur-md border-b border-ink/5">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-medium tracking-tight text-ink">Evercrafted</Link>
          <Link to="/app/inventory-weaver" className="px-6 py-2 bg-ink text-white text-[10px] font-bold tracking-widest uppercase rounded-full hover:bg-ink-2">
            Go to Inventory
          </Link>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <span className="display-text text-sage uppercase tracking-widest text-xs">Build Your Inventory</span>
          <h1 className="font-serif text-6xl md:text-8xl font-light tracking-tighter text-ink">
            The backbone of <br />
            <span className="italic text-sage-d">every design.</span>
          </h1>
          <p className="text-xl font-light text-muted-studio leading-relaxed">
            Stop guessing what you have in stock. Log, track, and cost your floral materials in one centralized system. Evercrafted ensures every design you generate is buildable, profitable, and ready to craft.
          </p>
          <Link 
            to="/app/inventory-weaver" 
            className="inline-flex items-center gap-2 px-10 py-5 bg-ink text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-ink-2 transition-all rounded-full"
          >
            Start Building Inventory <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          {[
            { icon: Package, title: 'Centralized Logging', desc: 'Log florals, foliage, ribbons, and embellishments in one structured system.' },
            { icon: BarChart3, title: 'Cost Analysis', desc: 'Understand the true cost of every design with automated material cost tracking.' },
            { icon: Zap, title: 'Inventory-Aware Design', desc: 'The Evercrafted engine uses your real stock data to generate buildable, profitable blueprints.' }
          ].map((feature, i) => (
            <div key={i} className="space-y-4">
              <feature.icon className="w-8 h-8 text-sage" />
              <h3 className="font-serif text-2xl">{feature.title}</h3>
              <p className="text-sm text-muted-studio">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
