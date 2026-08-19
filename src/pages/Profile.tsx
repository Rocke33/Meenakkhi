import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OrderSkeleton from '../components/OrderSkeleton';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { fetchWithRetry } from '../utils/networkRetry';
import { formatBDT } from '../types/database';
import type { UserOrder } from '../types/database';
import { getErrorMessage } from '../utils/errorHandling';

export default function Profile() {
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUserDataAndOrders = async () => {
      if (!isOnline) {
        setLoading(false);
        return;
      }

      try {
        if (!isMounted) return;
        setLoading(true);
        setNetworkError(null);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          if (isMounted) setUserEmail(user.email ?? 'Valued Customer');

          const data = await fetchWithRetry(async () => {
            const { data: res, error } = await supabase
              .from('orders')
              .select(`
                id,
                total_amount,
                status,
                shipping_address,
                created_at,
                payment_details,
                shipping_destination,
                contact_number,
                order_items!inner (
                  quantity,
                  price_at_purchase,
                  products!inner ( id, title, image_url )
                )
              `)
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });

            if (error) throw error;
            return res;
          });

          if (isMounted && data) {
            setOrders(data as unknown as UserOrder[]);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const cleanMessage = getErrorMessage(err);
          setNetworkError('Unable to fetch order history: ' + cleanMessage);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserDataAndOrders();

    return () => {
      isMounted = false;
    };
  }, [isOnline]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err: unknown) {
      console.error('Signout error:', getErrorMessage(err));
    }
  };

  const triggerSystemPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-rose-50/20 font-sans relative">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          html, body {
            height: 99vh !important;
            overflow: hidden !important;
            background: #fff !important;
            font-size: 14px !important;
          }
          #drive-invoice-viewport, #drive-invoice-viewport * {
            visibility: visible !important;
          }
          #drive-invoice-viewport {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print-action {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col min-h-screen w-full print:hidden">
        <Navbar />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
          {!isOnline && (
            <div className="mb-6 p-3 bg-amber-500 text-white rounded-xl text-xs font-black tracking-wide uppercase text-center animate-pulse">
              ⚠️ Operating in Offline Mode.
            </div>
          )}

          {networkError && isOnline && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold text-center">
              {networkError}
            </div>
          )}

          {/* Account Profile Card */}
          <div className="bg-white border border-rose-100 p-6 rounded-3xl shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-950 flex items-center justify-center font-black text-xl">
                🌸
              </div>
              <div>
                <h2 className="text-base font-black text-rose-950 leading-tight">Customer Account</h2>
                <p className="text-xs text-gray-500 mt-0.5">{userEmail || 'Not Signed In'}</p>
              </div>
            </div>

            {userEmail ? (
              <button
                disabled={!isOnline}
                onClick={handleLogout}
                className={`text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition cursor-pointer self-start sm:self-center ${
                  isOnline
                    ? 'text-red-700 bg-red-50 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="text-xs font-black uppercase tracking-wider text-rose-900 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl transition cursor-pointer self-start sm:self-center"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Order History */}
          <h3 className="text-sm font-black text-rose-950 tracking-wider uppercase mb-4">
            Your Saree Order Dispatches ({orders.length})
          </h3>

          {loading ? (
            <OrderSkeleton />
          ) : !userEmail ? (
            <div className="text-center py-16 bg-white border border-rose-100 rounded-3xl text-sm text-gray-400">
              Please log in to view your saree order history.
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white border border-rose-100 rounded-3xl text-sm text-gray-400">
              You haven't placed any saree orders yet.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-rose-100 rounded-2xl shadow-2xs overflow-hidden">
                  <div className="bg-rose-50/40 border-b border-rose-100 p-4 flex flex-wrap justify-between items-center gap-2 text-xs">
                    <div className="flex flex-wrap gap-4 text-gray-600 font-medium">
                      <div>
                        <span>ORDER DATE: </span>
                        <span className="text-rose-950 font-bold">{new Date(order.created_at).toLocaleDateString('en-BD')}</span>
                      </div>
                      <div>
                        <span>TOTAL: </span>
                        <span className="text-rose-950 font-bold font-mono">{formatBDT(order.total_amount)}</span>
                      </div>
                      <div>
                        <span>ORDER REF: </span>
                        <span className="text-rose-950 font-bold font-mono">#{order.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveInvoiceOrder(order);
                          document.body.style.overflow = 'hidden';
                        }}
                        className="px-3 py-1.5 text-[11px] font-black rounded-xl bg-white text-rose-900 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                      >
                        📄 View Voucher
                      </button>
                      <span
                        className={`px-3 py-1 font-black text-[10px] uppercase rounded-full border ${
                          order.status === 'Shipped' || order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {order.status === 'Shipped' || order.status === 'Delivered' ? '📦 Delivered' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-rose-50">
                    {order.order_items.map((item, index) => (
                      <div key={index} className="p-4 flex items-center justify-between gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          {item.products?.image_url ? (
                            <img
                              src={item.products.image_url}
                              alt={item.products.title}
                              className="w-12 h-12 rounded-xl object-contain bg-rose-50/40 border border-rose-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">📦</div>
                          )}
                          <div>
                            <h4 className="font-bold text-rose-950 leading-tight">{item.products?.title || 'Catalog Saree'}</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-black text-rose-950 font-mono">
                          {formatBDT(item.price_at_purchase * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50/50 border-t border-gray-100 px-4 py-2.5 text-[11px] text-gray-600 font-medium">
                    📍 Delivery Address: <span className="text-gray-900 font-bold">{order.shipping_address}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* PRINTABLE VOUCHER MODAL */}
      {activeInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-start items-center overflow-y-auto p-2 sm:p-6 select-none animate-in fade-in duration-200">
          <div className="no-print-action max-w-4xl w-[95vw] bg-rose-950 text-white rounded-t-2xl px-4 py-3 border-b border-rose-800 flex justify-between items-center shadow-xl">
            <div className="flex items-center gap-2.5 truncate">
              <span className="text-xl shrink-0">📄</span>
              <div className="truncate text-left">
                <p className="text-xs sm:text-sm font-bold truncate">Menakkhi_Voucher_#000{activeInvoiceOrder.id}.pdf</p>
                <p className="text-[10px] text-rose-200/70 font-semibold">Official Customer Purchase Receipt</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={triggerSystemPrint}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
              >
                📥 Print Voucher
              </button>
              <button
                onClick={() => {
                  setActiveInvoiceOrder(null);
                  document.body.style.overflow = 'unset';
                }}
                className="p-1.5 bg-rose-900 hover:bg-rose-800 rounded-xl transition cursor-pointer text-sm text-rose-200"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <div
            id="drive-invoice-viewport"
            className="max-w-4xl w-[95vw] bg-white text-black p-4 sm:p-12 shadow-sm rounded-b-2xl min-h-[70vh] flex flex-col justify-between font-sans leading-relaxed text-sm tracking-normal border border-rose-100 border-t-0"
          >
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-4 border-rose-950 pb-4 mb-6 gap-4">
                <div>
                  <h1 className="text-2xl sm:text-4xl font-serif font-bold uppercase tracking-tight text-rose-950">MENAKKHI SAREES</h1>
                  <p className="text-xs font-bold text-rose-800 mt-0.5">Traditional & Modern Heritage Saree Boutique</p>
                </div>
                <div className="text-left sm:text-right">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">PURCHASE VOUCHER</h2>
                  <p className="text-sm sm:text-base font-black text-rose-900 mt-0.5">Sequence: #000{activeInvoiceOrder.id}</p>
                  <p className="text-xs text-gray-400 font-bold mt-1">
                    Date: {new Date(activeInvoiceOrder.created_at).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-rose-50/40 border border-rose-100 rounded-2xl p-4">
                <div>
                  <h3 className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-1">Customer Account</h3>
                  <p className="text-sm font-black text-gray-900">Verified Member</p>
                  <p className="text-xs text-gray-600 mt-0.5">✉️ {userEmail || 'N/A'}</p>
                  {activeInvoiceOrder.contact_number && (
                    <p className="text-xs font-mono font-bold text-rose-900 mt-1">📞 {activeInvoiceOrder.contact_number}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-1">Shipping Location</h3>
                  <p className="text-xs text-gray-800 font-medium leading-relaxed">
                    {activeInvoiceOrder.shipping_address}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-2.5">Saree Line Items</h3>
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b-2 border-rose-950 font-black text-rose-950 bg-rose-50">
                      <th className="py-2.5 px-3 w-[50%]">Saree Title</th>
                      <th className="py-2.5 px-3 text-center w-[15%]">Qty</th>
                      <th className="py-2.5 px-3 text-right w-[35%]">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {activeInvoiceOrder.order_items.map((item: any, index: number) => (
                      <tr key={index} className="font-semibold text-gray-800">
                        <td className="py-3 px-3 font-bold text-rose-950">{item.products?.title || 'Saree Item'}</td>
                        <td className="py-3 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-rose-950">
                          {formatBDT(item.quantity * item.price_at_purchase)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t-2 border-rose-950">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h3 className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-1">Payment Method</h3>
                  <span className="text-xs font-black bg-rose-100 text-rose-950 border border-rose-200 px-3 py-1 rounded-xl uppercase">
                    {activeInvoiceOrder.payment_details?.method === 'COD'
                      ? '💵 Cash On Delivery'
                      : activeInvoiceOrder.payment_details?.method === 'bKash'
                      ? '🌸 bKash Personal'
                      : '🔥 Nagad Personal'}
                  </span>
                  {activeInvoiceOrder.payment_details?.trx_id && activeInvoiceOrder.payment_details.method !== 'COD' && (
                    <p className="text-xs font-mono font-bold text-gray-600 mt-2">
                      TrxID: {activeInvoiceOrder.payment_details.trx_id}
                    </p>
                  )}
                </div>

                <div className="text-right w-full sm:w-auto min-w-[200px] space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatBDT(activeInvoiceOrder.total_amount)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-gray-200">
                    <span className="text-xs font-black text-rose-950 uppercase tracking-wider">Grand Total:</span>
                    <span className="text-xl font-black text-rose-950 font-mono">
                      {formatBDT(activeInvoiceOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center text-[9px] text-gray-400 font-bold border-t border-rose-50 pt-3 uppercase tracking-wider">
                Menakkhi Sarees Official Customer Voucher • Thank you for your purchase
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}