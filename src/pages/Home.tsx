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

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 py-4 box-border sm:px-6 sm:py-6">
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
        <section className="my-6 sm:my-8" aria-label="Saree categories">
          <div className="flex flex-col gap-3 border-y border-brand-line/70 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-2">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[.22em] text-brand-primary-dark sm:mr-2">Shop by weave</p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center">
              {categoriesList.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`min-h-11 rounded-sm border px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[.12em] transition-all duration-200 cursor-pointer sm:px-4 sm:text-center ${
                      active
                        ? 'border-brand-primary-dark bg-brand-primary-dark text-brand-secondary shadow-[3px_3px_0_var(--color-brand-accent)]'
                        : 'border-brand-line bg-brand-secondary text-brand-primary-dark hover:-translate-y-0.5 hover:border-brand-accent hover:text-brand-accent'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
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
