import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckoutForm from '../components/CheckoutForm';
import { supabase } from '../supabaseClient';
import { formatBDT } from '../types/database';
import { getErrorMessage } from '../utils/errorHandling';

interface CartItemRecord {
  id: number;
  quantity: number;
  products: {
    id: number;
    title: string;
    price: number;
    image_url: string;
  };
}

export default function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uiError, setUiError] = useState<string | null>(null);
  const [uiSuccess, setUiSuccess] = useState<string | null>(null);

  // State controlling modal visibility
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);

  const fetchUserCart = async () => {
    setLoading(true);
    setUiError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('cart_items')
          .select('id, quantity, products(id, title, price, image_url)')
          .eq('user_id', user.id);

        if (error) throw error;
        if (data) setCartItems(data as unknown as CartItemRecord[]);
      }
    } catch (err: unknown) {
      setUiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCart();
  }, []);

  const handleUpdateQuantity = async (itemId: number, newQty: number) => {
    if (newQty <= 0) {
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
      if (!error) setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      const { error } = await supabase.from('cart_items').update({ quantity: newQty }).eq('id', itemId);
      if (!error) {
        setCartItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
        );
      }
    }
  };

  const handleRemoveItem = async (id: number) => {
    try {
      const { error } = await supabase.from('cart_items').delete().eq('id', id);
      if (error) throw error;
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      setUiError('Could not remove item. Please try again: ' + getErrorMessage(err));
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.products.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 150 : 0; // ৳150 delivery charge
  const grandTotal = subtotal + shipping;

  const handleOrderSuccess = () => {
    setCartItems([]);
    setIsFormVisible(false);
    setUiSuccess('🎉 Order placed successfully! Thank you for shopping with Menakkhi Sarees.');

    setTimeout(() => {
      navigate('/profile');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-rose-50/20 font-sans relative">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-black text-rose-950 tracking-tight mb-8">
          Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'Saree' : 'Sarees'})
        </h1>

        {uiError && !isFormVisible && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold">
            ❌ {uiError}
          </div>
        )}

        {uiSuccess && (
          <div className="mb-6 p-6 bg-emerald-50 border border-emerald-200 text-center rounded-2xl shadow-xs">
            <span className="text-3xl block mb-2">🎉</span>
            <h3 className="text-base font-black text-emerald-900 mb-1">{uiSuccess}</h3>
            <p className="text-xs text-emerald-700 font-medium">Redirecting to your orders dashboard...</p>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center border border-dashed border-rose-200 bg-white rounded-3xl">
            <div className="w-8 h-8 border-4 border-rose-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 font-medium text-xs">Loading your cart items...</p>
          </div>
        ) : cartItems.length === 0 && !uiSuccess ? (
          <div className="py-16 text-center border border-dashed border-rose-200 bg-white rounded-3xl p-6">
            <span className="text-5xl block mb-3">🛍️</span>
            <p className="text-gray-500 font-medium text-sm mb-4">Your saree shopping cart is currently empty.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-rose-900 hover:bg-rose-800 text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition cursor-pointer"
            >
              Explore Saree Collections
            </button>
          </div>
        ) : (
          cartItems.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-rose-100 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Image & Description */}
                    <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
                      <div className="h-20 w-20 rounded-xl bg-rose-50/50 flex-shrink-0 overflow-hidden flex items-center justify-center border border-rose-100 p-1">
                        <img
                          src={item.products.image_url}
                          alt={item.products.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-gray-900 truncate tracking-tight">
                          {item.products.title}
                        </h4>
                        <p className="text-xs font-semibold text-rose-800 mt-0.5 font-mono">
                          {formatBDT(item.products.price)} each
                        </p>
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-rose-50">
                      
                      {/* Quantity Control Stepper */}
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs h-9">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-full flex items-center justify-center text-base bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border-r border-gray-200 transition font-black cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-black text-gray-900 min-w-[32px] text-center font-mono select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-full flex items-center justify-center text-base bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-l border-gray-200 transition font-black cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>

                      {/* Row Total */}
                      <div className="text-right sm:min-w-[90px]">
                        <span className="text-sm sm:text-base font-black text-rose-950 font-mono tracking-tight">
                          {formatBDT(item.products.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Remove Saree"
                      >
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Summary Panel */}
              <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-black text-rose-950 tracking-tight mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs sm:text-sm border-b border-rose-100 pb-4 mb-5">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900 font-mono">{formatBDT(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charge (All BD)</span>
                    <span className="font-bold text-gray-900 font-mono">{formatBDT(shipping)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                    <span className="text-sm font-black text-rose-950">Total Payable</span>
                    <span className="text-lg sm:text-xl font-black text-rose-700 font-mono">
                      {formatBDT(grandTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFormVisible(true)}
                  className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider bg-rose-900 text-white py-3.5 px-4 rounded-2xl shadow-md hover:bg-rose-800 transition cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* CENTRIC OVERLAY MODAL */}
      {isFormVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="absolute inset-0 cursor-default" onClick={() => setIsFormVisible(false)}></div>
          <div className="relative z-10 w-full max-w-xl my-8">
            <CheckoutForm
              cartItems={cartItems}
              subtotal={subtotal}
              shipping={shipping}
              grandTotal={grandTotal}
              onClose={() => setIsFormVisible(false)}
              onOrderSuccess={handleOrderSuccess}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}