import { useState, useEffect, useCallback, useMemo } from 'react';
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

  const defaultSareeCategories = useMemo(() => [
    'All',
    'Katan',
    'Rajshahi Silk',
    'Jamdani',
    'Georgette',
    'Muslin',
    'Organza',
    'Bridal Collection',
    'Chiffon',
  ], []);

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
  }, [defaultSareeCategories]);

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
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
  }, []);

  const isSearching = searchQuery.trim() !== '';
  const isFilteringCategory = selectedCategory !== 'All';
  const isSearchingOrFiltering = isSearching || isFilteringCategory;

  const { paginatedProducts, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = allProducts.slice(startIndex, startIndex + itemsPerPage);
    const pages = Math.ceil(allProducts.length / itemsPerPage);
    return { paginatedProducts: paginated, totalPages: pages };
  }, [allProducts, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-secondary font-sans text-brand-ink">
      
      {/* Sticky Glass Navbar */}
      <Navbar />

      {/* Search Header Bar */}
      <div className="bg-stone-900 border-b border-stone-800 py-3 shadow-md">
        <div className="max-w-6xl w-full mx-auto px-4">
          <SearchBar onSearch={handleSearchChange} isLoading={loading} />
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 box-border">
        {isSearching && (
          <section id="search-view" className="my-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
                Search Results for "{searchQuery.trim()}"
              </h2>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                {allProducts.length} Sarees Found
              </span>
            </div>

            <ProductGrid products={paginatedProducts} loading={loading} />
          </section>
        )}

        {!isSearching && <Hero />}

        {/* Category Filter Pills */}
        <section className="my-8">
          <div className="flex flex-wrap justify-center gap-2 pb-4 border-b border-stone-200">
            {categoriesList.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl border uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-stone-900 text-amber-300 border-stone-900 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-amber-400 hover:bg-stone-100/60'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </section>

        {!isSearching && (
          isFilteringCategory ? (
            <section id="category-view" className="my-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-stone-950 tracking-tight uppercase">
                  {selectedCategory} Saree Collection
                </h2>
              </div>
              <ProductGrid products={paginatedProducts} loading={loading} />
            </section>
          ) : (
            <section className="my-6">
              {loading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-wider font-serif">
                    Loading Heritage Collection...
                  </p>
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
          <div className="mt-10 mb-6 flex items-center justify-center gap-2 bg-white border border-stone-200 p-4 rounded-2xl shadow-xs">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-bold bg-stone-100 text-stone-900 hover:bg-stone-200 disabled:opacity-40 cursor-pointer"
            >
              ← Prev
            </button>
            <span className="text-xs font-bold px-4 text-stone-900">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-bold bg-stone-100 text-stone-900 hover:bg-stone-200 disabled:opacity-40 cursor-pointer"
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
