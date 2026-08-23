import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { FiShoppingBag, FiUser, FiSearch, FiHeart, FiMenu, FiX, FiShield, FiArrowRight } from 'react-icons/fi';

export default function Navbar() {
  const { cartCount, isShivering } = useCart();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Scroll position detector for enhanced glassmorphism header depth
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Supabase Auth listener
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      setUserName(currentUser?.user_metadata?.display_name || null);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setUser(u);
      setUserName(u?.user_metadata?.display_name || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  const displayName = useMemo(() => {
    return userName || (user && (user.user_metadata?.display_name || user.email?.split('@')[0])) || null;
  }, [userName, user]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Saree Collections', path: '/products' },
    { name: 'Top Sales', path: '/orders' },
    { name: 'My Profile', path: '/profile' },
  ];

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-stone-900/90 backdrop-blur-md border-b border-amber-500/20 shadow-lg text-stone-100 py-2.5'
            : 'bg-stone-900/95 backdrop-blur-sm border-b border-stone-800 text-stone-100 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* BRAND LOGO */}
          <Link
            to="/"
            className="group flex items-center gap-3 shrink-0 transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="relative p-1 rounded-xl bg-gradient-to-br from-amber-500/20 via-rose-900/40 to-stone-900 border border-amber-400/30 group-hover:border-amber-400/60 shadow-xs">
              <img
                src="/logo.png"
                alt="Meenakkhi Sarees Logo"
                className="h-10 sm:h-12 w-auto object-contain rounded-lg filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-serif text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-transparent">
                মীনাক্ষী
              </span>
              <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-amber-300/80 -mt-1 font-semibold">
                Meenakkhi Sarees
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 bg-stone-950/60 p-1.5 rounded-2xl border border-stone-800/80">
            {navLinks.map((navItem) => {
              const active = isActive(navItem.path);
              return (
                <Link
                  key={navItem.path}
                  to={navItem.path}
                  className={`relative text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-xl transition-all duration-200 ${
                    active
                      ? 'text-amber-300 bg-amber-500/10 font-bold shadow-xs'
                      : 'text-stone-300 hover:text-amber-200 hover:bg-stone-800/60'
                  }`}
                >
                  {navItem.name}
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            <span className="h-4 w-px bg-stone-800 mx-1" />

            {/* ADMIN CONTROL */}
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl border transition-all duration-200 ${
                isActive('/admin')
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                  : 'bg-amber-950/30 text-amber-400/90 border-amber-800/40 hover:bg-amber-900/40 hover:text-amber-300'
              }`}
            >
              <FiShield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* SEARCH TRIGGER LINK */}
            <button
              onClick={() => navigate('/products')}
              title="Search Saree Collection"
              className="hidden sm:flex items-center justify-center p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 text-stone-300 hover:text-amber-300 hover:border-amber-500/40 transition active:scale-95 cursor-pointer"
            >
              <FiSearch className="w-4.5 h-4.5" />
            </button>

            {/* WISHLIST QUICK ITEM */}
            <button
              onClick={() => navigate('/products')}
              title="Favorites & Wishlist"
              className="hidden sm:flex items-center justify-center p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 text-stone-300 hover:text-rose-400 hover:border-rose-500/40 transition active:scale-95 cursor-pointer"
            >
              <FiHeart className="w-4.5 h-4.5" />
            </button>

            {/* AUTH BUTTONS / USER PROFILE */}
            {!user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="hidden sm:inline-flex text-xs font-bold uppercase tracking-wider text-stone-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-stone-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 px-3.5 sm:px-4 py-2 rounded-xl shadow-md shadow-amber-500/20 transition active:scale-95"
                >
                  Register
                </Link>
              </div>
            ) : (
              <button
                onClick={() => navigate('/profile')}
                type="button"
                className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-bold rounded-xl px-3 py-2 border border-amber-500/30 max-w-[130px] sm:max-w-[160px] truncate shadow-2xs active:scale-95 transition cursor-pointer"
              >
                <FiUser className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span className="truncate">{displayName || user.email?.split('@')[0]}</span>
              </button>
            )}

            {/* CART TRIGGER BUTTON WITH COUNT & SHIVER EFFECT */}
            <Link
              to="/cart"
              className={`relative flex items-center justify-center p-2.5 sm:p-3 rounded-xl transition-all duration-300 border shadow-md ${
                isShivering
                  ? 'bg-amber-400 border-amber-300 text-stone-950 scale-110 ring-4 ring-amber-400/40 animate-cart-shake'
                  : isActive('/cart')
                  ? 'bg-amber-500 border-amber-400 text-stone-950 font-bold'
                  : 'bg-gradient-to-r from-rose-900 to-rose-950 border-rose-800/80 text-stone-100 hover:border-amber-400/50 hover:text-amber-200 active:scale-95'
              }`}
              title="Shopping Cart"
            >
              <FiShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5" />

              {/* Dynamic Badge displaying item count */}
              <span
                className={`absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-black ring-2 transition-all duration-300 ${
                  isShivering
                    ? 'bg-stone-950 text-amber-400 ring-amber-300 scale-125'
                    : 'bg-amber-400 text-stone-950 ring-stone-900 scale-110'
                }`}
              >
                {cartCount}
              </span>
            </Link>

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="md:hidden p-2.5 rounded-xl bg-stone-800 text-stone-200 hover:text-amber-300 border border-stone-700 transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE SLIDE-OUT DRAWER WITH FRAMER MOTION */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-stone-900 border-l border-amber-500/20 shadow-2xl z-50 md:hidden flex flex-col justify-between p-6 overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Meenakkhi" className="h-10 w-auto rounded-lg" />
                    <div>
                      <h3 className="font-serif text-amber-200 font-bold text-base">মীনাক্ষী</h3>
                      <p className="text-[9px] uppercase tracking-widest text-amber-400/80 font-semibold">Luxury Sarees</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Links */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 px-2">Navigation</span>
                  {navLinks.map((navItem) => {
                    const active = isActive(navItem.path);
                    return (
                      <Link
                        key={navItem.path}
                        to={navItem.path}
                        className={`flex items-center justify-between min-h-[48px] px-4 rounded-xl text-sm font-bold transition-all ${
                          active
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'text-stone-300 hover:bg-stone-800 hover:text-amber-200'
                        }`}
                      >
                        <span>{navItem.name}</span>
                        <FiArrowRight className="w-4 h-4 text-stone-500" />
                      </Link>
                    );
                  })}

                  <Link
                    to="/admin"
                    className={`flex items-center justify-between min-h-[48px] px-4 rounded-xl text-sm font-extrabold transition-all border mt-2 ${
                      isActive('/admin')
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-amber-950/40 text-amber-400 border-amber-800/40 hover:bg-amber-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FiShield className="w-4 h-4" />
                      <span>Admin Portal</span>
                    </div>
                    <FiArrowRight className="w-4 h-4 text-amber-500" />
                  </Link>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-stone-800 pt-4 flex flex-col gap-3">
                {!user ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      className="flex items-center justify-center min-h-[44px] rounded-xl border border-stone-700 text-stone-300 font-bold text-xs uppercase"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center min-h-[44px] rounded-xl bg-amber-500 text-stone-950 font-bold text-xs uppercase"
                    >
                      Register
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-stone-100 truncate">{displayName}</p>
                        <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}