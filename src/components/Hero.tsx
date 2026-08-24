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
  { name: 'Bridal Collection', detail: 'For days held close' },
];

export default function Hero() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 2500);
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[active];

  return (
    <section className="hero-shell relative mx-auto my-5 w-full max-w-7xl overflow-hidden bg-brand-primary text-brand-secondary shadow-xl">
      <div className="grid items-stretch lg:grid-cols-[.9fr_1.1fr]">
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
          <p className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.28em] text-brand-secondary/75"><span className="h-px w-10 bg-brand-secondary/60" />Bengali sarees, thoughtfully chosen</p>
          <h1 className="max-w-xl font-serif text-4xl font-normal leading-[1.08] tracking-[-.04em] text-balance sm:text-6xl">Sarees with a story in every thread.</h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-brand-secondary/80 sm:text-base">Discover handpicked Bengali sarees shaped by patient looms, graceful drapes, and motifs passed from one generation to the next.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><button onClick={() => navigate('/products')} className="group inline-flex items-center justify-center gap-3 bg-brand-secondary px-6 py-3.5 text-xs font-bold uppercase tracking-[.16em] text-brand-primary-dark transition hover:bg-white">Explore the collection <FiArrowUpRight className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></button><button onClick={() => navigate('/category/jamdani')} className="inline-flex items-center justify-center border border-brand-secondary/50 px-6 py-3.5 text-xs font-bold uppercase tracking-[.16em] text-brand-secondary transition hover:bg-brand-secondary/10">Discover Jamdani</button></div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-brand-secondary/20 pt-5 text-[11px] font-medium text-brand-secondary/75"><span className="flex items-center gap-2"><FiCheck /> Handloom verified</span><span className="flex items-center gap-2"><FiCheck /> Made across Bangladesh</span></div>
        </div>
        <div className="relative min-h-[360px] overflow-hidden bg-brand-secondary lg:min-h-[520px]">
          <img key={slide.image} src={slide.image} alt={`${slide.label} saree collection`} className="absolute inset-0 h-full w-full object-cover animate-[fadeIn_.7s_ease]" />
          <div className="absolute inset-0 bg-brand-primary/10" />
          <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between sm:bottom-10 sm:left-10 sm:right-10"><div><p className="text-[10px] font-bold uppercase tracking-[.25em] text-white/80">{slide.label}</p><p className="mt-2 max-w-[260px] font-serif text-2xl leading-tight text-white">{slide.title}</p></div><div className="flex gap-1.5" aria-label="Saree campaign slides">{slides.map((item, index) => <button key={item.image} aria-label={`Show slide ${index + 1}`} aria-current={index === active} onClick={() => setActive(index)} className={`h-1.5 transition-all ${index === active ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} />)}</div></div>
        </div>
      </div>
      <div className="grid border-t border-brand-secondary/20 sm:grid-cols-4">{categories.map((category) => <button key={category.name} onClick={() => navigate(`/category/${encodeURIComponent(category.name.toLowerCase())}`)} className="group border-b border-brand-secondary/20 px-5 py-5 text-left transition hover:bg-brand-primary-light last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><span className="font-serif text-lg text-brand-secondary">{category.name}</span><span className="mt-1 block text-[11px] leading-5 text-brand-secondary/65 group-hover:text-brand-secondary/90">{category.detail}</span></button>)}</div>
    </section>
  );
}

// animation is intentionally subtle so the fabric remains the focus
