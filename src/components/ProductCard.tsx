import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCartActions } from '../hooks/useCartActions';
import { formatBDT } from '../types/database';

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  image_url: string;
  category: string;
  description: string;
}

const ProductCard = memo(function ProductCard({ id, title, price, image_url, category }: ProductCardProps) {
  const navigate = useNavigate();
  const [averageRating, setAverageRating] = useState<number>(5.0);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  const { isAddedSuccess, isMutating, handleDirectAddToCart } = useCartActions(id);

  useEffect(() => {
    let isMounted = true;

    const fetchRatingMetrics = async () => {
      try {
        const { data, error } = await supabase
          .from('product_comments')
          .select('rating')
          .eq('product_id', id);

        if (error) throw error;

        if (isMounted && data && data.length > 0) {
          const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
          setAverageRating(parseFloat((sum / data.length).toFixed(1)));
          setTotalReviews(data.length);
        }
      } catch (err) {
        console.error('Error fetching saree rating metrics:', err);
      }
    };

    fetchRatingMetrics();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCardRedirection = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div
      onClick={handleCardRedirection}
      className="bg-white border border-rose-100 rounded-2xl p-2 sm:p-4 flex flex-col justify-between shadow-2xs hover:shadow-lg hover:-translate-y-1 transition duration-200 group font-sans cursor-pointer h-full min-w-0"
    >
      <div>
        {/* Image Frame */}
        <div className="w-full h-32 xs:h-40 sm:h-52 bg-rose-50/40 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2 sm:mb-3 relative shrink-0">
          <img
            src={image_url}
            alt={title}
            loading="lazy"
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
          />
          <span className="absolute top-2 left-2 bg-rose-950/80 backdrop-blur-xs text-[8px] sm:text-[9px] font-black uppercase text-amber-200 px-2 py-0.5 rounded-md tracking-wider">
            {category}
          </span>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-rose-950 line-clamp-2 min-h-[32px] sm:min-h-[40px] leading-tight mb-1 sm:mb-2 group-hover:text-rose-700 transition">
            {title}
          </h3>

          <div className="flex items-center gap-0.5 sm:gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-[9px] sm:text-xs select-none ${
                  i < Math.round(averageRating) ? 'text-amber-400' : 'text-gray-200'
                }`}
              >
                ★
              </span>
            ))}
            <span className="text-[8px] sm:text-[10px] text-gray-400 font-semibold ml-0.5">
              ({averageRating}) {totalReviews > 0 && `· ${totalReviews}`}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-rose-50 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-baseline justify-between">
          <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-bold leading-none">
            Price
          </span>
          <span className="text-xs sm:text-base font-black text-rose-950 font-mono">
            {formatBDT(price)}
          </span>
        </div>

        <div className="w-full relative pt-2 flex gap-1.5 items-center">
          {isAddedSuccess && (
            <span className="absolute top-[-10px] left-0 right-0 text-center text-[9px] font-black text-emerald-600 animate-pulse z-20 bg-white/90 py-0.5">
              Added to Cart!
            </span>
          )}

          <button
            disabled={isAddedSuccess || isMutating}
            onClick={handleDirectAddToCart}
            className={`flex-1 text-center font-extrabold rounded-xl shadow-2xs transition duration-200 cursor-pointer z-10 whitespace-nowrap truncate text-[10px] sm:text-xs px-2.5 py-2 ${
              isAddedSuccess
                ? 'bg-emerald-600 text-white font-black cursor-default'
                : 'bg-rose-900 hover:bg-rose-800 text-white active:scale-95'
            } ${isMutating && !isAddedSuccess ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isAddedSuccess ? '✓ Added' : isMutating ? 'Updating...' : 'Add to Cart'}
          </button>

          <button
            onClick={handleCardRedirection}
            className="bg-gray-100 hover:bg-gray-200 text-rose-950 font-extrabold rounded-xl px-2.5 py-2 text-[10px] sm:text-xs transition active:scale-95 cursor-pointer z-10"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;