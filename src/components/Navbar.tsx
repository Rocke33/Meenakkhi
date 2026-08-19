import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cartCount, isShivering } = useCart();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const location = useLocation();
  const navigate = useNavigate();

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

  const isActive = (path: string) => location.pathname === path;
  const displayName = userName || (user && (user.user_metadata?.display_name || user.email?.split('@')[0])) || null;

  return (
    <nav className="w-full bg-white border-b border-rose-100 sticky top-0 font-sans z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        
        {/* BRAND LOGO */}
        <Link
          to="/"
          className="group flex items-center gap-2 text-rose-950 font-black tracking-tight shrink-0 transition"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-900 to-rose-700 text-amber-300 flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition">
            🌸
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-serif leading-none font-bold text-rose-950">
              Menakkhi
            </span>
            <span className="text-[9px] uppercase tracking-widest text-rose-800 font-extrabold">
              Sarees
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex items-center gap-1.5">
          {[
            { name: 'Home', path: '/' },
            { name: 'Saree Collections', path: '/products' },
            { name: 'Top Sales', path: '/orders' },
            { name: 'My Profile', path: '/profile' },
          ].map((navItem) => (
            <Link
              key={navItem.path}
              to={navItem.path}
              className={`text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all duration-200 ${
                isActive(navItem.path)
                  ? 'text-rose-950 bg-rose-100/70 shadow-2xs'
                  : 'text-gray-700 hover:text-rose-900 hover:bg-rose-50/60'
              }`}
            >
              {navItem.name}
            </Link>
          ))}

          <span className="h-5 w-px bg-rose-100 mx-1" />

          {/* ADMIN CONTROL */}
          <Link
            to="/admin"
            className={`text-xs font-black uppercase tracking-wider transition-all duration-200 bg-amber-50 text-amber-800 px-3.5 py-2.5 rounded-xl border border-amber-200 hover:bg-amber-100/60 ${
              isActive('/admin') ? 'ring-2 ring-amber-500/20 bg-amber-100' : ''
            }`}
          >
            Admin ⚙️
          </Link>
        </div>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!user ? (
            <>
              <Link
                to="/login"
                className="hidden md:inline-block text-xs font-black uppercase tracking-wide text-gray-800 bg-white border border-gray-200 hover:bg-rose-50 hover:border-rose-200 px-4 py-2.5 rounded-xl transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-[11px] sm:text-xs font-black uppercase tracking-wide bg-rose-900 hover:bg-rose-800 text-white px-3.5 sm:px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={() => navigate('/profile')}
              type="button"
              className="flex items-center justify-center bg-rose-900 hover:bg-rose-800 text-white text-[11px] sm:text-xs font-black rounded-xl px-3 sm:px-4 py-2.5 max-w-[120px] sm:max-w-[160px] truncate shadow-2xs active:scale-95 transition cursor-pointer"
            >
              <span className="truncate">{displayName || user.email?.split('@')[0]}</span>
            </button>
          )}

          {/* CART BUTTON WITH INSTANT COUNT & SHIVERING EFFECT */}
          <Link
            to="/cart"
            className={`relative flex items-center justify-center p-2.5 sm:p-3 rounded-xl transition-all duration-300 border shadow-2xs ${
              isShivering
                ? 'bg-amber-500 border-amber-400 text-rose-950 scale-110 ring-4 ring-amber-300 animate-cart-shake'
                : isActive('/cart')
                ? 'bg-rose-950 border-rose-950 text-white'
                : 'bg-rose-900 border-rose-900 text-white hover:bg-rose-800 active:scale-95'
            }`}
            title="Shopping Cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.2}
              stroke="currentColor"
              className="w-4.5 h-4.5 sm:w-5 sm:h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.25 10.5a.75.75 0 100-1.5.75.75 0 000 1.5zm7.5 0a.75.75 0 100-1.5.75.75 0 000 1.5z"
              />
            </svg>

            {/* Dynamic Badge displaying item count (Always visible, shows 0 when empty) */}
            <span
              className={`absolute -top-1.5 -right-1.5 flex h-4.5 min-w-[18px] sm:h-5 sm:min-w-[20px] items-center justify-center rounded-full px-1 text-[9px] sm:text-[10px] font-black ring-2 transition-all duration-300 ${
                isShivering
                  ? 'bg-rose-950 text-amber-300 ring-white scale-125'
                  : 'bg-amber-500 text-rose-950 ring-white scale-110'
              }`}
            >
              {cartCount}
            </span>
          </Link>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            type="button"
            className="md:hidden p-2.5 rounded-xl bg-rose-950 text-white hover:bg-rose-900 transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-rose-100 bg-white px-4 py-4 absolute top-full left-0 w-full shadow-xl flex flex-col gap-1 z-50">
          {[
            { name: 'Home', path: '/' },
            { name: 'Saree Collections', path: '/products' },
            { name: 'Top Sales', path: '/orders' },
            { name: 'My Profile', path: '/profile' },
          ].map((navItem) => (
            <Link
              key={navItem.path}
              onClick={() => setIsMobileMenuOpen(false)}
              to={navItem.path}
              className={`text-sm font-bold px-4 py-3 rounded-xl transition ${
                isActive(navItem.path)
                  ? 'text-rose-950 bg-rose-100/70'
                  : 'text-gray-700 hover:text-rose-900 hover:bg-rose-50/50'
              }`}
            >
              {navItem.name}
            </Link>
          ))}

          <Link
            onClick={() => setIsMobileMenuOpen(false)}
            to="/admin"
            className={`text-sm font-extrabold text-amber-800 px-4 py-3 rounded-xl transition mt-1 ${
              isActive('/admin') ? 'bg-amber-100' : 'hover:bg-amber-50'
            }`}
          >
            Admin Control ⚙️
          </Link>
        </div>
      )}
    </nav>
  );
}