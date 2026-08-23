import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LuxuryImage from './LuxuryImage';
import { FiArrowRight, FiStar, FiCheckCircle } from 'react-icons/fi';

export default function Hero() {
  const navigate = useNavigate();

  // Highlight tags for auto-sliding banner badge
  const highlightTags = [
    'Authentic Dhakai Jamdani',
    'Pure Handloom Katan Silk',
    'Rajshahi Heritage Silk',
    'Bespoke Muslin & Organza',
    'Royal Bridal Collection',
  ];

  const [activeTagIndex, setActiveTagIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTagIndex((prev) => (prev + 1) % highlightTags.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const sareeCategories = [
    { name: 'Katan', icon: '✨', count: '45+ Weaves' },
    { name: 'Jamdani', icon: '🪡', count: '60+ Weaves' },
    { name: 'Rajshahi Silk', icon: '🧣', count: '30+ Weaves' },
    { name: 'Georgette', icon: '🌸', count: '25+ Weaves' },
    { name: 'Muslin', icon: '👑', count: '20+ Weaves' },
    { name: 'Bridal Collection', icon: '💍', count: '35+ Weaves' },
  ];

  // Featured Saree Photography for the Multi-Image Mosaic Banner
  const collageImages = [
    {
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
      title: 'Handcrafted Jamdani',
      subtitle: 'Traditional Motif',
      aspect: 'col-span-2 row-span-2 h-64 sm:h-80 md:h-96',
    },
    {
      url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
      title: 'Katan Silk',
      subtitle: 'Royal Zaridozi',
      aspect: 'col-span-1 row-span-1 h-32 sm:h-40 md:h-48',
    },
    {
      url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
      title: 'Rajshahi Silk',
      subtitle: 'Pure Elegance',
      aspect: 'col-span-1 row-span-1 h-32 sm:h-40 md:h-48',
    },
  ];

  return (
    <section className="relative w-full max-w-7xl mx-auto my-4 sm:my-8 rounded-3xl overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-rose-950 text-stone-100 shadow-2xl border border-amber-500/20">
      
      {/* Decorative Background Lighting & Ambient Orbs */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="px-5 py-8 sm:px-10 sm:py-14 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">
        
        {/* LEFT COLUMN: BRAND PROMISE & ACTIONS */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          {/* AUTO-SLIDING FLOATING BADGE */}
          <div className="inline-flex items-center gap-2.5 bg-stone-900/90 backdrop-blur-md border border-amber-400/40 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-6 text-amber-300 shadow-md">
            <FiStar className="w-4 h-4 text-amber-400 animate-pulse shrink-0 fill-amber-400" />
            <div className="h-5 overflow-hidden relative min-w-[200px] sm:min-w-[240px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeTagIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center text-amber-200"
                >
                  {highlightTags[activeTagIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* MAIN SERIF HEADLINE */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight leading-[1.15] bg-gradient-to-r from-amber-100 via-stone-100 to-amber-300 bg-clip-text text-transparent">
            Bengali Heritage & Timeless Saree Artistry
          </h1>

          {/* SUBTITLE */}
          <p className="mt-4 text-sm sm:text-base text-stone-300/90 font-sans font-medium leading-relaxed max-w-xl">
            Immerse yourself in authentic Dhakai Jamdani, pure Katan Silk, and handcrafted Rajshahi Muslin. Each piece is meticulously woven by master artisans across Bangladesh.
          </p>

          {/* DYNAMIC CTA BUTTONS */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
            <button
              onClick={() => navigate('/products')}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-sans font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition-all duration-300 active:scale-95 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2.5 cursor-pointer group gold-hover-ring"
            >
              <span>Explore New Arrivals</span>
              <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => navigate('/category/jamdani')}
              className="px-7 py-4 bg-stone-900/80 hover:bg-stone-800 text-stone-200 hover:text-amber-200 border border-stone-700/80 hover:border-amber-400/50 font-sans font-bold text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Shop Collection</span>
            </button>
          </div>

          {/* REASSURANCE BADGES */}
          <div className="mt-8 pt-6 border-t border-stone-800/80 flex flex-wrap items-center gap-4 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <FiCheckCircle className="text-amber-400" /> 100% Handloom Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <FiCheckCircle className="text-amber-400" /> Cash on Delivery Nationwide
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: MULTI-IMAGE SAREE MOSAIC COLLAGE */}
        <div className="lg:col-span-5 w-full">
          <div className="grid grid-cols-2 gap-3 relative p-2 rounded-3xl bg-stone-900/60 border border-amber-500/10 backdrop-blur-xs">
            
            {/* MOSAIC IMAGE 1 (Main Big Feature) */}
            <div className="col-span-2 relative rounded-2xl overflow-hidden group shadow-lg h-56 sm:h-64 border border-amber-400/20">
              <LuxuryImage
                src={collageImages[0].url}
                alt={collageImages[0].title}
                aspectRatio="aspect-auto"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-80" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                    Featured Motif
                  </span>
                  <h3 className="font-serif text-lg font-bold text-stone-100 mt-1">
                    {collageImages[0].title}
                  </h3>
                </div>
                <span className="text-xs text-stone-300 font-sans bg-stone-900/80 px-2.5 py-1 rounded-lg border border-stone-700">
                  {collageImages[0].subtitle}
                </span>
              </div>
            </div>

            {/* MOSAIC IMAGE 2 */}
            <div className="col-span-1 relative rounded-2xl overflow-hidden group shadow-md h-36 sm:h-44 border border-stone-800">
              <LuxuryImage
                src={collageImages[1].url}
                alt={collageImages[1].title}
                aspectRatio="aspect-auto"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-75" />
              <div className="absolute bottom-2 left-3">
                <p className="font-serif text-xs font-bold text-amber-200">{collageImages[1].title}</p>
                <p className="text-[9px] text-stone-400 uppercase tracking-wider">{collageImages[1].subtitle}</p>
              </div>
            </div>

            {/* MOSAIC IMAGE 3 */}
            <div className="col-span-1 relative rounded-2xl overflow-hidden group shadow-md h-36 sm:h-44 border border-stone-800">
              <LuxuryImage
                src={collageImages[2].url}
                alt={collageImages[2].title}
                aspectRatio="aspect-auto"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-75" />
              <div className="absolute bottom-2 left-3">
                <p className="font-serif text-xs font-bold text-amber-200">{collageImages[2].title}</p>
                <p className="text-[9px] text-stone-400 uppercase tracking-wider">{collageImages[2].subtitle}</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* QUICK JUMP CATEGORY ANCHORS BAR */}
      <div className="w-full bg-stone-950/80 border-t border-stone-800 px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-amber-300/80 shrink-0">
            Signature Weaves & Categories:
          </span>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full">
            {sareeCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/category/${encodeURIComponent(cat.name.toLowerCase())}`)}
                className="flex items-center gap-2 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-400/40 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer text-stone-200 hover:text-amber-300"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}