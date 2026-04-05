import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  ArrowRight, 
  Star, 
  Check, 
  ChevronRight,
  Layout,
  Eye,
  ShoppingBag,
  Layers,
  Zap,
  FileText,
  Share2,
  TrendingUp,
  Library,
  Sparkles,
  History,
  Download
} from 'lucide-react';

export default function EmotionLensLanding() {
  const [activeEmotion, setActiveEmotion] = useState('gratitude');
  const [generatedPrompt, setGeneratedPrompt] = useState('handcrafted autumn eucalyptus wreath, muted amber and cream palette, soft linen ribbon ::1.6 gentle gratitude::1.4 soothing calm::1.1 nostalgic warmth::0.9 --ar 1:1 --style raw');
  const [isGenerating, setIsGenerating] = useState(false);
  const [weights, setWeights] = useState<Record<string, number>>({
    'Gratitude': 0.9,
    'Calm': 0.6,
    'Nostalgia': 0.4,
    'Hope': 0.2
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const emotionContext = Object.entries(weights)
        .map(([name, val]) => `${name}: ${val}`)
        .join(', ');

      const response = await ai.models.generateContent({
        model,
        contents: `Generate a professional Midjourney v6 prompt for a luxury wreath design based on these emotional weights: ${emotionContext}. 
        Include specific botanical materials, a sophisticated color palette, and texture descriptions. 
        Use Midjourney weight syntax (::) for the emotions. 
        Format: [Description], [Palette], [Materials] ::[Weight] [Emotion] ::[Weight] [Emotion] --ar 1:1 --v 6.0 --style raw.
        Keep it concise and editorial.`,
        config: {
          systemInstruction: "You are a master floral designer and AI prompt engineer. You specialize in translating complex human emotions into precise, high-end visual language for Midjourney. Your outputs are always professional, luxury-focused, and botanically accurate.",
          temperature: 0.7,
        }
      });

      if (response.text) {
        setGeneratedPrompt(response.text.trim());
      }
    } catch (error) {
      console.error("Generation failed:", error);
      // Fallback to a local generator if API fails
      const emotion = EMOTION_DATA[activeEmotion];
      const palette = emotion.palette.slice(0, 2).join(' and ');
      setGeneratedPrompt(`handcrafted ${activeEmotion} botanical wreath, ${palette} palette, ${emotion.palette[2]} accents ::1.8 ${emotion.phrase}::1.5 ${EMOTION_DATA['calm'].phrase}::1.2 ${EMOTION_DATA['hope'].phrase}::0.8 --ar 1:1 --v 6.0 --style raw`);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const handleScroll = () => {
      const nav = document.getElementById('el-nav');
      if (nav) {
        nav.classList.toggle('bg-[#1A1A1A]/90', window.scrollY > 40);
        nav.classList.toggle('backdrop-blur-md', window.scrollY > 40);
        nav.classList.toggle('border-b', window.scrollY > 40);
        nav.classList.toggle('border-white/5', window.scrollY > 40);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const EMOTION_DATA: Record<string, any> = {
    gratitude: {
      name: 'Gratitude',
      icon: '🌾',
      phrase: 'gentle gratitude',
      desc: 'Maps to muted amber and warm neutral palettes with soft cream accents. Texture vocabulary includes natural dried textures, aged ribbon, and organic layering — the visual language of a handmade gift given with quiet sincerity.',
      palette: ['muted amber', 'warm neutrals', 'soft cream', 'dried textures', 'aged ribbon', 'organic layering'],
      primary: ['muted amber', 'warm neutrals'],
      weights: { Gratitude: 0.9, Calm: 0.3, Nostalgia: 0.5, Hope: 0.2 }
    },
    calm: {
      name: 'Calm',
      icon: '🌿',
      phrase: 'soothing calm',
      desc: 'Maps to sage green and muted ivory palettes with dusty blue accents. Texture vocabulary includes airy wispy sprigs, fine tendrils, and delicate silhouettes — the visual language of a quiet afternoon in a garden.',
      palette: ['sage green', 'muted ivory', 'dusty blue', 'wispy sprigs', 'fine tendrils', 'delicate silhouette'],
      primary: ['sage green', 'muted ivory'],
      weights: { Calm: 0.9, Serenity: 0.6, Gratitude: 0.2, Hope: 0.3 }
    },
    joy: {
      name: 'Joy',
      icon: '🌸',
      phrase: 'joyful celebration',
      desc: 'Maps to warm coral and sunlit gold palettes with fresh white accents. Texture vocabulary includes lush fullness, bold blooms, and rich layering — the visual language of a celebration in full bloom.',
      palette: ['warm coral', 'sunlit gold', 'fresh white', 'lush fullness', 'bold blooms', 'rich layering'],
      primary: ['warm coral', 'sunlit gold'],
      weights: { Joy: 0.9, Hope: 0.5, Gratitude: 0.3, Calm: 0.1 }
    },
    nostalgia: {
      name: 'Nostalgia',
      icon: '🍂',
      phrase: 'nostalgic warmth',
      desc: 'Maps to faded rose and aged ivory palettes with dusty mauve accents. Texture vocabulary includes slightly faded florals, aged greenery, and worn ribbon — the visual language of a cherished memory.',
      palette: ['faded rose', 'aged ivory', 'dusty mauve', 'faded florals', 'aged greenery', 'worn ribbon'],
      primary: ['faded rose', 'aged ivory'],
      weights: { Nostalgia: 0.9, Gratitude: 0.5, Calm: 0.3, Serenity: 0.2 }
    },
    serenity: {
      name: 'Serenity',
      icon: '🕊️',
      phrase: 'serene calm',
      desc: 'Maps to soft grey-green and white palettes with pale sage accents. Texture vocabulary includes minimal botanical, quiet spacing, and sparse elegance — the visual language of a meditative stillness.',
      palette: ['soft grey-green', 'white', 'pale sage', 'minimal botanical', 'quiet spacing', 'sparse elegance'],
      primary: ['soft grey-green', 'white'],
      weights: { Serenity: 0.9, Calm: 0.7, Hope: 0.2, Gratitude: 0.1 }
    },
    hope: {
      name: 'Hope',
      icon: '✨',
      phrase: 'fragile hope',
      desc: 'Maps to pale blush and soft gold palettes with ivory white accents. Texture vocabulary includes gentle mixed blooms, light layering, and soft openness — the visual language of a new beginning.',
      palette: ['pale blush', 'soft gold', 'ivory white', 'gentle blooms', 'light layering', 'soft openness'],
      primary: ['pale blush', 'soft gold'],
      weights: { Hope: 0.9, Joy: 0.4, Serenity: 0.3, Calm: 0.2 }
    }
  };

  const currentEmotion = EMOTION_DATA[activeEmotion];

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F9F7F4] font-sans selection:bg-[#7A5EA7]/30 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Dancing+Script:wght@600&family=Inter:wght@400;500;600&family=DM+Mono&display=swap');
        
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-script { font-family: 'Dancing Script', cursive; }
        .font-mono { font-family: 'DM Mono', monospace; }

        .marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeScroll 28s linear infinite;
        }
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .grain::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9998;
          opacity: 0.5;
        }
      `}</style>

      <div className="grain" />

      {/* Navigation */}
      <nav id="el-nav" className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-300">
        <div className="max-w-[1200px] mx-auto px-10 h-[64px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#F9F7F4] font-serif text-xl tracking-tight">
            <svg className="text-[#6B8F67]" width="14" height="18" viewBox="0 0 32 40" fill="none">
              <path d="M16 38C16 38 4 26 4 14C4 7.4 9.4 2 16 2C22.6 2 28 7.4 28 14C28 26 16 38 16 38Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M16 38L16 8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
            </svg>
            Evercrafted
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-[11px] font-medium tracking-widest uppercase text-[#F9F7F4]/45 hover:text-[#F9F7F4] transition-colors">Home</Link>
            <Link to="/app" className="text-[11px] font-medium tracking-widest uppercase text-[#F9F7F4] transition-colors">Apps</Link>
            <Link to="/app/market" className="text-[11px] font-medium tracking-widest uppercase text-[#F9F7F4]/45 hover:text-[#F9F7F4] transition-colors">Marketplace</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[11px] font-medium tracking-widest uppercase text-[#F9F7F4]/40 hover:text-[#F9F7F4] transition-colors">Sign in</Link>
            <Link to="/app" className="px-5 py-2 bg-[#7A5EA7] text-[#F9F7F4] text-[11px] font-bold tracking-widest uppercase rounded hover:bg-[#A68FCA] transition-all">Try EmotionLens</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen bg-[#1A1A1A] grid grid-cols-1 lg:grid-cols-2 items-center gap-16 px-10 lg:px-20 pt-32 pb-20 relative overflow-hidden">
        {/* Radial violet glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] bg-[radial-gradient(ellipse_at_center,rgba(122,94,167,0.14)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[60%] bg-[radial-gradient(ellipse_at_bottom_right,rgba(74,103,65,0.10)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#7A5EA7]/12 border border-[#7A5EA7]/28 rounded-full mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#A68FCA]" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#A68FCA]">EmotionLens</span>
            <span className="text-[9px] font-bold tracking-widest uppercase text-white/40 px-2 py-0.5 bg-white/5 rounded-full ml-2">All tiers</span>
          </div>

          <h1 className="font-serif text-[clamp(48px,6vw,84px)] font-light leading-[1.05] tracking-tighter mb-6">
            Turn <em>feeling</em><br />
            into <span className="font-script text-[0.85em] text-[#C9A84C] block leading-[1.1]">visual language.</span>
          </h1>

          <p className="text-lg font-light leading-relaxed text-white/50 max-w-md mb-10">
            EmotionLens is Evercrafted's AI prompt composer — it maps your emotional intent, materials, and design parameters into Midjourney-ready wreath prompts that speak directly to your customers.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Link to="/app" className="px-8 py-3.5 bg-[#7A5EA7] text-white text-[11px] font-bold tracking-widest uppercase rounded hover:bg-[#A68FCA] transition-all shadow-xl hover:shadow-[#7A5EA7]/20">
              Start composing free
            </Link>
            <a href="#how-it-works" className="px-6 py-3.5 border border-white/14 text-white/50 text-[11px] font-medium tracking-widest uppercase rounded hover:border-white/35 hover:text-white transition-all">
              See how it works
            </a>
          </div>

          <div className="flex gap-10">
            <div>
              <div className="font-serif text-3xl text-white">2,400<sup>+</sup></div>
              <div className="text-[10px] tracking-widest uppercase text-white/30 mt-1">Designers</div>
            </div>
            <div>
              <div className="font-serif text-3xl text-white">18k</div>
              <div className="text-[10px] tracking-widest uppercase text-white/30 mt-1">Prompts generated</div>
            </div>
            <div>
              <div className="font-serif text-3xl text-white">6</div>
              <div className="text-[10px] tracking-widest uppercase text-white/30 mt-1">Core emotions</div>
            </div>
          </div>
        </div>

        {/* Right: Composer Mockup */}
        <div className="relative z-10 hidden lg:block">
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-white/4 border-b border-white/7 px-4 py-3 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              <div className="flex-1 text-center text-[9px] font-mono text-white/25 tracking-widest uppercase">EmotionLens Composer · Bloom tier</div>
            </div>
            <div className="grid grid-cols-[200px_1fr] min-h-[380px]">
              <div className="border-r border-white/6 p-4 space-y-6">
                <div>
                  <div className="text-[8px] font-bold tracking-widest uppercase text-white/20 mb-3 border-b border-white/5 pb-1.5">Emotion weights</div>
                  <div className="space-y-2">
                    {[
                      { name: 'Gratitude', color: '#A68FCA' },
                      { name: 'Calm', color: '#6B8F67' },
                      { name: 'Nostalgia', color: '#D4849A' },
                      { name: 'Hope', color: '#C9A84C' }
                    ].map(e => (
                      <div key={e.name} className="flex items-center gap-2">
                        <span className="text-[9px] text-white/55 w-14">{e.name}</span>
                        <div className="flex-1 h-1 bg-white/8 rounded-full relative group/slider cursor-pointer">
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1" 
                            value={weights[e.name]} 
                            onChange={(ev) => setWeights(prev => ({ ...prev, [e.name]: parseFloat(ev.target.value) }))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div 
                            className="h-full rounded-full transition-all duration-300" 
                            style={{ width: `${weights[e.name] * 100}%`, backgroundColor: e.color }} 
                          />
                          <div 
                            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-[#1A1A1A] shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity" 
                            style={{ left: `${weights[e.name] * 100}%`, backgroundColor: e.color }} 
                          />
                        </div>
                        <span className="text-[8px] font-mono text-white/30 w-5 text-right">{weights[e.name].toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-bold tracking-widest uppercase text-white/20 mb-3 border-b border-white/5 pb-1.5">Season</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[9px] px-2 py-1 bg-[#7A5EA7]/20 border border-[#7A5EA7]/40 text-[#A68FCA] rounded">Autumn</span>
                    <span className="text-[9px] px-2 py-1 border border-white/10 text-white/40 rounded">Winter</span>
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-bold tracking-widest uppercase text-white/20 mb-3 border-b border-white/5 pb-1.5">Style</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[9px] px-2 py-1 bg-[#7A5EA7]/20 border border-[#7A5EA7]/40 text-[#A68FCA] rounded">Farmhouse</span>
                    <span className="text-[9px] px-2 py-1 border border-white/10 text-white/40 rounded">Luxe</span>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-white/3 border border-white/6 rounded p-3">
                  <div className="text-[8px] font-bold tracking-widest uppercase text-white/20 mb-2">Emotion profile</div>
                  <div className="flex gap-1.5 items-end h-12">
                    {['Gratitude', 'Calm', 'Nostalgia', 'Hope'].map((name, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div 
                          initial={false}
                          animate={{ height: `${weights[name] * 40}px` }}
                          className="w-full rounded-t-sm" 
                          style={{ backgroundColor: ['#A68FCA', '#6B8F67', '#D4849A', '#C9A84C'][i] }} 
                        />
                        <span className="text-[7px] text-white/25 uppercase">E{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/3 border border-white/6 rounded p-3">
                  <div className="text-[8px] font-bold tracking-widest uppercase text-white/20 mb-2">Midjourney prompt</div>
                  <div className="font-mono text-[9px] text-[#A68FCA] leading-relaxed break-all min-h-[40px]">
                    {isGenerating ? (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        Composing visual language...
                      </motion.span>
                    ) : (
                      generatedPrompt
                    )}
                  </div>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-2.5 bg-[#7A5EA7] text-white text-[10px] font-bold tracking-widest uppercase rounded hover:bg-[#A68FCA] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate Prompt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Marquee */}
      <div className="bg-[#7A5EA7] py-3.5 overflow-hidden border-y border-white/10">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {[
                'Emotion Mapping', 'Midjourney Formatter', 'Blueprint Sync', 
                'Brand Presets', 'Prompt History', 'Negative Weights', 
                'Bulk CSV Export', '6 Core Emotions'
              ].map((item) => (
                <div key={item} className="flex items-center gap-7 px-7">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-white">{item}</span>
                  <span className="text-white/40">◆</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Editorial Intro */}
      <section className="py-32 bg-[#F2EFE9] text-[#1A1A1A] px-10 lg:px-20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-[#7A5EA7] text-[10px] font-bold tracking-widest uppercase">
              <div className="w-6 h-px bg-[#7A5EA7]" />
              About EmotionLens
            </div>
            <h2 className="font-serif text-[clamp(36px,5vw,56px)] font-light leading-[1.1] tracking-tighter">
              Florists think in <em>feeling</em>,<br />not keywords.
            </h2>
            <p className="text-lg font-light leading-relaxed text-[#4A4A4A]">
              When a customer says "I want something that feels like a Sunday morning in October," they are not describing a product — they are describing an emotion. EmotionLens is built to receive that kind of input and translate it into the precise visual language that AI image tools understand.
            </p>
            <div className="border-l-2 border-[#7A5EA7] pl-6 py-4 bg-[#7A5EA7]/5 italic font-serif text-xl text-[#2E2E2E]">
              "The first time I generated a prompt with EmotionLens, I got a client-ready render on the third try. Before, I was spending 45 minutes per prompt."
              <span className="block not-italic text-xs font-bold text-[#7A5EA7] uppercase tracking-widest mt-3">— Sarah M., Wreath Designer, Studio tier</span>
            </div>
            <a href="#how-it-works" className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-[#7A5EA7] border-b border-[#7A5EA7]/30 pb-0.5 hover:border-[#7A5EA7] transition-all">
              See how it works →
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🎭', num: '6', label: 'Core emotions' },
              { icon: '⚡', num: '<3', label: 'To first prompt', sup: 'min' },
              { icon: '🎨', num: '12+', label: 'Style archetypes' },
              { icon: '📋', num: '∞', label: 'Prompt history' }
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-[#E8E8E8] rounded-xl p-6 hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="text-2xl mb-3">{stat.icon}</div>
                <div className="font-serif text-4xl mb-1">{stat.num}{stat.sup && <sup className="text-lg ml-0.5">{stat.sup}</sup>}</div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-[#787878]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotion Profiles Grid */}
      <section className="py-32 bg-[#1A1A1A] px-10 lg:px-20">
        <div className="max-w-[1200px] mx-auto text-center mb-16 space-y-6">
          <div className="text-[#A68FCA] text-[10px] font-bold tracking-widest uppercase">The Emotion Library</div>
          <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-light leading-tight tracking-tighter">Six emotional <em>frequencies</em>,<br />infinite wreath expressions.</h2>
          <p className="text-lg font-light text-white/35 max-w-lg mx-auto">Each emotion maps to a curated set of palette descriptors, texture vocabularies, and material affinities.</p>
        </div>

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {Object.keys(EMOTION_DATA).map((id) => (
            <button 
              key={id}
              onClick={() => setActiveEmotion(id)}
              className={`p-8 rounded-xl border text-left transition-all ${activeEmotion === id ? 'bg-[#7A5EA7]/12 border-[#7A5EA7]/45' : 'bg-white/3 border-white/7 hover:bg-[#7A5EA7]/8 hover:border-[#7A5EA7]/30'}`}
            >
              <div className="text-3xl mb-4">{EMOTION_DATA[id].icon}</div>
              <div className="font-serif text-xl mb-1">{EMOTION_DATA[id].name}</div>
              <div className="font-serif italic text-sm text-[#A68FCA] mb-3">"{EMOTION_DATA[id].phrase}"</div>
              <p className="text-xs text-white/35 leading-relaxed">{EMOTION_DATA[id].desc.split('.')[0]}.</p>
            </button>
          ))}
        </div>

        {/* Emotion Detail Panel */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeEmotion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-[1200px] mx-auto bg-white/3 border border-[#7A5EA7]/25 rounded-xl p-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-start"
          >
            <div className="space-y-6">
              <h3 className="font-serif text-3xl">{currentEmotion.name} <em className="italic text-[#A68FCA]"> — {currentEmotion.phrase}</em></h3>
              <p className="text-sm font-light text-white/45 leading-relaxed max-w-2xl">{currentEmotion.desc}</p>
              <div className="flex flex-wrap gap-2">
                {currentEmotion.palette.map((p: string) => (
                  <span key={p} className={`px-4 py-1.5 rounded-full text-[10px] font-medium tracking-wide border ${currentEmotion.primary.includes(p) ? 'bg-[#7A5EA7]/15 border-[#7A5EA7]/35 text-[#A68FCA]' : 'bg-white/6 border-white/10 text-white/55'}`}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-64 space-y-3">
              {Object.entries(currentEmotion.weights).map(([k, v]: [any, any], i) => (
                <div key={k} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest">
                    <span>{k}</span>
                    <span className="font-mono">{v.toFixed(1)}</span>
                  </div>
                  <div className="h-1 bg-white/7 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${v * 100}%` }}
                      className="h-full rounded-full" 
                      style={{ backgroundColor: ['#A68FCA', '#6B8F67', '#D4849A', '#C9A84C'][i] || '#A68FCA' }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Feature 1 — Emotion Mapping */}
      <section className="py-32 bg-[#F2EFE9] text-[#1A1A1A] px-10 lg:px-20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-8">
            <div className="text-[#7A5EA7] text-[10px] font-bold tracking-widest uppercase">Feature 01 — Emotion Mapping</div>
            <h3 className="font-serif text-5xl font-light leading-tight tracking-tighter">A vocabulary built for <em>florists</em>,<br />not engineers.</h3>
            <p className="text-lg font-light leading-relaxed text-[#4A4A4A]">
              EmotionLens does not ask you to describe your design in AI terms. It asks you how the wreath should feel — and then does the translation work for you. Each emotion slider adjusts the weight of a curated phrase cluster in the final prompt.
            </p>
            <div className="p-6 bg-[#7A5EA7]/5 border-l-2 border-[#7A5EA7] rounded-r-lg text-sm italic text-[#4A4A4A] leading-relaxed">
              <strong>Bloom tier:</strong> Access to all 6 core emotions with standard weight controls. <strong>Craft tier</strong> unlocks custom emotion phrases and negative weight modifiers.
            </div>
            <a href="#tier-section" className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-[#7A5EA7] border-b border-[#7A5EA7]/30 pb-0.5 hover:border-[#7A5EA7] transition-all">
              View tier access →
            </a>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-white/4 border-b border-white/7 px-4 py-3 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              <div className="flex-1 text-center text-[9px] font-mono text-white/22 tracking-widest uppercase">Emotion Mapping — EmotionLens</div>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <div className="text-[9px] font-bold tracking-widest uppercase text-white/20 border-b border-white/5 pb-2">Emotion Weights</div>
                {[
                  { name: 'Gratitude', val: 0.9, color: '#A68FCA' },
                  { name: 'Calm', val: 0.6, color: '#6B8F67' },
                  { name: 'Nostalgia', val: 0.4, color: '#D4849A' },
                  { name: 'Hope', val: 0.2, color: '#C9A84C' }
                ].map(e => (
                  <div key={e.name} className="flex items-center gap-4">
                    <span className="text-[11px] text-white/55 w-20">{e.name}</span>
                    <div className="flex-1 h-1 bg-white/8 rounded-full relative">
                      <div className="h-full rounded-full" style={{ width: `${e.val * 100}%`, backgroundColor: e.color }} />
                      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#1A1A1A] shadow-lg" style={{ left: `${e.val * 100}%`, backgroundColor: e.color }} />
                    </div>
                    <span className="text-[10px] font-mono text-white/30 w-8 text-right">{e.val}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white/3 border border-white/6 rounded p-4">
                <div className="text-[8px] font-bold tracking-widest uppercase text-white/20 mb-3">Mapped palette output</div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] px-3 py-1 bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] rounded">muted amber</span>
                  <span className="text-[10px] px-3 py-1 bg-[#A68FCA]/12 border border-[#A68FCA]/30 text-[#A68FCA] rounded">warm neutrals</span>
                  <span className="text-[10px] px-3 py-1 bg-[#6B8F67]/12 border border-[#6B8F67]/30 text-[#6B8F67] rounded">sage green</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2 — Blueprint Sync */}
      <section className="py-32 bg-[#1A1A1A] px-10 lg:px-20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1 bg-[#1A1A1A] border border-white/8 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-white/4 border-b border-white/7 px-4 py-3 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              <div className="flex-1 text-center text-[9px] font-mono text-white/22 tracking-widest uppercase">Blueprint Sync — EmotionLens</div>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Wreath size', val: '24 in' },
                  { label: 'Formula', val: 'crescent' },
                  { label: 'Stem count', val: '58 stems' },
                  { label: 'Density', val: 'moderate' }
                ].map(p => (
                  <div key={p.label} className="bg-white/3 border border-white/6 rounded p-3">
                    <div className="text-[8px] text-white/20 uppercase tracking-widest mb-1">{p.label}</div>
                    <div className="font-mono text-xs text-[#A68FCA]">{p.val}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="text-[9px] font-bold tracking-widest uppercase text-white/20">Material ratio → prompt weight</div>
                {[
                  { name: 'Greenery', val: 36, color: '#6B8F67' },
                  { name: 'Focal', val: 17, color: '#A68FCA' },
                  { name: 'Secondary', val: 19, color: '#C9A84C' },
                  { name: 'Filler', val: 17, color: '#D4849A' }
                ].map(m => (
                  <div key={m.name} className="flex items-center gap-3">
                    <span className="text-[10px] text-white/40 w-16">{m.name}</span>
                    <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${m.val}%`, backgroundColor: m.color }} />
                    </div>
                    <span className="text-[9px] font-mono text-white/25 w-8 text-right">{m.val}%</span>
                  </div>
                ))}
              </div>
              <div className="bg-white/3 border border-white/6 rounded p-3">
                <div className="text-[8px] font-bold tracking-widest uppercase text-white/20 mb-2">Injected into prompt</div>
                <div className="font-mono text-[10px] text-[#A68FCA] leading-relaxed">
                  ...lush eucalyptus base, <span className="text-[#C9A84C]">crescent silhouette</span>, moderate density, focal rose clusters, dried accent sprigs --ar 1:1
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-8">
            <div className="text-[#A68FCA] text-[10px] font-bold tracking-widest uppercase">Feature 02 — Blueprint Sync</div>
            <h3 className="font-serif text-5xl font-light leading-tight tracking-tighter text-white">Your blueprint's structure, <em>embedded</em> in every prompt.</h3>
            <p className="text-lg font-light leading-relaxed text-white/45">
              When EmotionLens is connected to Blueprint Studio, it reads your active blueprint's parameters — wreath size, formula type, stem count, material ratios, and density — and embeds them directly into the prompt structure.
            </p>
            <div className="p-6 bg-white/3 border-l-2 border-[#A68FCA] rounded-r-lg text-sm italic text-white/35 leading-relaxed">
              <strong>Craft tier and above.</strong> Blueprint Sync requires an active Blueprint Studio project. Material ratios are pulled live from your current blueprint's stem allocation.
            </div>
            <Link to="/blueprint-studio" className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-[#A68FCA] border-b border-[#A68FCA]/30 pb-0.5 hover:border-[#A68FCA] transition-all">
              Explore Blueprint Studio →
            </Link>
          </div>
        </div>
      </section>

      {/* 6-Capability Grid */}
      <section className="py-32 bg-[#F9F7F4] text-[#1A1A1A] px-10 lg:px-20">
        <div className="max-w-[1200px] mx-auto text-center mb-16 space-y-6">
          <div className="text-[#7A5EA7] text-[10px] font-bold tracking-widest uppercase">All EmotionLens capabilities</div>
          <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-light leading-tight tracking-tighter">Everything you need to compose with <em>intention</em>.</h2>
        </div>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E8E8E8] border-2 border-[#E8E8E8] rounded-2xl overflow-hidden">
          {[
            { icon: <Sparkles />, name: 'Emotion Mapping', desc: 'Map core emotions to curated palette and texture vocabularies using a hand-crafted floristry language library.' },
            { icon: <Layers />, name: 'Blueprint Sync', desc: 'Import active Blueprint Studio parameters — size, formula, material ratios — directly into the prompt for production-accurate output.' },
            { icon: <Zap />, name: 'Midjourney Formatter', desc: 'Outputs structured ::weight syntax, aspect ratios, style flags, and chaos parameters — ready to paste.' },
            { icon: <ShoppingBag />, name: 'Brand Presets', desc: 'Save your signature emotion profiles and material selections as named presets for instant one-click consistency.' },
            { icon: <History />, name: 'Prompt History', desc: 'Every prompt is saved to your library with full parameters so you can revisit, iterate, and build on successes.' },
            { icon: <Download />, name: 'Bulk CSV Export', desc: 'Export your entire prompt library as a structured CSV for batch generation workflows or client deliverables.' }
          ].map((feat, i) => (
            <div key={i} className="bg-[#F9F7F4] p-10 space-y-6 hover:bg-[#F0EBF8] transition-colors group">
              <div className="w-11 h-11 bg-[#F0EBF8] rounded-full flex items-center justify-center text-[#7A5EA7]">
                <div className="w-5 h-5">
                  {feat.icon}
                </div>
              </div>
              <h4 className="font-serif text-xl">{feat.name}</h4>
              <p className="text-sm text-[#787878] leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Timeline */}
      <section className="py-32 bg-[#1A1A1A] px-10 lg:px-20">
        <div className="max-w-[1200px] mx-auto text-center mb-20 space-y-6">
          <div className="text-[#A68FCA] text-[10px] font-bold tracking-widest uppercase">The EmotionLens workflow</div>
          <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-light leading-tight tracking-tighter">From feeling to <em>render</em> in five steps.</h2>
        </div>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 relative">
          <div className="absolute top-7 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#7A5EA7]/40 to-transparent hidden md:block" />
          {[
            { n: '01', icon: '🎭', title: 'Set emotion weights', desc: 'Dial in the emotional frequency using the six core emotion sliders.', badge: 'Bloom' },
            { n: '02', icon: '🌿', title: 'Select season & style', desc: 'Choose season, style archetype, shape, materials, and lighting.', badge: 'Bloom' },
            { n: '03', icon: '🔗', title: 'Sync blueprint data', desc: 'Import active Blueprint Studio parameters for a production-accurate render.', badge: 'Craft+' },
            { n: '04', icon: '⚡', title: 'Generate prompt', desc: 'One click produces a structured Midjourney v6 prompt with all parameters.', badge: 'Bloom' },
            { n: '05', icon: '🎨', title: 'Save as preset', desc: 'Save your configuration as a named brand preset for instant reuse.', badge: 'Craft+' }
          ].map((step, i) => (
            <div key={i} className="text-center space-y-6 relative z-10">
              <div className="w-14 h-14 rounded-full bg-[#7A5EA7]/12 border border-[#7A5EA7]/30 flex items-center justify-center mx-auto">
                <span className="font-serif text-lg text-[#A68FCA]">{step.n}</span>
              </div>
              <div className="space-y-3">
                <div className="text-2xl">{step.icon}</div>
                <h4 className="font-serif text-lg text-white">{step.title}</h4>
                <p className="text-[11px] text-white/30 leading-relaxed">{step.desc}</p>
                <span className={`inline-block text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full mt-2 ${step.badge === 'Bloom' ? 'bg-[#EEF2ED] text-[#4A6741]' : 'bg-[#EEF4F9] text-[#4A6785]'}`}>
                  {step.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-[#F2EFE9] text-[#1A1A1A] px-10 lg:px-20">
        <div className="max-w-[1200px] mx-auto text-center mb-16 space-y-4">
          <div className="text-[#7A5EA7] text-[10px] font-bold tracking-widest uppercase">Designer voices</div>
          <h2 className="font-serif text-[clamp(32px,4vw,52px)] font-light leading-tight tracking-tighter">What designers say about <em>EmotionLens</em>.</h2>
        </div>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Sarah M.', handle: 'Wreath designer · Studio tier', text: '"The first time I generated a prompt with EmotionLens, I got a client-ready render on the third try. Before, I was spending 45 minutes per prompt and still not getting the feeling right."', initials: 'SM' },
            { name: 'Rachel K.', handle: 'Floral stylist · Craft tier', text: '"Blueprint Sync is the feature I didn\'t know I needed. My renders now actually look like my wreaths — same silhouette, same density, same palette. My clients stopped asking for revisions."', initials: 'RK' },
            { name: 'James L.', handle: 'Event florist · Atelier tier', text: '"I have three brand presets saved — one for each of my seasonal collections. I open EmotionLens, load a preset, hit generate, and I have a client-ready visual in under two minutes."', initials: 'JL' }
          ].map((testi, i) => (
            <div key={i} className="bg-[#F9F7F4] border border-[#E8E8E8] rounded-xl p-8 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} size={13} className="fill-[#C9A84C] text-[#C9A84C]" />)}
              </div>
              <p className="font-serif italic text-lg text-[#2E2E2E] leading-relaxed mb-6">{testi.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F0EBF8] text-[#7A5EA7] flex items-center justify-center text-[10px] font-bold rounded-full">{testi.initials}</div>
                <div>
                  <div className="text-xs font-bold text-[#1A1A1A]">{testi.name}</div>
                  <div className="text-[10px] text-[#787878]">{testi.handle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Botanical Divider */}
      <div className="bg-[#F9F7F4] py-10">
        <div className="max-w-[1200px] mx-auto px-10 flex items-center justify-center gap-5">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#D0D0D0]" />
          <svg width="28" height="36" viewBox="0 0 32 40" fill="none" style={{ color: '#4A6741' }}>
            <path d="M16 38C16 38 4 26 4 14C4 7.4 9.4 2 16 2C22.6 2 28 7.4 28 14C28 26 16 38 16 38Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M16 38L16 8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
            <path d="M16 22C16 22 10 18 8 13" stroke="currentColor" strokeWidth="1" fill="none"/>
            <path d="M16 16C16 16 22 12 24 7" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#D0D0D0]" />
        </div>
      </div>

      {/* Pricing Tiers */}
      <section id="tier-section" className="py-32 bg-[#F9F7F4] text-[#1A1A1A] px-10 lg:px-20 border-t border-[#E8E8E8]">
        <div className="max-w-[1200px] mx-auto text-center mb-16 space-y-4">
          <div className="text-[#7A5EA7] text-[10px] font-bold tracking-widest uppercase">Subscription tiers</div>
          <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-light leading-tight tracking-tighter">EmotionLens is included in <em>every</em> Evercrafted plan.</h2>
          <p className="text-sm text-[#787878] max-w-lg mx-auto">Start free on Bloom. Upgrade when you need brand presets, Blueprint Sync, or bulk export.</p>
        </div>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { name: 'Bloom', price: '$19', features: ['All 6 core emotions', 'Standard Midjourney v6 output', 'Season & Style selectors'], locks: ['Blueprint Sync', 'Brand presets'] },
            { name: 'Craft', price: '$39', features: ['Everything in Bloom', 'Blueprint Sync', '3 brand presets', 'Bulk CSV export'] },
            { name: 'Studio', price: '$59', features: ['Everything in Craft', 'Unlimited brand presets', 'Team preset sharing', 'Custom emotion phrases'], recommended: true },
            { name: 'Atelier', price: '$99', features: ['Everything in Studio', 'White-label prompt export', 'API access (beta)', 'Priority support'], dark: true }
          ].map((tier) => (
            <div key={tier.name} className={`p-10 rounded-2xl border transition-all duration-500 hover:-translate-y-2 ${tier.recommended ? 'bg-white border-[#7A5EA7] shadow-2xl scale-105 z-10' : tier.dark ? 'bg-[#1A1A1A] border-white/10 text-white' : 'bg-white border-[#E8E8E8]'}`}>
              <div className="space-y-8">
                {tier.recommended && <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-[#7A5EA7] text-white text-[9px] font-bold tracking-widest uppercase px-4 py-1 rounded-full whitespace-nowrap">Most popular</div>}
                <div className="space-y-2">
                  <span className={`inline-block text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-3 ${tier.name === 'Bloom' ? 'bg-[#EEF2ED] text-[#4A6741]' : tier.name === 'Craft' ? 'bg-[#EEF4F9] text-[#4A6785]' : tier.name === 'Studio' ? 'bg-[#F5EEF4] text-[#7A4A85]' : 'bg-white/10 text-white/60'}`}>{tier.name}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-5xl font-light">{tier.price}</span>
                    <span className={`text-xs ${tier.dark ? 'text-white/40' : 'text-[#787878]'}`}>/mo</span>
                  </div>
                </div>
                <ul className="space-y-4">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-3 text-[11px] leading-relaxed border-b border-current/5 pb-3 last:border-0">
                      <div className="w-4 h-4 rounded-full bg-[#F0EBF8] flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={10} className="text-[#7A5EA7]" strokeWidth={3} />
                      </div>
                      <span className={tier.dark ? 'text-white/60' : 'text-[#4A4A4A]'}>{f}</span>
                    </li>
                  ))}
                  {tier.locks?.map(l => (
                    <li key={l} className="flex items-center justify-between gap-3 text-[11px] text-[#A8A8A8] opacity-50 border-b border-current/5 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px]">🔒</span>
                        <span>{l}</span>
                      </div>
                      <span className="text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 bg-[#F0EBF8] text-[#7A5EA7] rounded-full">Craft+</span>
                    </li>
                  ))}
                </ul>
                <Link to="/app" className={`block text-center py-3 rounded text-[10px] font-bold tracking-widest uppercase transition-all ${tier.recommended ? 'bg-[#7A5EA7] text-white hover:bg-[#A68FCA]' : tier.dark ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white' : 'border border-[#D0D0D0] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'}`}>
                  Start free trial
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-[#787878] mt-12">All plans include a 14-day free trial. No credit card required. <a href="#" className="text-[#7A5EA7] underline underline-offset-4">Compare all features →</a></p>
      </section>

      {/* CTA Section */}
      <section id="try-emotionlens" className="py-48 bg-[#1A1714] text-center relative overflow-hidden px-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(122,94,167,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <span className="font-script text-3xl text-[#C9A84C]">begin your mood</span>
          <h2 className="font-serif text-[clamp(44px,8vw,72px)] font-light leading-[1.08] tracking-tighter text-[#F5F0E8]">Your first prompt is<br /><em>three minutes away</em>.</h2>
          <p className="text-lg font-light text-[#F5F0E8]/40 leading-relaxed">EmotionLens is available on every Evercrafted plan. Start with Bloom — free for 14 days — and compose your first Midjourney-ready wreath prompt before your next client call.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/app" className="px-10 py-4 bg-[#7A5EA7] text-white text-[11px] font-bold tracking-widest uppercase rounded hover:bg-[#A68FCA] transition-all shadow-2xl">Start free trial — Bloom</Link>
            <Link to="/app" className="px-10 py-4 border border-white/14 text-white/45 text-[11px] font-medium tracking-widest uppercase rounded hover:border-white/35 hover:text-white transition-all">Explore all apps</Link>
          </div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/20">14-day free trial · No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2E2E2E] py-20 px-10 lg:px-20 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white font-serif text-lg">
              <svg className="text-[#6B8F67]" width="12" height="16" viewBox="0 0 32 40" fill="none">
                <path d="M16 38C16 38 4 26 4 14C4 7.4 9.4 2 16 2C22.6 2 28 7.4 28 14C28 26 16 38 16 38Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M16 38L16 8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
              </svg>
              Evercrafted
            </div>
            <p className="text-sm text-white/30 leading-relaxed max-w-xs">A procedural floral composition engine that generates professionally structured wreath designs using emotional prompts.</p>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-6">Platform</div>
            <ul className="space-y-3 text-sm text-white/40">
              <li><Link to="/" className="hover:text-white transition-colors">How it works</Link></li>
              <li><Link to="/app" className="hover:text-white transition-colors">All apps</Link></li>
              <li><Link to="/blueprint-studio" className="hover:text-white transition-colors">Blueprint Studio</Link></li>
              <li><Link to="/moodoor" className="hover:text-white transition-colors">Moodoor</Link></li>
              <li><Link to="/emotion-lens" className="hover:text-white transition-colors">EmotionLens</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-6">Plans</div>
            <ul className="space-y-3 text-sm text-white/40">
              <li><a href="#" className="hover:text-white transition-colors">Bloom — $19/mo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Craft — $39/mo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Studio — $59/mo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Atelier — $99/mo</a></li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-6">Company</div>
            <ul className="space-y-3 text-sm text-white/40">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-white/20">
          <div>© 2026 Evercrafted. All rights reserved.</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white/40 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/40 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
