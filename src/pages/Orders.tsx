import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { formatBDT } from '../types/database';
import { getErrorMessage } from '../utils/errorHandling';

interface TopProductMetrics {
  id: number;
  product_name: string;
  image_url: string;
  price: number;
  unitsSold: number;
}

export default function Orders() {
  const navigate = useNavigate();
  const [topProducts, setTopProducts] = useState<TopProductMetrics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const { data, error } = await supabase.rpc('get_public_top_sales');

        if (error) {
          console.error('Database Error:', error);
          setErrorMessage(`Database Error: ${error.message}`);
          return;
        }

        if (data) {
          const formattedProducts: TopProductMetrics[] = data.map((prod: any) => ({
            id: prod.id,
            product_name: prod.title,
            image_url: prod.image_url,
            price: prod.price,
            unitsSold: Number(prod.sales_count) || 0,
          }));

          setTopProducts(formattedProducts);
        }
      } catch (err: unknown) {
        setErrorMessage(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchTopSellingProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-rose-50/20 font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-rose-950 tracking-tight mb-1">
            Top Sale Sarees
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Explore the top trending and most loved saree weaves calculated across live purchase metrics.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold">
            ⚠️ {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3 bg-white border border-rose-100 rounded-3xl shadow-2xs">
            <div className="w-8 h-8 border-4 border-rose-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Compiling trending saree catalog...</p>
          </div>
        ) : (
          <div>
            {topProducts.length === 0 ? (
              <div className="p-12 text-center bg-white border border-rose-100 text-gray-500 text-sm font-medium rounded-2xl">
                📉 No saree purchase metrics logged yet. Check back later once orders are completed!
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-4 md:gap-6">
                {topProducts.map((prod, idx) => (
                  <div
                    key={prod.id}
                    onClick={() => navigate(`/product/${prod.id}`)}
                    className="bg-white border border-stone-200/90 rounded-xl sm:rounded-2xl p-2 sm:p-3.5 flex flex-col relative shadow-2xs hover:shadow-lg transition duration-200 cursor-pointer group"
                  >
                    {/* Rank Badge */}
                    <span className="absolute top-2 left-2 z-10 bg-stone-950 text-amber-200 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md font-mono">
                      #{idx + 1}
                    </span>

                    {/* Sales Badge */}
                    <span className="absolute top-2 right-2 z-10 bg-rose-100 text-rose-900 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md font-mono">
                      {prod.unitsSold} Sold
                    </span>

                    {/* Image */}
                    <div className="h-28 sm:h-44 w-full rounded-lg sm:rounded-xl bg-stone-50 flex items-center justify-center p-1 sm:p-2 mb-2 sm:mb-3 overflow-hidden mt-4">
                      <img
                        src={prod.image_url}
                        alt={prod.product_name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <h4
                        className="text-[11px] sm:text-xs font-bold text-stone-950 line-clamp-2 leading-tight tracking-tight mb-1"
                        title={prod.product_name}
                      >
                        {prod.product_name}
                      </h4>
                      <div className="mt-auto pt-1.5 flex justify-between items-center border-t border-stone-100">
                        <span className="text-xs sm:text-sm font-black text-stone-950 font-mono">
                          {formatBDT(prod.price)}
                        </span>
                        <span className="text-[9px] text-amber-800 font-bold hidden sm:inline opacity-0 group-hover:opacity-100 transition">
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}