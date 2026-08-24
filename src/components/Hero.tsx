import { useNavigate } from 'react-router-dom';
import { FiArrowUpRight, FiCheck } from 'react-icons/fi';

const categories = [
  { name: 'Katan', detail: 'Silk with a quiet sheen' },
  { name: 'Jamdani', detail: 'Woven stories from Dhaka' },
  { name: 'Rajshahi Silk', detail: 'The riverland classic' },
  { name: 'Bridal Collection', detail: 'For days held close' },
];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero-shell relative w-full max-w-7xl mx-auto my-5 overflow-hidden bg-brand-primary text-brand-secondary shadow-xl">
      <div className="grid lg:grid-cols-[1.05fr_.95fr] items-stretch">
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
          <p className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.28em] text-brand-secondary/75">
            <span className="h-px w-10 bg-brand-secondary/60" />
            A living textile tradition
          </p>
          <h1 className="max-w-xl font-serif text-4xl font-normal leading-[1.08] tracking-[-.04em] text-balance sm:text-6xl">
            Wear a story that began by the river.
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-brand-secondary/80 sm:text-base">
            Meenakkhi brings together heirloom sarees shaped by Bengali hands, patient looms, and motifs passed from one generation to the next.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => navigate('/products')} className="group inline-flex items-center justify-center gap-3 bg-brand-secondary px-6 py-3.5 text-xs font-bold uppercase tracking-[.16em] text-brand-primary-dark transition hover:bg-white">
              Explore the collection <FiArrowUpRight className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
            <button onClick={() => navigate('/category/jamdani')} className="inline-flex items-center justify-center border border-brand-secondary/50 px-6 py-3.5 text-xs font-bold uppercase tracking-[.16em] text-brand-secondary transition hover:bg-brand-secondary/10">
              Discover Jamdani
            </button>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-brand-secondary/20 pt-5 text-[11px] font-medium text-brand-secondary/75">
            <span className="flex items-center gap-2"><FiCheck /> Handloom verified</span>
            <span className="flex items-center gap-2"><FiCheck /> Made across Bangladesh</span>
          </div>
        </div>

        <div className="relative min-h-[340px] bg-brand-secondary p-5 sm:p-8 lg:min-h-[520px]">
          <div className="absolute inset-5 border border-brand-primary/20 sm:inset-8" />
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-yAAraSTJgWL0fBXTs7m6TSshTN7QBJ.png" alt="Meenakkhi Bengali fish emblem" className="absolute inset-0 m-auto w-[78%] max-w-[430px] mix-blend-multiply" />
          <div className="absolute bottom-9 left-9 right-9 flex items-end justify-between sm:bottom-12 sm:left-12 sm:right-12">
            <p className="max-w-[160px] font-serif text-lg leading-tight text-brand-primary-dark">The eye of the fish, the eye of the craft.</p>
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand-primary/70">Est. 2024</span>
          </div>
        </div>
      </div>
      <div className="grid border-t border-brand-secondary/20 sm:grid-cols-4">
        {categories.map((category) => (
          <button key={category.name} onClick={() => navigate(`/category/${encodeURIComponent(category.name.toLowerCase())}`)} className="group border-b border-brand-secondary/20 px-5 py-5 text-left transition hover:bg-brand-primary-light last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
            <span className="font-serif text-lg text-brand-secondary">{category.name}</span>
            <span className="mt-1 block text-[11px] leading-5 text-brand-secondary/65 group-hover:text-brand-secondary/90">{category.detail}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
