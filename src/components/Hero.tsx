import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowUpRight, FiCheck } from 'react-icons/fi';

const slides = [
  { image: '/saree-campaign.png', label: 'The new season', title: 'A row of stories, woven for you.' },
  { image: '/saree-slide-2.png', label: 'Katan silk', title: 'Quiet sheen. Certain presence.' },
  { image: '/saree-slide-3.png', label: 'Jamdani', title: 'Air-light artistry from the loom.' },
  { image: '/saree-slide-4.png', label: 'Festive edit', title: 'Colour for the days you remember.' },
  { image: '/saree-slide-5.png', label: 'Everyday heirlooms', title: 'Softly made for a life well lived.' },
];

const categories = [
  { name: 'Katan', detail: 'Silk with a quiet sheen' },
  { name: 'Jamdani', detail: 'Woven stories from Dhaka' },
  { name: 'Rajshahi Silk', detail: 'The riverland classic' },
  { name: 'Bridal Edit', detail: 'For days held close' },
];

export default function Hero() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 3000);
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[active];

  return (
    <section className="hero-shell relative mx-auto my-1 sm:my-3 lg:my-4 flex flex-col justify-between w-full max-w-7xl overflow-hidden bg-gradient-to-br from-stone-950 via-rose-950 to-stone-900 text-stone-100 rounded-2xl shadow-2xl border border-amber-500/20 max-h-[calc(100dvh-8rem)] min-h-[460px] sm:min-h-[500px] lg:min-h-[520px]">
      
      {/* MAIN CONTENT GRID */}
      <div className="grid flex-1 items-center lg:grid-cols-[1.1fr_0.9fr] p-3 sm:p-6 lg:p-8 gap-3 sm:gap-6 min-h-0 overflow-hidden">
        
        {/* LEFT TEXT BLOCK */}
        <div className="flex flex-col justify-center px-1 sm:px-4 lg:px-6 py-1 min-h-0">
          <p className="mb-2 sm:mb-4 flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[.25em] text-amber-300/90">
            <span className="h-px w-6 sm:w-10 bg-amber-400/60" />
            Royal Bangladeshi Sarees
          </p>
          
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight text-amber-100 tracking-tight">
            Sarees with a story in every thread.
          </h1>
          
          <p className="mt-2 sm:mt-4 max-w-lg text-xs sm:text-sm leading-relaxed text-stone-300/90 line-clamp-2 sm:line-clamp-3">
            Discover handpicked Bangladeshi sarees shaped by patient looms, graceful drapes, and motifs passed from generation to generation.
          </p>

          <div className="mt-4 sm:mt-6 flex flex-row flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/products')}
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md transition active:scale-95 cursor-pointer"
            >
              <span>Explore Collection</span>
              <FiArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <button
              onClick={() => navigate('/category/jamdani')}
              className="inline-flex items-center justify-center border border-amber-400/40 hover:border-amber-300 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-200 hover:bg-amber-500/10 transition active:scale-95 cursor-pointer"
            >
              Discover Jamdani
            </button>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-stone-800 pt-3 text-[10px] sm:text-[11px] font-semibold text-stone-400">
            <span className="flex items-center gap-1.5 text-amber-300/90">
              <FiCheck className="text-amber-400" /> Handloom Verified
            </span>
            <span className="flex items-center gap-1.5 text-amber-300/90">
              <FiCheck className="text-amber-400" /> Made Across Bangladesh
            </span>
          </div>
        </div>

        {/* RIGHT CAROUSEL IMAGE BLOCK */}
        <div className="relative h-44 sm:h-64 lg:h-full w-full min-h-[160px] overflow-hidden rounded-xl bg-stone-900/60 border border-amber-500/20 flex items-center justify-center">
          <img
            key={slide.image}
            src={slide.image}
            alt={`${slide.label} saree collection`}
            className="absolute inset-0 h-full w-full object-contain p-2 animate-[fadeIn_.6s_ease]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 flex items-end justify-between z-10">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-amber-300">{slide.label}</p>
              <p className="mt-0.5 max-w-[220px] font-serif text-sm sm:text-lg leading-tight text-white font-bold line-clamp-1">{slide.title}</p>
            </div>
            
            {/* Slide Indicators */}
            <div className="flex gap-1.5" aria-label="Saree campaign slides">
              {slides.map((item, index) => (
                <button
                  key={item.image}
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={index === active}
                  onClick={() => setActive(index)}
                  className={`h-1.5 transition-all duration-300 cursor-pointer ${
                    index === active ? 'w-6 sm:w-8 bg-amber-400 rounded-full' : 'w-1.5 bg-white/40 rounded-full'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM QUICK CATEGORIES ROW */}
      <div className="grid grid-cols-4 border-t border-stone-800/80 bg-stone-950/80">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => navigate(`/category/${encodeURIComponent(category.name.toLowerCase())}`)}
            className="group min-h-[44px] sm:min-h-[56px] border-r border-stone-800/60 px-2 sm:px-4 py-2 text-center sm:text-left transition hover:bg-amber-500/10 last:border-r-0 cursor-pointer"
          >
            <span className="font-serif text-[11px] sm:text-sm font-bold text-amber-200 group-hover:text-amber-300 block truncate">
              {category.name}
            </span>
            <span className="hidden sm:block text-[9px] sm:text-[10px] text-stone-400 group-hover:text-stone-300 truncate">
              {category.detail}
            </span>
          </button>
        ))}
      </div>

    </section>
  );
}
