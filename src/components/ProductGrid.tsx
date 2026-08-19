import ProductCard from './ProductCard';
import type { Product } from '../types/database';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-rose-800 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Syncing Saree Showcase...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-rose-200 bg-white rounded-3xl mx-2">
        <p className="text-gray-400 font-semibold text-sm">No saree inventory items match your selection.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 min-[2000px]:grid-cols-5 gap-3 sm:gap-6 w-full px-1">
      {products.map((item) => (
        <div key={item.id} className="min-w-0 overflow-hidden">
          <ProductCard
            id={item.id}
            title={item.title}
            price={item.price}
            image_url={item.image_url}
            category={item.category}
            description={item.description}
          />
        </div>
      ))}
    </div>
  );
}