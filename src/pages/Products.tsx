import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import FeaturedLanes from '../components/FeaturedLanes';
import type { Product } from '../types/database';

export default function Products() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  const defaultCategories = [
    'All',
    'Katan',
    'Rajshahi Silk',
    'Jamdani',
    'Georgette',
    'Muslin',
    'Organza',
    'Bridal Collection',
    'Chiffon',
  ];

  useEffect(() => {
    async function fetchDynamicCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          setCategories(['All', ...data.map((item) => item.name)]);
        } else {
          setCategories(defaultCategories);
        }
      } catch (err) {
        setCategories(defaultCategories);
      }
    }
    fetchDynamicCategories();
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*');

        if (selectedCategory !== 'All') {
          query = query.ilike('category', selectedCategory);
        }
        if (searchQuery.trim() !== '') {
          query = query.ilike('title', `%${searchQuery.trim()}%`);
        }

        query = query.order('id', { ascending: false });

        const { data, error } = await query;
        if (!error && data) {
          setAllProducts(data as Product[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [searchQuery, selectedCategory]);

  const activeLanesList = selectedCategory === 'All' ? categories : [selectedCategory];

  return (
    <div className="min-h-screen flex flex-col bg-rose-50/20 font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-rose-950 tracking-tight mb-2">
            Explore Saree Collections
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mb-6">
            Browse through our authentic repository of handcrafted saree weaves.
          </p>

          <div className="w-full max-w-2xl md:mx-0">
            <SearchBar onSearch={setSearchQuery} isLoading={loading} />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 bg-white p-4 rounded-2xl border border-rose-100 shadow-xs mb-8">
          <span className="text-[11px] font-black uppercase tracking-wider text-rose-900 mr-2 hidden sm:inline">
            Weave Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] sm:text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-rose-900 text-white border-rose-900 shadow-xs'
                  : 'bg-rose-50/50 text-gray-700 border-rose-100 hover:bg-rose-100/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-full">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-rose-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Syncing Saree Grid...</p>
            </div>
          ) : (
            <FeaturedLanes
              products={allProducts}
              categories={activeLanesList}
              limitProducts={4}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}