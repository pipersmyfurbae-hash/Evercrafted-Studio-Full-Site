import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const { user, signInWithGoogle } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ["/home-01.jpg", "/home-02.jpg", "/home-03.jpg", "/home-04.jpg", "/home-05.jpg"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (user) {
    return <Navigate to="/app" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream font-sans text-ink selection:bg-sage-l selection:text-ink">
      {/* Left Side - Image/Mood */}
      <div className="hidden md:block w-1/2 relative bg-ink overflow-hidden">
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
              alt="Floral Studio" 
              className="w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent opacity-60" />
        <div className="absolute bottom-12 left-12 right-12 space-y-6">
          <div className="h-[1px] w-12 bg-white-studio/40" />
          <h2 className="text-[clamp(40px,5vw,72px)] font-serif text-white-studio leading-[0.95] font-light tracking-tighter">
            <span className="salty-style">intentional</span> <br />
            <span className="life-style">DESIGN.</span>
          </h2>
          <p className="text-white-studio/60 font-serif italic max-w-sm font-light text-lg leading-relaxed">
            Inventory-driven and emotion-driven wreath design systems for the modern floral artist.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 bg-white-studio relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <span className="font-serif text-[12rem] leading-none text-ink">EC</span>
        </div>

        <div className="max-w-md w-full space-y-16 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-ink/30" />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-studio">Studio Access</span>
            </div>
            <h1 className="text-[clamp(48px,6vw,84px)] font-serif text-ink font-light leading-[0.9] tracking-tighter">
              Evercrafted <br />
              <span className="salty-style">studio</span>
            </h1>
            <p className="text-muted-studio font-serif italic text-xl font-light">
              Welcome back to the Evercrafted studio.
            </p>
          </div>

          <div className="space-y-8">
            <Button 
              className="w-full h-16 rounded-none bg-ink text-white-studio hover:bg-ink-2 uppercase tracking-[0.25em] text-[11px] font-bold transition-all hover:translate-y-[-2px] shadow-2xl shadow-ink/20"
              onClick={signInWithGoogle}
            >
              Sign in with Google
            </Button>
            
            <div className="pt-12 border-t border-ink/5">
              <p className="text-[9px] tracking-[0.15em] uppercase text-muted-studio/40 text-center leading-relaxed">
                By entering the studio you agree to our <br />
                terms of creative service and privacy policy.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-12 left-8 sm:left-12 lg:left-24">
          <p className="text-[9px] tracking-[0.2em] uppercase text-muted-studio/30 font-bold">
            © 2026 EVERCRAFTED DESIGN STUDIO
          </p>
        </div>
      </div>
    </div>
  );
}
