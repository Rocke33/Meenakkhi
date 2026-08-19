import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';
import FeaturedLanes from '../components/FeaturedLanes';
import Subscribe from '../components/Subscribe';
import Footer from '../components/Footer';
import type { Product } from '../types/database';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categoriesList, setCategoriesList] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const defaultSareeCategories = [
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
          setCategoriesList(['All', ...data.map((item) => item.name)]);
        } else {
          setCategoriesList(defaultSareeCategories);
        }
      } catch (err) {
        setCategoriesList(defaultSareeCategories);
      }
    }
    fetchDynamicCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [searchQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let queryBuilder = supabase.from('products').select('*');

        if (selectedCategory !== 'All') {
          queryBuilder = queryBuilder.ilike('category', selectedCategory);
        }

        const cleanedSearchQuery = searchQuery.trim();
        if (cleanedSearchQuery !== '') {
          queryBuilder = queryBuilder.ilike('title', `%${cleanedSearchQuery}%`);
        }

        queryBuilder = queryBuilder.order('id', { ascending: false });

        const { data, error } = await queryBuilder;
        if (!error && data) {
          setAllProducts(data as Product[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const isSearching = searchQuery.trim() !== '';
  const isFilteringCategory = selectedCategory !== 'All';
  const isSearchingOrFiltering = isSearching || isFilteringCategory;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = allProducts.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);

  return (
    <div className="min-h-screen flex flex-col bg-rose-50/20 font-sans">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-rose-100">
        <Navbar />
        <div className="max-w-6xl w-full mx-auto px-4 pb-2 pt-1">
          <SearchBar onSearch={setSearchQuery} isLoading={loading} />
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 box-border">
        {isSearching && (
          <section id="search-view" className="my-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-extrabold text-rose-950 tracking-tight">
                Results for "{searchQuery.trim()}"
              </h2>
              <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
                {allProducts.length} Sarees Found
              </span>
            </div>

            <ProductGrid products={paginatedProducts} loading={loading} />
          </section>
        )}

        {!isSearching && <Hero />}

        {/* Category Pills Navigation */}
        <section className="my-8">
          <div className="flex flex-wrap justify-center gap-2 pb-4 border-b border-rose-100">
            {categoriesList.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSearchQuery('');
                }}
                className={`px-4 py-2 text-xs font-black rounded-xl border uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-rose-900 text-white border-rose-900 shadow-xs'
                    : 'bg-white text-gray-700 border-rose-100 hover:border-rose-300 hover:bg-rose-50/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {!isSearching && (
          isFilteringCategory ? (
            <section id="category-view" className="my-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-rose-950 tracking-tight uppercase">
                  {selectedCategory} Saree Collection
                </h2>
              </div>
              <ProductGrid products={paginatedProducts} loading={loading} />
            </section>
          ) : (
            <section className="my-6">
              {loading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-rose-800 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Loading Showcase...</p>
                </div>
              ) : (
                <FeaturedLanes
                  products={allProducts}
                  categories={categoriesList}
                  limitProducts={4}
                />
              )}
            </section>
          )
        )}

        {isSearchingOrFiltering && totalPages > 1 && !loading && (
          <div className="mt-10 mb-6 flex items-center justify-center gap-2 bg-white border border-rose-100 p-4 rounded-2xl shadow-xs">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-rose-50 text-rose-950 hover:bg-rose-100 disabled:opacity-40 cursor-pointer"
            >
              ← Prev
            </button>
            <span className="text-xs font-black px-4 text-rose-950">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-rose-50 text-rose-950 hover:bg-rose-100 disabled:opacity-40 cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}

        <Subscribe />
      </main>

      <Footer />
    </div>
  );
}