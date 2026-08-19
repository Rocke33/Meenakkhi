import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/database';
import { getErrorMessage } from '../utils/errorHandling';

export default function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCategoryProducts() {
      if (!categoryName) return;

      try {
        setLoading(true);
        const cleanCategoryString = decodeURIComponent(categoryName);

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('category', cleanCategoryString);

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error loading category items:', getErrorMessage(err));
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    }

    fetchCategoryProducts();
  }, [categoryName]);

  const displayTitle = categoryName
    ? decodeURIComponent(categoryName).charAt(0).toUpperCase() + decodeURIComponent(categoryName).slice(1)
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-rose-50/20 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-xs font-bold text-rose-900 hover:text-rose-700 mb-2 block tracking-wide cursor-pointer"
            >
              ← Back to Main Showcase
            </button>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-rose-950 tracking-tight uppercase">
              {displayTitle} Saree Collection
            </h1>
            <p className="text-gray-500 text-xs mt-1">
              Browsing handcrafted saree inventory filtered under the {displayTitle} taxonomy channel.
            </p>
          </div>
          <div className="bg-white border border-rose-100 text-rose-900 font-black text-xs px-4 py-2.5 rounded-xl shadow-2xs self-start sm:self-center">
            🌸 {products.length} Sarees Available
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-900"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 p-8 shadow-xs">
            <p className="text-gray-500 text-sm font-medium mb-4">
              No active saree items found inside the "{displayTitle}" collection.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-rose-900 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-rose-800 transition cursor-pointer"
            >
              Return Home
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                image_url={product.image_url}
                category={product.category}
                description={product.description}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}