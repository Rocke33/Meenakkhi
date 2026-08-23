import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCartActions } from '../hooks/useCartActions';
import { formatBDT } from '../types/database';
import LuxuryImage from './LuxuryImage';
import { FiCheck, FiShoppingBag } from 'react-icons/fi';

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  image_url: string;
  category: string;
  description?: string;
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
      className="bg-white border border-stone-200/80 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-amber-400/40 transition-all duration-300 group font-sans cursor-pointer h-full min-w-0"
    >
      <div>
        {/* Luxury Image Container */}
        <div className="w-full h-44 sm:h-56 bg-stone-50 rounded-xl overflow-hidden mb-3 relative shrink-0">
          <LuxuryImage
            src={image_url}
            alt={title}
            aspectRatio="aspect-auto"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Category Pill Tag */}
          <span className="absolute top-2.5 left-2.5 bg-stone-950/85 backdrop-blur-md text-[9px] font-sans font-bold uppercase tracking-wider text-amber-300 px-2.5 py-1 rounded-md shadow-xs border border-amber-500/20">
            {category}
          </span>
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col min-w-0">
          <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 line-clamp-2 min-h-[40px] leading-tight mb-1.5 group-hover:text-amber-700 transition-colors">
            {title}
          </h3>

          {/* Star Rating Display */}
          <div className="flex items-center gap-1 mb-2.5">
            <div className="flex text-amber-400 text-xs">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`select-none ${
                    i < Math.round(averageRating) ? 'text-amber-400' : 'text-stone-200'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-[10px] font-sans font-semibold text-stone-500">
              ({averageRating}) {totalReviews > 0 && `· ${totalReviews}`}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="pt-3 border-t border-stone-100 flex flex-col gap-2.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
            Price
          </span>
          <span className="text-base sm:text-lg font-serif font-bold text-stone-950">
            {formatBDT(price)}
          </span>
        </div>

        <div className="w-full relative pt-1 flex gap-2 items-center">
          {isAddedSuccess && (
            <span className="absolute -top-3 left-0 right-0 text-center text-[10px] font-black text-emerald-600 animate-pulse z-20 bg-emerald-50 py-0.5 rounded">
              Added to Cart!
            </span>
          )}

          <button
            disabled={isAddedSuccess || isMutating}
            onClick={handleDirectAddToCart}
            className={`flex-1 flex items-center justify-center gap-1.5 font-bold rounded-xl shadow-xs transition-all duration-200 cursor-pointer z-10 whitespace-nowrap truncate text-xs px-3 py-2.5 ${
              isAddedSuccess
                ? 'bg-emerald-600 text-white font-black cursor-default'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-300 active:scale-95 hover:border-amber-400/40'
            } ${isMutating && !isAddedSuccess ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isAddedSuccess ? (
              <>
                <FiCheck className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : isMutating ? (
              <span>Updating...</span>
            ) : (
              <>
                <FiShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            onClick={handleCardRedirection}
            className="bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold rounded-xl px-3 py-2.5 text-xs transition active:scale-95 cursor-pointer z-10"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;