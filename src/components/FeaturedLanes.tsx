import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import type { Product } from '../types/database';

interface FeaturedLanesProps {
  products: Product[];
  categories: string[];
  limitProducts: number;
}

export default function FeaturedLanes({ products, categories, limitProducts }: FeaturedLanesProps) {
  const activeCategories = categories.filter((cat) => cat !== 'All');

  const lanesToRender = activeCategories
    .map((catName) => {
      const matchingItems = products.filter(
        (p) => p.category && p.category.toLowerCase() === catName.toLowerCase()
      );

      return {
        categoryName: catName,
        products: matchingItems.slice(0, Math.max(4, limitProducts)),
      };
    })
    .filter((lane) => lane.products.length > 0);

  if (lanesToRender.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-rose-200 bg-white rounded-3xl mx-2">
        <p className="text-gray-400 font-bold text-xs tracking-wider uppercase">
          No saree collections available in this view.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 w-full">
      {lanesToRender.map((lane) => (
        <div key={lane.categoryName} className="space-y-4">
          
          {/* HEADER BLOCK */}
          <div className="flex items-center justify-between border-b border-rose-100 pb-2.5 gap-2 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-base sm:text-xl font-serif font-bold text-rose-950 tracking-tight uppercase truncate">
                {lane.categoryName} Collection
              </h3>
              <span className="text-[9px] sm:text-[10px] font-black bg-rose-100 text-rose-900 px-2 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap shrink-0">
                Signature Selection
              </span>
            </div>

            <Link
              to={`/category/${encodeURIComponent(lane.categoryName.toLowerCase())}`}
              className="text-[10px] sm:text-xs font-black text-white bg-rose-900 hover:bg-rose-800 px-3 py-1.5 rounded-xl shadow-2xs transition duration-150 active:scale-95 flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer group"
            >
              <span>View All</span>
              <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          {/* RESPONSIVE ROW GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 min-[2000px]:grid-cols-5 gap-3 sm:gap-6 w-full">
            {lane.products.map((item, index) => (
              <div
                key={item.id}
                className={`min-w-0 overflow-hidden ${
                  index === 3 ? 'hidden lg:block' : index === 4 ? 'hidden min-[2000px]:block' : 'block'
                }`}
              >
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

        </div>
      ))}
    </div>
  );
}