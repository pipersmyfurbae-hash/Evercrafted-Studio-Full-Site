import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Zap, ShoppingBag, BrainCircuit, PenTool, Layers, Box, FileText, Settings, ChevronRight, ArrowRight, Menu, X } from 'lucide-react';

export default function EvercraftedLanding() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F7F4] text-[#1A1A1A] font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-10 h-[68px] flex items-center justify-between transition-all duration-300 ${isScrolled ? 'bg-[#F9F7F4]/95 backdrop-blur-md shadow-sm' : 'bg-[#F9F7F4]/80 backdrop-blur-md'}`}>
        <a href="#" className="font-script text-3xl font-bold text-[#4A6741]">Evercrafted</a>
        <ul className="hidden md:flex items-center gap-9 list-none">
          {['Features', 'How it Works', 'Pricing', 'FAQ'].map(item => (
            <li key={item}><a href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-[#4A4A4A] hover:text-[#4A6741] transition-colors">{item}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <button className="text-sm text-[#4A4A4A] hover:text-[#4A6741]">Sign in</button>
          <a href="#waitlist" className="bg-[#4A6741] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#6B8F67] transition-all">Get Early Access</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-[68px] relative overflow-hidden bg-[#F9F7F4]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(74,103,65,0.09)_0%,transparent_70%)] blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(242,239,233,0.8)_0%,transparent_70%)] blur-[80px] rounded-full" />
        </div>

        <div className="container mx-auto px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="py-20">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-[#EEF2ED] border border-[#4A6741]/20 rounded-full px-4 py-1.5 text-[11px] font-mono text-[#4A6741] uppercase tracking-widest mb-7">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4A6741] animate-pulse" />
                Now in Early Access
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-serif text-6xl md:text-8xl font-light tracking-tighter leading-[0.95] text-[#1A1A1A]">
                Design wreaths<br/>with <em className="text-[#4A6741] not-italic">intention</em>,<br/>
                <span className="font-script text-6xl md:text-7xl font-semibold text-[#6B8F67]">powered by AI</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-[#4A4A4A] leading-relaxed max-w-md mt-6">
                Evercrafted transforms client feelings, seasonal briefs, and botanical inventory into production-ready wreath blueprints — complete with SVG renders, Midjourney prompts, and step-by-step build guides.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-4 mt-9">
                <a href="#waitlist" className="bg-[#4A6741] text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-[#6B8F67] transition-all shadow-lg shadow-[#4A6741]/30">Start Designing Free</a>
                <a href="#how-it-works" className="border border-[#D0D0D0] text-[#1A1A1A] px-8 py-4 rounded-full text-sm font-medium hover:bg-[#EEF2ED] transition-all">See How It Works</a>
              </motion.div>
            </div>
            
            {/* Placeholder for Wreath Illustration */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="w-[500px] h-[500px] bg-[#E8E8E8]/20 rounded-full border-2 border-dashed border-[#4A6741]/20 flex items-center justify-center">
                <span className="font-serif text-xl text-[#4A6741]/40 italic">Wreath Visualization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#4A6741] py-5 overflow-hidden">
        <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="flex gap-14 whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-6 text-[#FFFFFF]/75 font-serif text-base">
              Blueprint Composition Engine <div className="w-1 h-1 rounded-full bg-[#FFFFFF]/40" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pricing Section Placeholder */}
      <section id="pricing" className="py-20 bg-[#F9F7F4]">
        <div className="container mx-auto px-10 text-center">
          <h2 className="text-5xl font-serif mb-10">Start free. Scale as you grow.</h2>
          <div className="flex justify-center items-center gap-4 mb-12">
            <span className="text-sm">Monthly</span>
            <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')} className="w-12 h-6 bg-[#4A6741] rounded-full relative">
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${billingCycle === 'annual' ? 'left-6' : 'left-0.5'}`} />
            </button>
            <span className="text-sm">Annual</span>
            <span className="bg-[#EEF2ED] text-[#4A6741] text-[10px] px-2 py-1 rounded-full">Save 20%</span>
          </div>
          {/* Pricing Grid would go here */}
        </div>
      </section>
      {/* Stats Bar */}
      <section className="py-20 bg-white border-b border-[#E8E8E8]">
        <div className="container mx-auto px-10 grid grid-cols-2 md:grid-cols-4 gap-0">
          {[
            { num: '10+', label: 'AI-Powered Skill Modules' },
            { num: '4', label: 'Subscription Tiers' },
            { num: '24"', label: 'Blueprint Canvas Standard' },
            { num: '∞', label: 'Genome Variations' }
          ].map((stat, i) => (
            <div key={i} className="text-center py-8 border-r border-[#E8E8E8] last:border-r-0">
              <div className="font-serif text-5xl font-light text-[#1A1A1A]">{stat.num}</div>
              <div className="font-mono text-[11px] text-[#787878] uppercase tracking-widest mt-3">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-28 bg-[#F9F7F4]">
        <div className="container mx-auto px-10 text-center">
          <h2 className="text-5xl font-serif mb-10">Start free. Scale as you grow.</h2>
          <div className="flex justify-center items-center gap-4 mb-12">
            <span className="text-sm">Monthly</span>
            <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')} className="w-12 h-6 bg-[#4A6741] rounded-full relative">
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${billingCycle === 'annual' ? 'left-6' : 'left-0.5'}`} />
            </button>
            <span className="text-sm">Annual</span>
            <span className="bg-[#EEF2ED] text-[#4A6741] text-[10px] px-2 py-1 rounded-full">Save 20%</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: 'Bloom', price: 0, desc: 'For curious beginners' },
              { name: 'Craft', price: billingCycle === 'monthly' ? 19 : 15, desc: 'For serious hobbyists' },
              { name: 'Studio', price: billingCycle === 'monthly' ? 49 : 39, desc: 'For working wreath artists' },
              { name: 'Atelier', price: billingCycle === 'monthly' ? 99 : 79, desc: 'For studios & power sellers' }
            ].map((tier, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-[#E8E8E8] shadow-sm">
                <h3 className="font-serif text-2xl mb-2">{tier.name}</h3>
                <p className="text-sm text-[#4A4A4A] mb-6">{tier.desc}</p>
                <div className="text-4xl font-serif mb-8">${tier.price}<span className="text-sm text-[#787878]">/mo</span></div>
                <button className="w-full py-3 rounded-full border border-[#4A6741] text-[#4A6741] hover:bg-[#4A6741] hover:text-white transition-all">Get Started</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 bg-[#F9F7F4]">
        <div className="container mx-auto px-10">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#4A6741] mb-4 block">What Evercrafted Does</span>
            <h2 className="font-serif text-5xl font-light tracking-tight">Every tool a wreath<br/><em>maker needs</em></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-[#E8E8E8] border border-[#E8E8E8] rounded-2xl overflow-hidden">
            {[
              { icon: BrainCircuit, name: 'Wreath Genome System', desc: 'Encode any wreath into a compact genome string.' },
              { icon: PenTool, name: 'Blueprint Composition', desc: 'Mathematically structured blueprints.' },
              { icon: FileText, name: 'Blueprint Reverse Engineer', desc: 'Decode any wreath into a recipe.' },
              { icon: Zap, name: 'Midjourney Integration', desc: 'Blueprint to photoreal render prompt.', wide: true },
              { icon: Leaf, name: 'Floral Emotion Tagger', desc: 'Tag inventory with emotion labels.' },
              { icon: Layers, name: 'Inventory Intelligence', desc: 'Per-item botanical research.' },
              { icon: ShoppingBag, name: 'Etsy Listing Builder', desc: 'SEO-aware listing copy.' },
              { icon: Settings, name: 'Builder Instructions', desc: 'Step-by-step guides.' },
              { icon: Box, name: 'Blueprint Scoring', desc: 'Validated design quality.' }
            ].map((f, i) => (
              <div key={i} className={`bg-white p-10 ${f.wide ? 'md:col-span-2' : ''} hover:bg-[#EEF2ED] transition-colors`}>
                <f.icon className="w-10 h-10 text-[#4A6741] mb-5" />
                <h3 className="font-serif text-2xl mb-3">{f.name}</h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section id="waitlist" className="py-28 bg-[#4A6741] text-white text-center">
        <div className="container mx-auto px-10">
          <h2 className="text-5xl font-serif mb-6">Ready to begin?</h2>
          <p className="text-lg text-white/70 mb-10 max-w-lg mx-auto">Join the early access list. Free Bloom tier, no credit card, and you'll be among the first to access new tools as they ship.</p>
          <div className="flex gap-4 justify-center">
            <input type="email" placeholder="your@email.com" className="px-6 py-3 rounded-full text-[#1A1A1A] w-64" />
            <button className="bg-white text-[#4A6741] px-8 py-3 rounded-full font-medium">Get Access</button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-28 bg-white">
        <div className="container mx-auto px-10 grid md:grid-cols-3 gap-12">
          <h2 className="text-4xl font-serif">Things people<br/><em>ask us</em></h2>
          <div className="md:col-span-2 space-y-6">
            {[
              { q: 'Do I need design experience?', a: 'Not at all. The Bloom tier is built for beginners.' },
              { q: 'What is a Wreath Genome String?', a: 'A compact code that fully describes a wreath design.' }
            ].map((faq, i) => (
              <div key={i} className="border-b border-[#E8E8E8] pb-6">
                <button className="flex justify-between w-full text-left font-serif text-xl">{faq.q} <span>+</span></button>
                <p className="text-sm text-[#4A4A4A] mt-4">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-20">
        <div className="container mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <span className="font-script text-3xl text-[#4A6741] mb-4 block">Evercrafted</span>
              <p className="text-sm text-white/40 leading-relaxed">The AI design studio built exclusively for wreath artists — where emotion becomes structure, and structure becomes beauty.</p>
            </div>
            {['Platform', 'Tools', 'Company'].map((col, i) => (
              <div key={i}>
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-6">{col}</h4>
                <ul className="space-y-4 text-sm text-white/60">
                  <li><a href="#" className="hover:text-white">Link 1</a></li>
                  <li><a href="#" className="hover:text-white">Link 2</a></li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
