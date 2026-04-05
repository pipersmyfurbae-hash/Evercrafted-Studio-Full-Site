import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutGrid, Target, Layers, ArrowRight } from 'lucide-react';

export default function BlueprintStudioMarketing() {
  return (
    <div className="min-h-screen bg-white-studio font-sans text-ink">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white-studio/90 backdrop-blur-md border-b border-ink/5">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-medium tracking-tight text-ink">Evercrafted</Link>
          <Link to="/app/blueprint-studio" className="px-6 py-2 bg-ink text-white text-[10px] font-bold tracking-widest uppercase rounded-full hover:bg-ink-2">
            Go to Blueprint Studio
          </Link>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <span className="display-text text-sage uppercase tracking-widest text-xs">Blueprint Studio</span>
          <h1 className="font-serif text-6xl md:text-8xl font-light tracking-tighter text-ink">
            Your inventory, <br />
            <span className="italic text-sage-d">intelligently designed.</span>
          </h1>
          <p className="text-xl font-light text-muted-studio leading-relaxed">
            Create designs using exactly what you have on hand.
          </p>
          <Link 
            to="/app/inventory" 
            className="inline-flex items-center gap-2 px-10 py-5 bg-ink text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-ink-2 transition-all rounded-full"
          >
            Upload Inventory →
          </Link>
          
          <div className="mt-16 p-8 bg-cream rounded-2xl border border-ink/10">
            <h3 className="font-serif text-2xl mb-8">Evercrafted Architecture</h3>
            <div className="space-y-2 text-sm font-mono text-ink/70">
              <p>Evercrafted Engine</p>
              <p>↓</p>
              <p>Blueprint JSON</p>
              <p>↓</p>
              <p className="font-bold text-ink">🧠 VISUALIZER</p>
              <p>↓</p>
              <p>SVG Layout + AI Image</p>
              <p>↓</p>
              <p>Export / Marketplace / Client</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          {[
            { icon: Target, title: 'Radial Mapping', desc: 'Precise 360° placement system ensures every element is perfectly positioned.' },
            { icon: Layers, title: 'Structural Layers', desc: 'Define how elements stack and interact spatially for depth and movement.' },
            { icon: LayoutGrid, title: 'Exportable Diagrams', desc: 'Generate build-ready SVG layouts, visual maps, and PDF guides.' }
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
