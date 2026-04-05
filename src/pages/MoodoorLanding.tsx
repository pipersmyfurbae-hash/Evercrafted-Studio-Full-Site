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
  Library
} from 'lucide-react';

export default function MoodoorLanding() {
  const [activeMood, setActiveMood] = useState('serene');
  const [aiBundle, setAiBundle] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchAiBundle = async (mood: string) => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `As a luxury floral designer for Evercrafted, suggest a shoppable 5-item entryway bundle for the mood: "${mood}". 
        Include a specific wreath, a door mat, and three accent items (stems, lanterns, candles). 
        Format: Return ONLY a comma-separated list of 5 items with one relevant emoji each. 
        Example: 🌿 Eucalyptus wreath, 🧶 Jute mat, 🕯️ Brass lantern, 🌾 Wheat stems, 🏺 Stone vase.`,
        config: {
          systemInstruction: "You are a high-end interior stylist and botanical expert. Your suggestions are always elegant, seasonal, and premium.",
          temperature: 0.7,
        }
      });

      if (response.text) {
        const items = response.text.split(',').map(i => i.trim());
        if (items.length >= 3) {
          setAiBundle(items);
        }
      }
    } catch (error) {
      console.error("AI Curation failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchAiBundle(activeMood);
  }, [activeMood]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Handle scroll for nav
    const handleScroll = () => {
      const nav = document.getElementById('md-nav');
      if (nav) {
        nav.classList.toggle('bg-md-ink/95', window.scrollY > 40);
        nav.classList.toggle('backdrop-blur-md', window.scrollY > 40);
        nav.classList.toggle('shadow-lg', window.scrollY > 40);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const MOOD_DATA: Record<string, any> = {
    serene:   { name:'Serene', cluster:'calm',     desc:'A still, peaceful entryway. Dried eucalyptus, natural jute, white cotton stems, and soft air plants compose a threshold that invites you to exhale before you step inside.', bundle:['🌿 Dried eucalyptus wreath (L)','Natural jute door mat','Cotton stem bundle (white)','Air plant trio','Concrete pillar lantern'], colors:['#E1F5EE','#9FE1CB'] },
    grounded: { name:'Grounded', cluster:'calm',   desc:'Earthy and rooted. Raw linen, wheat stems, and a stone-grey mat ground the entryway in the quiet confidence of the natural world.', bundle:['🌾 Wheat + foliage wreath (L)','Stone-grey linen mat','Dried wheat bundle','Potted herb trio','Terracotta lantern'], colors:['#EAF3DE','#C0DD97'] },
    joyful:   { name:'Joyful', cluster:'joyful',   desc:'Bright and warm. Sunflowers, bold stripe cotton, citrus stems, and a yellow glass lantern — a door that greets every arrival with a smile.', bundle:['🌻 Sunflower + greenery wreath','Bold stripe cotton mat','Citrus stem assortment','Herb planter trio','Yellow glass lantern'], colors:['#FAEEDA','#FAC775'] },
    playful:  { name:'Playful', cluster:'joyful',  desc:'Bold and spirited. Vivid orange tones, textured stems, and a statement mat that announces your personality before the door opens.', bundle:['🍊 Mixed citrus + foliage wreath','Striped cotton mat','Orange stem bundle','Succulent planter','Amber pillar candle'], colors:['#FAECE7','#F5C4B3'] },
    romantic: { name:'Romantic', cluster:'romantic', desc:'Tender and glowing. Dried roses, pampas, blush velvet, and cream tapers — a door that feels like a love letter written in botanicals.', bundle:['🌹 Dried rose + pampas wreath','Blush velvet mat','Blush satin ribbon (2m)','Dried lavender bundle','Cream taper candle set ×6'], colors:['#FBEAF0','#F4C0D1'] },
    harvest:  { name:'Harvest', cluster:'seasonal', desc:'Amber and abundant. Wheat, berries, plaid, corn husk, and an amber lantern — a door that celebrates the season\'s generosity.', bundle:['🍂 Wheat + berry wreath (L)','Autumn plaid door mat','Corn husk stem bundle','Mini pumpkin planter set','Amber glass lantern'], colors:['#FAF0DC','#EFC97A'] },
    holiday:  { name:'Holiday', cluster:'seasonal', desc:'Rich and layered. Deep greens, red berries, velvet ribbon, and warm candlelight — a door dressed for the most celebratory season of the year.', bundle:['🌲 Mixed evergreen wreath (L)','Plaid wool mat','Red velvet ribbon (2m)','Holly + berry bundle','Brass pillar lantern'], colors:['#E4F0E4','#9FCA9F'] },
    spring:   { name:'Spring', cluster:'seasonal',  desc:'Fresh and emerging. Blush tulips, pale linen, and soft botanicals — a door that announces the world is waking up again.', bundle:['🌷 Mixed bloom welcome wreath','Pale linen mat','Blush tulip stem bundle','Potted primrose','White glass lantern'], colors:['#FDE8F5','#F5B8DE'] },
    nested:   { name:'New home', cluster:'moment',  desc:'Hopeful and fresh. A welcoming wreath, natural mat, and seasonal stems that say: this place is cared for, and you are welcome here.', bundle:['🏡 Mixed bloom welcome wreath','Hand-woven natural mat','Seasonal stem assortment','Statement potted plant','Cedar + sage pillar candle'], colors:['#EAF3DE','#C0DD97'] },
    hosting:  { name:'Hosting', cluster:'moment',   desc:'Welcoming and ready. Warm botanicals, a hand-woven mat, and ambient candlelight — a door that tells guests they are expected and cherished.', bundle:['🕯️ Mixed bloom welcome wreath','Hand-woven natural mat','Seasonal stem assortment','Statement potted plant','Cedar + sage pillar candle'], colors:['#FAEEDA','#FAC775'] },
  };

  const currentMood = MOOD_DATA[activeMood];

  return (
    <div className="min-h-screen bg-[#F9F7F4] text-[#1A1A1A] font-sans selection:bg-[#4A6741]/20 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Dancing+Script:wght@600&family=Inter:wght@400;500;600&family=DM+Mono&display=swap');
        
        :root {
          --md-moss: #3D5A3E;
          --md-rust: #B5451B;
          --md-gold: #C9A84C;
          --md-blush: #D4A96A;
          --md-cream: #F5F0E8;
          --md-ink: #1A1714;
        }

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
      <nav id="md-nav" className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-300">
        <div className="max-w-[1200px] mx-auto px-10 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#F9F7F4] font-serif text-xl tracking-tight">
            <svg className="text-[#6B8F67]" width="18" height="22" viewBox="0 0 32 40" fill="none">
              <path d="M16 38C16 38 4 26 4 14C4 7.4 9.4 2 16 2C22.6 2 28 7.4 28 14C28 26 16 38 16 38Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M16 38L16 8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
            </svg>
            Evercrafted
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-[11px] font-medium tracking-widest uppercase text-[#F9F7F4]/60 hover:text-[#F9F7F4] transition-colors">Home</Link>
            <Link to="/blueprint-studio" className="text-[11px] font-medium tracking-widest uppercase text-[#F9F7F4]/60 hover:text-[#F9F7F4] transition-colors">Blueprint Studio</Link>
            <Link to="/emotion-lens" className="text-[11px] font-medium tracking-widest uppercase text-[#F9F7F4]/60 hover:text-[#F9F7F4] transition-colors">EmotionLens</Link>
            <Link to="/app" className="text-[11px] font-medium tracking-widest uppercase text-[#F9F7F4]/60 hover:text-[#F9F7F4] transition-colors">Apps</Link>
            <Link to="/app/market" className="text-[11px] font-medium tracking-widest uppercase text-[#F9F7F4]/60 hover:text-[#F9F7F4] transition-colors">Marketplace</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[11px] font-medium tracking-widest uppercase text-[#F9F7F4]/40 hover:text-[#F9F7F4] transition-colors">Sign in</Link>
            <Link to="/app" className="px-5 py-2 bg-[#4A6741] text-[#F9F7F4] text-[11px] font-bold tracking-widest uppercase rounded-full hover:bg-[#6B8F67] transition-all">Try Moodoor</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen bg-[#1A1714] text-[#F5F0E8] grid grid-cols-1 lg:grid-cols-2 items-center gap-16 px-10 lg:px-20 pt-32 pb-20 relative overflow-hidden">
        {/* Atmospheric gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_110%,rgba(61,90,62,0.35)_0%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_15%_20%,rgba(201,168,76,0.12)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_35%_25%_at_85%_10%,rgba(181,69,27,0.10)_0%,transparent_60%)]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-[#C9A84C] text-[10px] font-bold tracking-[0.2em] uppercase mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            Moodoor
            <span className="px-2 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-full text-[9px]">All tiers</span>
          </div>

          <h1 className="font-serif text-[clamp(52px,8vw,84px)] font-light leading-[1.02] tracking-tighter mb-4">
            Your door,<br />
            your <em className="italic text-[#D4A96A]">feeling.</em>
          </h1>
          <span className="block font-script text-2xl text-[#D4A96A]/60 mb-8">dressed in the mood you choose.</span>

          <p className="text-lg font-light leading-relaxed text-[#F5F0E8]/50 max-w-md mb-10">
            Moodoor is the consumer-facing heart of Evercrafted. Describe how you want your home to feel — serene, joyful, romantic, harvest-warm — and Moodoor curates a shoppable wreath and entryway bundle matched to your mood, occasion, style, and budget.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Link to="/app" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#B5451B] text-white text-[11px] font-bold tracking-widest uppercase rounded-full hover:bg-[#C94E1F] transition-all shadow-xl hover:shadow-[#B5451B]/20">
              Begin your mood ↗
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#F5F0E8]/20 text-[#F5F0E8]/60 text-[11px] font-medium tracking-widest uppercase rounded-full hover:border-[#F5F0E8]/50 hover:text-[#F5F0E8] transition-all">
              See how it works
            </a>
          </div>

          <div className="flex gap-10">
            <div>
              <div className="font-serif text-3xl text-[#F5F0E8]">10<em className="italic text-[#C9A84C] text-lg ml-1">+</em></div>
              <div className="text-[10px] tracking-widest uppercase text-[#F5F0E8]/30 mt-1">Mood profiles</div>
            </div>
            <div>
              <div className="font-serif text-3xl text-[#F5F0E8]">3</div>
              <div className="text-[10px] tracking-widest uppercase text-[#F5F0E8]/30 mt-1">Minutes to your look</div>
            </div>
            <div>
              <div className="font-serif text-3xl text-[#F5F0E8]">5</div>
              <div className="text-[10px] tracking-widest uppercase text-[#F5F0E8]/30 mt-1">Bundle clusters</div>
            </div>
          </div>
        </div>

        {/* Right: Mockup */}
        <div className="relative z-10 hidden lg:block">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              <div className="flex-1 text-center text-[9px] font-mono text-white/20 tracking-widest uppercase">Moodoor — How do you want your door to feel?</div>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="font-serif text-xl text-[#F5F0E8]">Mood<span className="text-[#C9A84C]">oor</span></div>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                  <div className="w-3.5 h-1.5 rounded-sm bg-[#B5451B]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>
              </div>
              <div className="text-[9px] tracking-widest uppercase text-white/30 mb-2">Step 1 of 5</div>
              <h3 className="font-serif text-2xl text-[#F5F0E8] leading-tight mb-2">How do you want your<br />door to <em className="italic text-[#D4A96A]">feel?</em></h3>
              <p className="text-xs text-white/40 mb-6">Pick the emotion that speaks to you right now.</p>
              
              <div className="grid grid-cols-3 gap-2 mb-6">
                {['🌿 Serene', '🌾 Grounded', '🌻 Joyful', '🌹 Romantic', '🍂 Harvest', '🌲 Holiday'].map((mood) => {
                  const moodId = mood.split(' ')[1].toLowerCase();
                  const isActive = activeMood === moodId;
                  return (
                    <div 
                      key={mood} 
                      onClick={() => setActiveMood(moodId)}
                      className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${isActive ? 'bg-[#C9A84C]/20 border-[#C9A84C] shadow-[0_0_15px_rgba(201,168,76,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                      <div className="text-xl mb-1">{mood.split(' ')[0]}</div>
                      <div className={`text-[10px] font-medium ${isActive ? 'text-[#F5F0E8]' : 'text-white/60'}`}>{mood.split(' ')[1]}</div>
                    </div>
                  );
                })}
              </div>
              <button className="w-full py-3 bg-[#B5451B] text-white text-[11px] font-bold tracking-widest uppercase rounded-lg hover:bg-[#C94E1F] transition-all">
                Continue →
              </button>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-[#F5F0E8]" />
          <span className="text-[9px] tracking-widest uppercase">Scroll to explore</span>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#B5451B] py-3.5 overflow-hidden border-y border-white/10">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {['Moodoor', '10 mood profiles', 'Shoppable bundles', '3-minute quiz', 'Budget-matched curation', '6 style archetypes'].map((item) => (
                <div key={item} className="flex items-center gap-7 px-7">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-white">{item}</span>
                  <span className="text-white/40">◆</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Intro Section */}
      <section id="how-it-works" className="py-32 px-10 lg:px-20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-[#4A6741] text-[10px] font-bold tracking-widest uppercase">
              <div className="w-6 h-px bg-[#4A6741]" />
              What it is
            </div>
            <h2 className="font-serif text-[clamp(36px,5vw,56px)] font-light leading-[1.1] tracking-tighter">
              Your door speaks<br />
              before you <em className="italic text-[#B5451B]">open it.</em>
            </h2>
            <p className="text-lg font-light leading-relaxed text-[#4A4A4A]">
              Moodoor is the consumer-facing layer of Evercrafted — the place where feeling comes before design. Instead of asking you to choose a wreath from a catalogue, Moodoor asks how you want your home to feel.
            </p>
            <div className="border-l-2 border-[#C9A84C] pl-6 py-4 bg-[#C9A84C]/5 italic font-serif text-xl text-[#2E2E2E]">
              "I never knew what I wanted until Moodoor asked me how I wanted to feel. Now my front door is the first thing I look forward to coming home to."
              <span className="block not-italic text-xs font-bold text-[#B5451B] uppercase tracking-widest mt-3">— Diane M., Bloom tier</span>
            </div>
            <Link to="/app" className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-[#B5451B] hover:gap-4 transition-all">
              Begin your mood quiz <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1A1A1A] rounded-2xl p-8 flex flex-col gap-6 md:col-span-2 md:flex-row md:items-center bg-[#3D5A3E]">
              <div className="text-3xl">🚪</div>
              <div>
                <div className="font-serif text-4xl text-white">3<em className="italic text-[#C9A84C] text-xl ml-1">min</em></div>
                <div className="text-[10px] tracking-widest uppercase text-white/40 mt-1">From first question to a fully curated, shoppable entryway bundle</div>
              </div>
            </div>
            <div className="bg-[#1A1A1A] rounded-2xl p-8 space-y-4">
              <div className="text-2xl">🌿</div>
              <div className="font-serif text-3xl text-white">10<em className="italic text-[#C9A84C] text-lg ml-1">+</em></div>
              <div className="text-[10px] tracking-widest uppercase text-white/40">Distinct mood profiles</div>
            </div>
            <div className="bg-[#1A1A1A] rounded-2xl p-8 space-y-4">
              <div className="text-2xl">🎨</div>
              <div className="font-serif text-3xl text-white">6</div>
              <div className="text-[10px] tracking-widest uppercase text-white/40">Style archetypes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mood Library */}
      <section className="py-32 bg-[#1A1A1A] text-[#F9F7F4] px-10 lg:px-20 overflow-hidden">
        <div className="max-w-[1200px] mx-auto text-center mb-16 space-y-6">
          <div className="text-[#6B8F67] text-[10px] font-bold tracking-widest uppercase">The mood library</div>
          <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-light leading-tight tracking-tighter">Ten ways to feel<br /><em className="italic text-[#D4A96A]">at home.</em></h2>
          <p className="text-lg font-light text-white/40 max-w-lg mx-auto">Each mood maps to a curated bundle cluster — wreath, mat, stems, botanicals, and ambient glow — assembled from your maker's live inventory.</p>
        </div>

        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
          {Object.keys(MOOD_DATA).map((moodId) => (
            <button 
              key={moodId}
              onClick={() => setActiveMood(moodId)}
              className={`p-6 rounded-2xl border text-center transition-all relative overflow-hidden group ${activeMood === moodId ? 'border-[#C9A84C] bg-[#C9A84C]/10 shadow-[0_0_20px_rgba(201,168,76,0.15)]' : 'border-white/5 bg-white/3 hover:border-white/10'}`}
            >
              <span className="text-3xl block mb-3 relative z-10">{MOOD_DATA[moodId].bundle[0].split(' ')[0]}</span>
              <div className="font-serif text-lg relative z-10">{MOOD_DATA[moodId].name}</div>
              <div className="text-[10px] tracking-widest uppercase text-white/30 mt-1 relative z-10">{MOOD_DATA[moodId].cluster} cluster</div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeMood}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-[1200px] mx-auto bg-white/3 border border-white/5 rounded-2xl p-10 grid grid-cols-1 lg:grid-cols-[350px_1fr_auto] gap-12 items-center"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
              <img 
                src={`https://picsum.photos/seed/evercrafted-${activeMood}/800/800`} 
                alt={currentMood.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4">
                <div className="text-[10px] font-bold tracking-widest uppercase text-white/60 mb-1">Mood Preview</div>
                <div className="font-serif text-lg text-white">{currentMood.name}</div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-3xl">{currentMood.name} <em className="italic text-[#D4A96A]"> — {currentMood.cluster} cluster</em></h3>
                {isAnalyzing && (
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="px-2 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded text-[8px] text-[#C9A84C] font-bold tracking-widest uppercase"
                  >
                    AI Curating...
                  </motion.div>
                )}
              </div>
              <p className="text-lg font-light text-white/50 leading-relaxed max-w-2xl">{currentMood.desc}</p>
              <div className="flex flex-wrap gap-2">
                {(aiBundle.length > 0 ? aiBundle : currentMood.bundle).map((item: string, i: number) => (
                  <motion.span 
                    key={item} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`px-4 py-1.5 rounded-full text-[11px] tracking-wide border ${i === 0 ? 'bg-[#3D5A3E]/20 border-[#6B8F67]/30 text-[#6B8F67]' : 'bg-white/5 border-white/10 text-white/50'}`}
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              {currentMood.colors.map((c: string) => (
                <div key={c} className="w-12 h-12 rounded-full border-2 border-white/10" style={{ backgroundColor: c }} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* How it works steps */}
      <section className="py-32 bg-[#F2EFE9] px-10 lg:px-20">
        <div className="max-w-[1200px] mx-auto text-center mb-20 space-y-6">
          <div className="text-[#4A6741] text-[10px] font-bold tracking-widest uppercase">The process</div>
          <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-light leading-tight tracking-tighter">Five questions.<br /><em className="italic text-[#B5451B]">One perfect door.</em></h2>
        </div>

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 relative">
          {/* Connector Line */}
          <div className="absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#D0D0D0] to-transparent hidden md:block" />
          
          {[
            { n: '01', icon: '🌿', title: 'Choose your mood', desc: 'Pick the emotion you want your door to convey — from 10 curated mood profiles.' },
            { n: '02', icon: '🎉', title: 'Set the occasion', desc: 'Everyday refresh, house warming, or holiday gathering — fine-tunes your bundle.' },
            { n: '03', icon: '🎨', title: 'Pick your style', desc: 'Natural, Modern, Festive, Romantic, Rustic, or Minimal — shapes every material choice.' },
            { n: '04', icon: '💰', title: 'Set your budget', desc: 'Moodoor builds the best possible bundle within your range — no hidden upsells.' },
            { n: '05', icon: '✨', title: 'Receive concepts', desc: 'Three curated bundle variants — each with a confidence score and a story.' }
          ].map((step, i) => (
            <div key={i} className="text-center space-y-6 relative z-10 group">
              <div className="w-14 h-14 rounded-full bg-[#F9F7F4] border border-[#E8E8E8] flex items-center justify-center mx-auto group-hover:bg-[#1A1A1A] group-hover:border-[#1A1A1A] transition-all duration-500">
                <span className="font-serif text-xl text-[#A8A8A8] group-hover:text-white transition-colors">{step.n}</span>
              </div>
              <div className="space-y-3">
                <span className="text-xl block">{step.icon}</span>
                <h4 className="font-serif text-lg leading-tight">{step.title}</h4>
                <p className="text-[13px] text-[#787878] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Sections */}
      <section className="py-32 px-10 lg:px-20 bg-[#F9F7F4]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-3 text-[#4A6741] text-[10px] font-bold tracking-widest uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4A6741]" />
              Feature 01
            </div>
            <h3 className="font-serif text-5xl font-light leading-tight tracking-tighter">Emotion-first<br /><em className="italic text-[#B5451B]">curation.</em></h3>
            <p className="text-lg font-light leading-relaxed text-[#4A4A4A]">
              Most home décor tools start with a product catalogue. Moodoor starts with a feeling. The five-step quiz is built around emotional intent — mood, occasion, aesthetic direction, budget, and practical constraints — so the curation engine understands not just what you want, but why.
            </p>
            <div className="p-6 bg-[#4A6741]/5 border-l-2 border-[#4A6741] rounded-r-lg text-sm italic text-[#4A4A4A] leading-relaxed">
              Moodoor is available on all Evercrafted tiers. Bloom subscribers can access the full quiz and receive curated bundles. Studio and Atelier subscribers unlock the AI door transformation preview.
            </div>
            <Link to="/app" className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-[#B5451B] hover:gap-4 transition-all">
              Start the quiz <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-[#1A1714] rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              <div className="flex-1 text-center text-[9px] font-mono text-white/20 tracking-widest uppercase">Moodoor Quiz · Step 1 of 5</div>
            </div>
            <div className="p-10">
              <div className="text-[9px] tracking-widest uppercase text-white/30 mb-2">Step 1 of 5</div>
              <h3 className="font-serif text-2xl text-[#F5F0E8] leading-tight mb-2">How do you want your<br />door to <em className="italic text-[#D4A96A]">feel?</em></h3>
              <p className="text-xs text-white/40 mb-8">Pick the emotion that speaks to you right now.</p>
              <div className="grid grid-cols-3 gap-2 mb-8">
                {['🌿 Serene', '🌾 Grounded', '🌻 Joyful', '🌹 Romantic', '🍂 Harvest', '🌲 Holiday'].map((mood) => {
                  const moodId = mood.split(' ')[1].toLowerCase();
                  const isActive = activeMood === moodId;
                  return (
                    <div 
                      key={mood} 
                      onClick={() => setActiveMood(moodId)}
                      className={`p-4 rounded-lg border text-center transition-all cursor-pointer ${isActive ? 'bg-[#C9A84C]/20 border-[#C9A84C] shadow-[0_0_15px_rgba(201,168,76,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                      <div className="text-xl mb-1">{mood.split(' ')[0]}</div>
                      <div className={`text-[10px] font-medium ${isActive ? 'text-[#F5F0E8]' : 'text-white/60'}`}>{mood.split(' ')[1]}</div>
                    </div>
                  );
                })}
              </div>
              <button className="w-full py-3.5 bg-[#B5451B] text-white text-[11px] font-bold tracking-widest uppercase rounded-lg">Continue →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Archetypes */}
      <section className="py-32 px-10 lg:px-20 bg-[#F9F7F4]">
        <div className="max-w-[1200px] mx-auto text-center mb-16 space-y-6">
          <div className="text-[#4A6741] text-[10px] font-bold tracking-widest uppercase">Style archetypes</div>
          <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-light leading-tight tracking-tighter">Same feeling,<br />six <em className="italic text-[#B5451B]">different forms.</em></h2>
        </div>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Natural', icon: '🌿', bg: 'linear-gradient(135deg,#D4C9B0,#B8A880)', tags: ['Jute', 'Dried botanicals', 'Linen'] },
            { name: 'Modern', icon: '◼', bg: 'linear-gradient(135deg,#C8C8C8,#A0A0A0)', tags: ['Structural', 'Monochrome', 'Stone'] },
            { name: 'Festive', icon: '🎀', bg: 'linear-gradient(135deg,#D4845A,#B5451B)', tags: ['Ribbons', 'Berries', 'Bold colour'] },
            { name: 'Romantic', icon: '🌸', bg: 'linear-gradient(135deg,#E8B4C8,#D490B0)', tags: ['Blush', 'Dried roses', 'Velvet'] },
            { name: 'Rustic', icon: '🍂', bg: 'linear-gradient(135deg,#B89068,#8A6840)', tags: ['Wheat', 'Amber glass', 'Wood'] },
            { name: 'Minimal', icon: '·', bg: 'linear-gradient(135deg,#E8E4DC,#D0CCC4)', tags: ['Single stem', 'Stone', 'Restraint'] }
          ].map((arch) => (
            <div key={arch.name} className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-xl group">
              <div className="h-40 flex items-center justify-center text-5xl" style={{ background: arch.bg }}>{arch.icon}</div>
              <div className="p-8 space-y-4">
                <h4 className="font-serif text-2xl">{arch.name}</h4>
                <p className="text-sm text-[#787878] leading-relaxed">Distinct material palette and colour story that overlays your mood selection.</p>
                <div className="flex flex-wrap gap-2">
                  {arch.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#F5F5F5] rounded-full text-[9px] font-bold tracking-widest uppercase text-[#A8A8A8]">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-10 lg:px-20 bg-[#F9F7F4] border-t border-[#E8E8E8]">
        <div className="max-w-[1200px] mx-auto text-center mb-16 space-y-6">
          <div className="text-[#4A6741] text-[10px] font-bold tracking-widest uppercase">Plans</div>
          <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-light leading-tight tracking-tighter">Moodoor on every<br /><em className="italic text-[#B5451B]">tier.</em></h2>
        </div>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: 'Bloom', price: '$19', features: ['Full Moodoor mood quiz', '3 bundle concepts', 'All 10 mood profiles'] },
            { name: 'Craft', price: '$39', features: ['Everything in Bloom', 'Saved quiz profiles', 'Regenerate unlimited'] },
            { name: 'Studio', price: '$59', features: ['Everything in Craft', 'AI door transformation', 'Photo upload preview'], recommended: true },
            { name: 'Atelier', price: '$99', features: ['Everything in Studio', 'White-label branding', 'Custom mood profiles'], dark: true }
          ].map((tier) => (
            <div key={tier.name} className={`p-10 rounded-2xl border transition-all duration-500 hover:-translate-y-2 ${tier.recommended ? 'bg-white border-[#4A6741] shadow-2xl scale-105 z-10' : tier.dark ? 'bg-[#1A1A1A] border-white/10 text-white' : 'bg-white border-[#E8E8E8]'}`}>
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className={`text-[10px] font-bold tracking-widest uppercase ${tier.dark ? 'text-white/40' : 'text-[#787878]'}`}>{tier.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-4xl">{tier.price}</span>
                    <span className={`text-xs ${tier.dark ? 'text-white/40' : 'text-[#787878]'}`}>/mo</span>
                  </div>
                </div>
                <ul className="space-y-4">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-3 text-[11px] leading-relaxed">
                      <Check className={`w-4 h-4 shrink-0 ${tier.dark ? 'text-[#6B8F67]' : 'text-[#4A6741]'}`} />
                      <span className={tier.dark ? 'text-white/60' : 'text-[#4A4A4A]'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/app" className={`block text-center py-3 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${tier.recommended ? 'bg-[#4A6741] text-white hover:bg-[#6B8F67]' : tier.dark ? 'border border-white/10 text-white/60 hover:border-white/30 hover:text-white' : 'border border-[#E8E8E8] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'}`}>
                  Start free trial
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-48 bg-[#1A1714] text-center relative overflow-hidden px-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(61,90,62,0.3)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <span className="font-script text-3xl text-[#D4A96A]/60">begin your mood</span>
          <h2 className="font-serif text-[clamp(44px,8vw,72px)] font-light leading-[1.08] tracking-tighter text-[#F5F0E8]">Your door is waiting<br />to feel <em className="italic text-[#D4A96A]">something.</em></h2>
          <p className="text-lg font-light text-[#F5F0E8]/40 leading-relaxed">Take the three-minute Moodoor quiz and receive three curated, shoppable entryway bundles matched to your mood, style, and budget — instantly.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/app" className="px-10 py-4 bg-[#B5451B] text-white text-[11px] font-bold tracking-widest uppercase rounded-full hover:bg-[#C94E1F] transition-all shadow-2xl">Begin your mood ↗</Link>
            <Link to="/app" className="px-10 py-4 border border-[#F5F0E8]/20 text-[#F5F0E8]/60 text-[11px] font-medium tracking-widest uppercase rounded-full hover:border-[#F5F0E8]/40 hover:text-[#F5F0E8] transition-all">Explore all apps</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2E2E2E] py-20 px-10 lg:px-20 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white font-serif text-lg">
              <svg className="text-[#6B8F67]" width="16" height="20" viewBox="0 0 32 40" fill="none">
                <path d="M16 38C16 38 4 26 4 14C4 7.4 9.4 2 16 2C22.6 2 28 7.4 28 14C28 26 16 38 16 38Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M16 38L16 8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
              </svg>
              Evercrafted
            </div>
            <p className="text-sm text-white/30 leading-relaxed max-w-xs">The professional wreath-making platform. Blueprint Studio, Moodoor, AI Visualizer, and 13 more tools for makers.</p>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-6">Apps</div>
            <ul className="space-y-3 text-sm text-white/40">
              <li><Link to="/blueprint-studio" className="hover:text-white transition-colors">Blueprint Studio</Link></li>
              <li><Link to="/moodoor" className="hover:text-white transition-colors">Moodoor</Link></li>
              <li><Link to="/app/market" className="hover:text-white transition-colors">Marketplace</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-6">Platform</div>
            <ul className="space-y-3 text-sm text-white/40">
              <li><Link to="/" className="hover:text-white transition-colors">How it works</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-6">Company</div>
            <ul className="space-y-3 text-sm text-white/40">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-white/20">
          <div>© 2026 Evercrafted. All rights reserved.</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white/40 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/40 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
