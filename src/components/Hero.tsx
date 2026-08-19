import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  const sareeCategories = [
    { name: 'Katan', icon: '✨', color: 'hover:bg-amber-100 hover:text-amber-900 hover:border-amber-300' },
    { name: 'Jamdani', icon: '🪡', color: 'hover:bg-rose-100 hover:text-rose-900 hover:border-rose-300' },
    { name: 'Rajshahi Silk', icon: '🧣', color: 'hover:bg-amber-100 hover:text-amber-900 hover:border-amber-300' },
    { name: 'Georgette', icon: '🌸', color: 'hover:bg-rose-100 hover:text-rose-900 hover:border-rose-300' },
    { name: 'Muslin', icon: '👑', color: 'hover:bg-amber-100 hover:text-amber-900 hover:border-amber-300' },
    { name: 'Bridal Collection', icon: '💍', color: 'hover:bg-rose-100 hover:text-rose-900 hover:border-rose-300' },
  ];

  return (
    <div className="relative w-full max-w-6xl mx-auto my-6 rounded-3xl overflow-hidden bg-gradient-to-br from-rose-950 via-rose-900 to-red-950 text-white shadow-2xl border border-rose-800/40">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="px-6 py-12 sm:px-12 sm:py-16 md:py-20 flex flex-col items-center text-center relative z-10">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-amber-300/30 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase mb-6 text-amber-200">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          Exclusive Saree Artisanship
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight max-w-3xl leading-tight bg-gradient-to-r from-amber-100 via-rose-100 to-amber-200 bg-clip-text text-transparent">
          Royal Heritage & Timeless Elegance
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-xs sm:text-sm md:text-base text-rose-100/80 max-w-2xl font-medium leading-relaxed">
          Explore our handcrafted Dhakai Jamdani, pure Katan Silk, authentic Rajshahi Silk, Muslin, and exclusive Bridal Saree collections woven for every memorable occasion.
        </p>

        {/* CTA Button */}
        <div className="mt-8 flex flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/products')}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-rose-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Browse Saree Catalog</span>
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Category Jump Anchor Bar */}
        <div className="mt-12 w-full border-t border-white/10 pt-8">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-200/70 mb-4">
            Quick Jump To Signature Weaves
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {sareeCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/category/${encodeURIComponent(cat.name.toLowerCase())}`)}
                className={`flex items-center gap-2 px-3 py-2 sm:px-4 bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer text-rose-100 ${cat.color}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}