import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Instagram, 
  Mail, 
  MapPin, 
  Search, 
  Map as MapIcon, 
  BrainCircuit, 
  PackageSearch, 
  PenTool,
  CheckCircle2,
  Star,
  Layout
} from 'lucide-react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroTitle] = useState(() => {
    const titles = [
      "design WITH HEART.", "craft WITH SOUL.", "create WITH PURPOSE.",
      "wreaths MADE BEAUTIFUL.", "artistry IN EVERY STEM.", "design YOUR VISION.",
      "florals REIMAGINED.", "crafting TIMELESS PIECES.", "beauty IN THE DETAILS.",
      "design WITHOUT LIMITS.", "wreaths WITH CHARACTER.", "your VISION, CRAFTED.",
      "elevate YOUR ART.", "design WITH INTENTION.", "master THE ART."
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  });
  const [titlePart1, titlePart2] = heroTitle.split(' ');
  const slides = [
    {
      url: "/home-01.jpg",
      name: "The Studio Collection",
      tag: "Minimal · High-End",
      desc: "White ranunculus, cream silk roses, dried eucalyptus",
      mood: "Elevated"
    },
    {
      url: "/home-02.jpg",
      name: "Coastal Serenity",
      tag: "Calm · Cool",
      desc: "Blue hydrangea, white lavender, sage foliage",
      mood: "Calm"
    },
    {
      url: "/home-03.jpg",
      name: "Golden Hour",
      tag: "Warm · Dramatic",
      desc: "Peach garden roses, coral ranunculus, blue accents",
      mood: "Dramatic"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream font-sans text-ink selection:bg-sage-l selection:text-ink">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[200] h-16 bg-white-studio/95 backdrop-blur-md border-b border-ink/5">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 h-full flex items-center">
          <Link to="/" className="logo flex items-center gap-2 font-serif text-xl font-medium tracking-tight text-ink">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
              <ellipse cx="10" cy="4.5" rx="3.2" ry="5.5" fill="currentColor" className="text-sage opacity-70" transform="rotate(0,10,10)"/>
              <ellipse cx="10" cy="4.5" rx="3.2" ry="5.5" fill="currentColor" className="text-sage opacity-60" transform="rotate(72,10,10)"/>
              <ellipse cx="10" cy="4.5" rx="3.2" ry="5.5" fill="currentColor" className="text-sage opacity-70" transform="rotate(144,10,10)"/>
              <ellipse cx="10" cy="4.5" rx="3.2" ry="5.5" fill="currentColor" className="text-sage opacity-60" transform="rotate(216,10,10)"/>
              <ellipse cx="10" cy="4.5" rx="3.2" ry="5.5" fill="currentColor" className="text-sage opacity-70" transform="rotate(288,10,10)"/>
              <circle cx="10" cy="10" r="2.2" fill="currentColor" className="text-bark"/>
            </svg>
            Evercrafted
          </Link>
          
          <div className="hidden lg:flex gap-6 ml-10">
            {['Home', 'How it works', 'Apps', 'Marketplace', 'Pricing'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                className="text-[10px] text-muted-studio hover:text-ink tracking-[0.14em] uppercase transition-colors font-medium"
              >
                {item}
              </a>
            ))}
            <Link 
              to="/moodoor" 
              className="text-[10px] text-muted-studio hover:text-ink tracking-[0.14em] uppercase transition-colors font-medium"
            >
              Moodoor
            </Link>
            <Link 
              to="/emotion-lens" 
              className="text-[10px] text-muted-studio hover:text-ink tracking-[0.14em] uppercase transition-colors font-medium"
            >
              EmotionLens
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Link to="/login" className="text-[11px] text-muted-studio hover:text-ink tracking-[0.12em] uppercase transition-colors font-medium">
              Sign in
            </Link>
            <Link 
              to="/app" 
              className="px-5 py-2 bg-ink text-white-studio text-[11px] font-medium tracking-wider hover:bg-ink-2 transition-colors"
            >
              Start designing
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-16 min-h-screen relative flex items-center justify-center overflow-hidden">
        {/* Background Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                src={slides[currentSlide].url} 
                alt={slides[currentSlide].name} 
                className="w-full h-full object-cover grayscale-[20%] brightness-[0.7]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-ink/20" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-32 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-[1px] bg-white-studio/40" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white-studio/80">Evercrafted Studio</span>
            <div className="w-12 h-[1px] bg-white-studio/40" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="font-serif text-[clamp(64px,12vw,160px)] font-light leading-[0.85] tracking-tighter text-white-studio mb-12"
          >
            <span className="salty-style block mb-4">{heroTitle.split(' ')[0]}</span>
            <span className="life-style">{heroTitle.split(' ').slice(1).join(' ')}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="max-w-xl text-lg md:text-xl font-light leading-relaxed text-white-studio/90 mb-16 font-serif italic"
          >
            Professional design tools for wreath makers. Start with a feeling, a memory, or your own inventory and get back a complete, buildable blueprint.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap gap-8 justify-center"
          >
            <Link 
              to="/app/blueprint-studio" 
              className="px-16 py-6 bg-white-studio text-ink text-[11px] font-bold tracking-[0.25em] uppercase hover:bg-cream transition-all shadow-2xl"
            >
              Start designing
            </Link>
            <Link 
              to="/blueprint-studio" 
              className="px-16 py-6 border border-white-studio/20 text-white-studio text-[11px] font-bold tracking-[0.25em] uppercase hover:bg-white-studio/10 backdrop-blur-sm transition-all"
            >
              View Sample
            </Link>
          </motion.div>
        </div>

        {/* Floating Mood Label */}
        <div className="absolute bottom-12 left-12 z-20 hidden md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white-studio/10 backdrop-blur-md border border-white-studio/10 p-8 shadow-2xl"
            >
              <div className="text-[9px] tracking-[0.3em] uppercase text-white-studio/60 mb-2">Current Mood</div>
              <div className="font-serif text-3xl italic text-white-studio leading-none">{slides[currentSlide].mood}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 right-12 z-20 flex flex-col gap-6">
          {slides.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="group flex items-center gap-4 text-right"
            >
              <span className={`text-[9px] font-bold tracking-widest uppercase transition-all duration-500 ${
                currentSlide === i ? 'text-white-studio opacity-100' : 'text-white-studio/30 opacity-0 group-hover:opacity-60'
              }`}>
                0{i + 1}
              </span>
              <div className={`w-1 h-16 transition-all duration-700 ${
                currentSlide === i ? 'bg-white-studio w-2' : 'bg-white-studio/20'
              }`} />
            </button>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-[1px] h-12 bg-gradient-to-b from-white-studio/0 via-white-studio/50 to-white-studio/0" />
        </div>
      </section>

      {/* Process Section - High-End Editorial Split Layout */}
      <section id="how-it-works" className="bg-white-studio border-t border-ink/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-32">
          <div className="text-center mb-32 space-y-8">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-[1px] bg-ink/10" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-ink/40">How it works</span>
              <div className="w-12 h-[1px] bg-ink/10" />
            </div>
            <h2 className="font-serif text-[clamp(48px,8vw,96px)] font-light tracking-tighter text-ink leading-[0.9]">
              From concept to <span className="italic text-sage-d">finished design</span> <br />
              in four steps
            </h2>
            <p className="max-w-2xl mx-auto text-lg md:text-xl font-light text-muted-studio leading-relaxed font-serif italic">
              Evercrafted guides you from initial inspiration through a structured design process — so every wreath you make is intentional, repeatable, and profitable.
            </p>
          </div>

          <div className="space-y-0 border-b border-ink/10">
            {[
              {
                n: '01',
                title: 'Build your inventory',
                desc: "Log your florals, foliage, ribbons, and embellishments. Track quantities, costs, and seasonal availability — all in one place.",
                img: "/home-04.jpg",
                tag: "BLOOM & ABOVE",
                included: ["Material logging", "Quantity tracking", "Cost analysis"],
                link: "/app/inventory"
              },
              {
                n: '02',
                title: 'Generate a blueprint',
                desc: "Use the Blueprint Studio to map out your design — element placement, color story, structural layers. Export a shareable layout diagram.",
                img: "/home-02.jpg",
                tag: "STUDIO & ABOVE",
                included: ["Radial mapping", "Color story design", "Exportable diagrams"],
                link: "/app/blueprint-studio"
              },
              {
                n: '03',
                title: 'Visualize with AI',
                desc: "Feed your blueprint into the AI Visualizer. Generate photorealistic previews, explore colorway variations, and share with clients before a single stem is cut.",
                img: "/home-06.jpg",
                tag: "ATELIER ONLY",
                included: ["AI Photorealism", "Colorway exploration", "Client sharing"],
                link: "/app/visualize-with-ai"
              },
              {
                n: '04',
                title: 'Sell your designs',
                desc: "Publish finished blueprints to the Evercrafted Marketplace. Earn passive income from your expertise — other makers buy your designs, you get paid.",
                img: "/market-08.jpg",
                tag: "ALL TIERS",
                included: ["Marketplace listing", "Passive income", "Expertise sharing"],
                link: "/app/market"
              }
            ].map((step, i) => (
              <div key={i} id={step.title === 'Sell your designs' ? 'marketplace' : undefined} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} border-t border-ink/10 min-h-[600px]`}>
                {/* Image Side */}
                <div className="w-full md:w-1/2 relative overflow-hidden group">
                  <img 
                    src={step.img} 
                    alt={step.title} 
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-ink/10 group-hover:bg-transparent transition-colors duration-1000" />
                </div>

                {/* Vertical Divider with Arrow (Desktop Only) */}
                <div className="hidden md:flex w-px bg-ink/10 relative items-center justify-center">
                  <div className="absolute bg-white-studio py-6 px-2 text-[12px] text-ink/40 font-mono z-20">
                    {i % 2 === 0 ? '→' : '←'}
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center relative bg-white-studio">
                  {/* Large Tan Number */}
                  <div className="absolute top-12 left-12 md:top-20 md:left-20 font-serif text-[140px] md:text-[200px] text-[#d4c3a1] opacity-20 select-none pointer-events-none leading-none tracking-tighter">
                    {step.n}
                  </div>

                  <div className="relative z-10 space-y-12">
                    <div className="space-y-6">
                      <div className="inline-block px-3 py-1 bg-sage-ll text-sage-d text-[9px] font-bold tracking-[0.2em] uppercase">
                        {step.tag}
                      </div>
                      <h3 className="font-serif text-4xl md:text-6xl text-ink leading-[1.1] tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-lg md:text-xl font-light text-muted-studio leading-relaxed font-serif italic max-w-md">
                        {step.desc}
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-ink/30">Included</span>
                        <div className="flex-1 h-[1px] bg-ink/5" />
                      </div>
                      <ul className="grid grid-cols-1 gap-3">
                        {step.included.map((item, j) => (
                          <li key={j} className="text-[13px] font-light text-muted-studio flex items-center gap-4">
                            <div className="w-1.5 h-1.5 bg-[#d4c3a1] rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-10">
                      <Link 
                        to={step.link} 
                        className="inline-block px-12 py-5 border border-ink text-[11px] font-bold tracking-[0.25em] uppercase hover:bg-ink hover:text-white-studio transition-all duration-500"
                      >
                        Start designing
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Services Section (Inspired by Salty) */}
      <section className="py-32 bg-white-studio border-y border-ink/5 relative overflow-hidden min-h-[80vh] flex items-center">
        {/* Background Slider for this section */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              <img 
                src={`/market-0${(currentSlide % 5) + 1}.jpg`} 
                alt="" 
                className="w-full h-full object-cover brightness-[0.6] grayscale-[30%]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-ink/30" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="font-serif text-[clamp(48px,8vw,96px)] font-light leading-[0.9] tracking-tighter text-white-studio">
              Explore <br />
              <span className="italic font-light opacity-80">the Offerings</span>
            </h2>
            <p className="max-w-xl mx-auto text-lg font-light text-white-studio/70 leading-relaxed font-serif italic">
              We've built a suite of tools that respect the way you actually work. No more guessing, just pure creation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Apps Section */}
      <section id="apps" className="bg-white-studio py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-20 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-[1px] bg-ink/20" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-ink/40">The Apps</span>
            </div>
            <h2 className="font-serif text-[clamp(40px,6vw,72px)] font-light tracking-tighter text-ink leading-[1.1]">
              Every tool your practice <span className="italic text-sage-d">deserves</span>
            </h2>
            <p className="max-w-2xl text-lg md:text-xl font-light text-muted-studio leading-relaxed">
              Sixteen purpose-built apps covering every stage of the wreath-making workflow. Pick the four that fit your practice, or go all-in with Atelier.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blueprint Studio - Large Dark Card */}
            <Link 
              to="/app/blueprint-studio"
              className="bg-ink rounded-2xl p-12 flex flex-col justify-between min-h-[600px] relative overflow-hidden group hover:scale-[1.01] transition-all duration-500"
            >
              <div className="relative z-10 space-y-8 text-left">
                <div className="inline-block px-4 py-1 bg-white-studio/10 rounded-full text-white-studio text-[9px] font-bold tracking-[0.2em] uppercase">
                  Studio
                </div>
                <div className="w-16 h-16 bg-white-studio/5 rounded-xl flex items-center justify-center border border-white-studio/10">
                  <Layout className="w-8 h-8 text-white-studio/60" />
                </div>
                <div className="space-y-6">
                  <h3 className="font-serif text-4xl text-white-studio tracking-tight">Blueprint Studio</h3>
                  <p className="text-lg font-light text-white-studio/60 leading-relaxed max-w-sm">
                    Map every element of your design before a single stem is placed. Define structure, color story, and material quantities — then export a shareable layout diagram your clients can actually understand.
                  </p>
                </div>
              </div>
              
              {/* Radial Graphic Backdrop */}
              <div className="absolute -bottom-24 -right-24 w-96 h-96 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <div className="w-full h-full border-[1px] border-white-studio rounded-full flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border-[1px] border-white-studio rounded-full flex items-center justify-center">
                    <div className="w-1/2 h-1/2 border-[1px] border-white-studio rounded-full" />
                  </div>
                </div>
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white-studio" />
                <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white-studio" />
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white-studio rotate-45" />
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white-studio -rotate-45" />
              </div>
            </Link>

            {/* Right Column Grid */}
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Memory Weaver */}
                <div className="bg-white-studio border border-ink/5 rounded-2xl p-10 space-y-6 hover:shadow-xl transition-all duration-500">
                  <div className="inline-block px-3 py-1 bg-sage-ll text-sage-d text-[8px] font-bold tracking-[0.2em] uppercase rounded-full">
                    Bloom
                  </div>
                  <h3 className="font-serif text-2xl text-ink tracking-tight">Memory Weaver</h3>
                  <p className="text-sm font-light text-muted-studio leading-relaxed">
                    Capture the story behind each wreath — the occasion, the recipient, the season. Build a living archive of your creative history.
                  </p>
                </div>
                {/* Inventory Tracker */}
                <div className="bg-white-studio border border-ink/5 rounded-2xl p-10 space-y-6 hover:shadow-xl transition-all duration-500">
                  <div className="inline-block px-3 py-1 bg-bark-ll text-bark text-[8px] font-bold tracking-[0.2em] uppercase rounded-full">
                    Craft
                  </div>
                  <h3 className="font-serif text-2xl text-ink tracking-tight">Inventory Tracker</h3>
                  <p className="text-sm font-light text-muted-studio leading-relaxed">
                    Know exactly what you have, what you need, and what it costs. Never over-order or run short mid-project again.
                  </p>
                </div>
              </div>

              {/* AI Visualizer - Green Card */}
              <div className="bg-sage-d rounded-2xl p-12 flex flex-col justify-center min-h-[300px] relative overflow-hidden group">
                <div className="relative z-10 space-y-6">
                  <div className="inline-block px-4 py-1 bg-white-studio/10 rounded-full text-white-studio text-[9px] font-bold tracking-[0.2em] uppercase">
                    Atelier
                  </div>
                  <h3 className="font-serif text-4xl text-white-studio tracking-tight">AI Visualizer</h3>
                  <p className="text-lg font-light text-white-studio/80 leading-relaxed max-w-md">
                    Generate photorealistic previews from your blueprint. Share with clients before a single stem is placed.
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white-studio/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link to="/app" className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-ink hover:gap-4 transition-all">
              Explore all 16 apps <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-32 bg-white-studio">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col items-center text-center mb-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-[1px] bg-muted-2" />
              <span className="text-[9px] font-medium tracking-[0.22em] uppercase text-muted-studio">Who it's for</span>
              <div className="w-7 h-[1px] bg-muted-2" />
            </div>
            <h2 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-ink mb-6">
              Built for how wreath makers actually work
            </h2>
            <p className="max-w-xl text-base md:text-lg font-light text-muted-studio leading-relaxed">
              Whether you're starting from flowers you already have, a feeling a client described, or a design you want to sell — there's a tool for that.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/5 border border-ink/5">
            {[
              { tag: 'Starting from inventory', name: 'You already have the flowers', text: 'Tell us what stems you have. We\'ll build a balanced design around them and show you exactly what else you need.' },
              { tag: 'Starting from a feeling', name: 'A client shared a memory', text: 'They describe a feeling or a moment. We turn that into a flower palette, colors, and a complete layout — ready to share.' },
              { tag: 'Production', name: 'Seasonal lines, done right', text: 'Design once, scale to any size. Build the same wreath at 18", 22", and 28" without starting over each time.' },
              { tag: 'Retail kits', name: 'Ready to package and sell', text: 'Your design becomes a step-by-step kit — stem counts, placement order, and everything a buyer needs to make it themselves.' },
              { tag: 'Client work', name: 'Get sign-off before you start', text: 'Share a design preview with your client and lock it in before you touch a single stem. No expensive changes mid-build.' },
              { tag: 'Marketplace', name: 'Design once, sell many times', text: 'List your designs in the marketplace. Each one comes with a clean spec sheet and everything buyers need to recreate it.' }
            ].map((item, i) => (
              <div key={i} className="bg-white-studio p-10 space-y-6 hover:bg-cream-2 transition-colors group">
                <span className="text-[9px] tracking-[0.2em] uppercase text-muted-2 block">{item.tag}</span>
                <h3 className="font-serif text-2xl font-medium text-ink leading-tight tracking-tight">{item.name}</h3>
                <p className="text-[15px] font-light text-muted-studio leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <div className="bg-ink py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-4">
          <div className="text-center md:text-left">
            <div className="font-serif text-4xl font-light text-white-studio/90">2,400+</div>
            <div className="text-[10px] tracking-[0.1em] uppercase text-white-studio/40 mt-1">Active designers</div>
          </div>
          <div className="hidden md:block w-px h-10 bg-white-studio/10" />
          <div className="text-center md:text-left">
            <div className="font-serif text-4xl font-light text-white-studio/90">18,000</div>
            <div className="text-[10px] tracking-[0.1em] uppercase text-white-studio/40 mt-1">Wreaths designed</div>
          </div>
          <div className="hidden md:block w-px h-10 bg-white-studio/10" />
          <div className="text-center md:text-left">
            <div className="font-serif text-4xl font-light text-white-studio/90">$340</div>
            <div className="text-[10px] tracking-[0.1em] uppercase text-white-studio/40 mt-1">Avg saved on materials / mo</div>
          </div>
          <div className="hidden md:block w-px h-10 bg-white-studio/10" />
          <div className="text-center md:text-left">
            <div className="font-serif text-4xl font-light text-white-studio/90">33</div>
            <div className="text-[10px] tracking-[0.1em] uppercase text-white-studio/40 mt-1">Free designs in library</div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <section className="py-32 bg-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <img src="/market-04.jpg" alt="" className="w-full h-full object-cover grayscale" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-[1px] bg-muted-2" />
              <span className="text-[9px] font-medium tracking-[0.22em] uppercase text-muted-studio">Loved by designers</span>
              <div className="w-7 h-[1px] bg-muted-2" />
            </div>
            <h2 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-ink">
              What wreath makers <em className="italic text-muted-studio">are saying.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah R.', handle: 'Etsy seller · 4,200 sales', text: '"I used to spend two hours trying to describe what I wanted to a photographer. Now I type a feeling and get a product photo back in minutes."', initials: 'SR' },
              { name: 'Melissa K.', handle: 'Faux floral educator', text: '"The vocabulary is what gets me. It knows lamb\'s ear from eucalyptus, farmhouse from organic. That specificity changes everything about the photos it creates."', initials: 'MK' },
              { name: 'Jamie T.', handle: 'Seasonal decor studio', text: '"The cost tool saved me $340 in the first month just on materials I\'d have otherwise wasted. My client work is faster, my stock runs tighter."', initials: 'JT' }
            ].map((testi, i) => (
              <div key={i} className="bg-white-studio p-8 border border-ink/5 hover:shadow-xl transition-all duration-500 group">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-sage text-sage" />)}
                </div>
                <p className="font-serif italic text-lg text-ink leading-relaxed mb-8 opacity-80">{testi.text}</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-sage-ll text-sage-d flex items-center justify-center text-xs font-bold rounded-full">{testi.initials}</div>
                  <div>
                    <div className="text-xs font-bold text-ink uppercase tracking-tight">{testi.name}</div>
                    <div className="text-[10px] text-muted-2 uppercase tracking-widest">{testi.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sister Brand Section - Moodoor */}
      <section className="bg-bark-ll border-y border-bark/10 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="text-[9px] font-medium tracking-[0.16em] uppercase text-bark mb-2">Sister brand</div>
            <h3 className="font-serif text-3xl text-ink mb-3 tracking-tight">Moodoor — wreaths for the home, chosen by mood.</h3>
            <p className="text-sm font-light text-muted-studio leading-relaxed">
              Moodoor is where your customers shop. They answer a short mood quiz and get matched to a wreath that fits how they want their home to feel. Powered by Evercrafted behind the scenes.
            </p>
          </div>
          <Link 
            to="/moodoor" 
            className="px-8 py-3 bg-ink text-white-studio text-xs font-medium tracking-wider hover:bg-ink-2 transition-colors whitespace-nowrap"
          >
            Visit Moodoor ↗
          </Link>
        </div>
      </section>

      {/* Sister Brand Section - EmotionLens */}
      <section className="bg-[#1A1A1A] border-b border-white/5 py-16 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="text-[9px] font-medium tracking-[0.16em] uppercase text-[#A68FCA] mb-2">AI Power</div>
            <h3 className="font-serif text-3xl text-white mb-3 tracking-tight">EmotionLens — <em className="italic text-[#A68FCA]">AI Prompt Composer.</em></h3>
            <p className="text-sm font-light text-white/40 leading-relaxed">
              Turn feeling into visual language. EmotionLens maps your emotional intent and blueprint data into Midjourney-ready prompts for production-accurate renders.
            </p>
          </div>
          <Link 
            to="/emotion-lens" 
            className="px-8 py-3 bg-[#7A5EA7] text-white text-xs font-medium tracking-wider hover:bg-[#A68FCA] transition-colors whitespace-nowrap"
          >
            Visit EmotionLens ↗
          </Link>
        </div>
      </section>

      {/* CTA Splash */}
      <section id="pricing" className="py-48 bg-ink text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              <img 
                src={`/market-0${((currentSlide + 2) % 5) + 1}.jpg`} 
                alt="" 
                className="w-full h-full object-cover opacity-30 grayscale"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-[1px] bg-white-studio/20" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white-studio/60">Ready to start</span>
            <div className="w-12 h-[1px] bg-white-studio/20" />
          </div>
          <h2 className="font-serif text-[clamp(48px,10vw,120px)] font-light tracking-tighter text-white-studio mb-8 leading-[0.85]">
            Start for free.<br />
            <span className="italic font-light opacity-60">No credit card needed.</span>
          </h2>
          <p className="max-w-md mx-auto text-lg font-light text-white-studio/70 leading-relaxed mb-16 font-serif italic">
            Try any tool free for 14 days. If it doesn't save you time, cancel in one click.
          </p>
          <Link 
            to="/app" 
            className="px-16 py-6 bg-white-studio text-ink text-[11px] font-bold tracking-[0.25em] uppercase hover:bg-cream transition-all inline-block shadow-2xl"
          >
            Start designing free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cream pt-20 pb-10 border-t border-ink/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="font-serif text-2xl font-medium tracking-tight text-ink">Evercrafted</div>
              <p className="text-sm font-light text-muted-studio leading-relaxed max-w-xs">
                Design tools built for wreath makers who take their craft seriously.
              </p>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-2">Product</h4>
              <nav className="flex flex-col gap-3 text-sm text-muted-studio">
                <a href="#" className="hover:text-ink transition-colors">How it works</a>
                <a href="#" className="hover:text-ink transition-colors">All apps</a>
                <a href="#" className="hover:text-ink transition-colors">Marketplace</a>
                <a href="#" className="hover:text-ink transition-colors">Pricing</a>
                <a href="#" className="hover:text-ink transition-colors">Moodoor ↗</a>
              </nav>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-2">Resources</h4>
              <nav className="flex flex-col gap-3 text-sm text-muted-studio">
                <a href="#" className="hover:text-ink transition-colors">Documentation</a>
                <a href="#" className="hover:text-ink transition-colors">Photo guide</a>
                <a href="#" className="hover:text-ink transition-colors">Design library</a>
                <a href="#" className="hover:text-ink transition-colors">Blog</a>
              </nav>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-2">Company</h4>
              <nav className="flex flex-col gap-3 text-sm text-muted-studio">
                <a href="#" className="hover:text-ink transition-colors">About</a>
                <a href="#" className="hover:text-ink transition-colors">Privacy</a>
                <a href="#" className="hover:text-ink transition-colors">Terms</a>
                <a href="#" className="hover:text-ink transition-colors">Contact</a>
              </nav>
            </div>
          </div>
          <div className="pt-8 border-t border-ink/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-muted-2">
            <div>© 2026 Evercrafted. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-ink transition-colors">Privacy</a>
              <a href="#" className="hover:text-ink transition-colors">Terms</a>
              <a href="#" className="hover:text-ink transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

