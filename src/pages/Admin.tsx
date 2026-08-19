import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { formatBDT } from '../types/database';
import type { Product } from '../types/database';
import { getErrorMessage } from '../utils/errorHandling';

interface OrderItem {
  quantity: number;
  price_at_purchase: number;
  products: {
    id: number;
    title: string;
  } | null;
}

interface AdminOrder {
  id: number;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
  contact_number: string | null;
  payment_details: { method: string; trx_id: string } | null;
  shipping_destination: {
    type: 'Standard' | 'University';
    district?: string;
    upazila?: string;
    villageArea?: string;
    universityName?: string;
    hallName?: string;
  } | null;
  order_items: OrderItem[];
  customer_name?: string;
  customer_email?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function Admin() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState<boolean>(false);

  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<AdminOrder | null>(null);

  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    description: '',
    image_url: '',
    category: '',
  });

  useEffect(() => {
    return () => {
      setIsAdminAuthenticated(false);
    };
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (data) setCategories(data);
  };

  useEffect(() => {
    if (!isAdminAuthenticated) return;

    const fetchAdminData = async () => {
      setLoading(true);

      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          id, 
          user_id,
          total_amount, 
          status, 
          shipping_address, 
          created_at, 
          contact_number, 
          payment_details, 
          shipping_destination, 
          order_items(quantity, price_at_purchase, products(id, title))
        `)
        .order('created_at', { ascending: false });

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      await fetchCategories();

      if (ordersData) {
        const typedOrders = ordersData as any[];

        try {
          const userIds = Array.from(new Set(typedOrders.map((o) => o.user_id).filter(Boolean)));
          if (userIds.length > 0) {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, name, email')
              .in('id', userIds);

            if (profilesData) {
              const profileMap = new Map(profilesData.map((p) => [p.id, p]));
              typedOrders.forEach((order) => {
                const match = profileMap.get(order.user_id);
                order.customer_name = match?.name || 'Customer';
                order.customer_email = match?.email || 'N/A';
              });
            }
          }
        } catch (e) {
          console.error('Profile resolution drop context:', getErrorMessage(e));
        }

        setOrders(typedOrders as AdminOrder[]);
      }

      if (productsData) setProducts(productsData);
      setLoading(false);
    };

    fetchAdminData();
  }, [isAdminAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'supersecretadmin123') {
      setIsAdminAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('❌ Invalid Administrative Password. Access Denied.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminPassword('');
  };

  const handleUpdateStatus = async (orderId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Pending' ? 'Delivered' : 'Pending';
    const { error } = await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId);
    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
    } else {
      alert(`Error updating order status: ${error.message}`);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm(`⚠️ Are you sure you want to delete Order #${orderId}?`)) return;

    try {
      await supabase.from('order_items').delete().eq('order_id', orderId);
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: unknown) {
      alert(`Could not erase order: ${getErrorMessage(err)}`);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setFormLoading(true);
    const { error } = await supabase.from('categories').insert([{ name: newCategoryName.trim() }]);
    if (error) alert(error.message);
    else {
      setNewCategoryName('');
      await fetchCategories();
    }
    setFormLoading(false);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    setFormLoading(true);
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) alert(error.message);
    else await fetchCategories();
    setFormLoading(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || !newProduct.image_url || !newProduct.category) {
      alert('Please fill in all saree attributes.');
      return;
    }
    setFormLoading(true);
    const { data, error } = await supabase.from('products').insert([
      {
        title: newProduct.title,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        image_url: newProduct.image_url,
        category: newProduct.category,
      },
    ]).select();

    if (error) alert(error.message);
    else if (data) {
      setProducts((prev) => [data[0], ...prev]);
      setNewProduct({ title: '', price: '', description: '', image_url: '', category: '' });
      alert('🎉 Saree product published successfully!');
    }
    setFormLoading(false);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Delete saree product from catalog?')) return;
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error) setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const triggerSystemPrint = () => {
    window.print();
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-rose-950 font-sans text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <form
            onSubmit={handleAdminLogin}
            className="max-w-md w-full bg-rose-900 border border-rose-800 p-8 rounded-3xl shadow-xl text-center space-y-4"
          >
            <span className="text-4xl block mb-2">🔒</span>
            <h1 className="text-xl font-serif font-bold text-amber-200">Merchant Admin Terminal</h1>
            <p className="text-xs text-rose-200/70">Menakkhi Sarees Backoffice Access</p>
            <input
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter Administrative Key..."
              className="w-full text-center text-sm border border-rose-700 bg-rose-950 p-3 rounded-xl focus:outline-none focus:border-amber-400 text-white font-mono tracking-widest"
            />
            {authError && <p className="text-xs font-bold text-amber-300">{authError}</p>}
            <button
              type="submit"
              className="w-full text-xs font-black uppercase tracking-wider bg-amber-400 text-rose-950 p-3.5 rounded-xl hover:bg-amber-300 transition cursor-pointer"
            >
              Unlock Console
            </button>
          </form>
        </div>
        <Footer />
      </div>
    );
  }

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
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-rose-100 pb-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-rose-950">Menakkhi Sarees Admin Console</h1>
              <button
                onClick={handleAdminLogout}
                className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 px-2.5 py-1 rounded-md mt-1 cursor-pointer"
              >
                Lock Terminal 🔒
              </button>
            </div>
            <div className="flex bg-rose-100/60 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition cursor-pointer ${
                  activeTab === 'orders' ? 'bg-white text-rose-950 shadow-xs' : 'text-gray-600'
                }`}
              >
                📋 Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition cursor-pointer ${
                  activeTab === 'inventory' ? 'bg-white text-rose-950 shadow-xs' : 'text-gray-600'
                }`}
              >
                📦 Catalog ({products.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-gray-400 animate-pulse font-bold">Loading admin console...</div>
          ) : activeTab === 'orders' ? (
            <div className="bg-white border border-rose-100 rounded-2xl shadow-xs overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-rose-50/50 border-b border-rose-100 text-xs font-black text-rose-950 uppercase tracking-wider">
                    <th className="p-4 w-[25%]">Ref & Date</th>
                    <th className="p-4 w-[25%]">Customer</th>
                    <th className="p-4 w-[20%] text-center">Amount</th>
                    <th className="p-4 w-[30%] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50 text-xs sm:text-sm bg-white">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-rose-50/20 transition">
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-black text-rose-950 font-mono">#{order.id}</div>
                        <div className="text-[11px] text-gray-400 font-bold mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('en-BD')}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-gray-900">{order.customer_name}</div>
                        <div className="text-xs text-gray-500 font-mono">{order.contact_number}</div>
                      </td>

                      <td className="p-4 text-center font-mono font-black text-rose-950">
                        {formatBDT(order.total_amount)}
                      </td>

                      <td className="p-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setActiveInvoiceOrder(order);
                              document.body.style.overflow = 'hidden';
                            }}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-50 text-rose-900 border border-rose-100 hover:bg-rose-100 transition cursor-pointer"
                          >
                            Voucher
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(order.id, order.status)}
                            className={`min-w-[90px] px-2.5 py-1.5 text-xs font-black rounded-xl border transition cursor-pointer ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {order.status === 'Delivered' ? '🟢 Delivered' : '🟡 Pending'}
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 text-xs transition cursor-pointer"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                {/* Publish Saree Product */}
                <div className="bg-white border border-rose-100 p-6 rounded-3xl shadow-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider mb-4 text-rose-950">Publish New Saree</h3>
                  <form onSubmit={handleAddProduct} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Saree Title (e.g. Pure Rajshahi Silk)"
                      required
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-gray-50/50"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Price in BDT (৳)"
                        step="1"
                        required
                        className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 font-mono"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                      <select
                        required
                        className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 font-bold text-gray-700"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      >
                        <option value="">-- Category --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="url"
                      placeholder="Image URL"
                      required
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-gray-50/50"
                      value={newProduct.image_url}
                      onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    />
                    <textarea
                      placeholder="Saree Weave Description & Details"
                      rows={3}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-gray-50/50 resize-none"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="w-full text-xs font-black uppercase tracking-wider bg-rose-900 text-white p-3 rounded-xl hover:bg-rose-800 transition disabled:opacity-50 cursor-pointer"
                    >
                      🚀 Publish Live Saree
                    </button>
                  </form>
                </div>

                {/* Manage Categories */}
                <div className="bg-white border border-rose-100 p-6 rounded-3xl shadow-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider mb-3 text-rose-950">Add Saree Category</h3>
                  <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Category name..."
                      required
                      className="flex-1 text-xs p-2 border border-gray-200 rounded-xl bg-gray-50/50"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="text-xs font-black uppercase bg-rose-950 text-white px-4 rounded-xl hover:bg-rose-800 transition disabled:opacity-50 cursor-pointer"
                    >
                      Add
                    </button>
                  </form>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {categories.map((c) => (
                      <div
                        key={c.id}
                        className="flex justify-between items-center bg-rose-50/50 border border-rose-100 p-2 rounded-xl text-xs font-bold text-rose-950"
                      >
                        <span>{c.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="text-red-500 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Saree Catalog Records */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-950 mb-2">
                  Active Saree Catalog ({products.length})
                </h3>
                {products.map((product) => (
                  <div key={product.id} className="bg-white border border-rose-100 p-4 rounded-2xl shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={product.image_url} alt={product.title} className="w-12 h-12 rounded-xl object-contain bg-rose-50/50 p-1" />
                      <div>
                        <h4 className="font-bold text-rose-950 text-sm leading-none">{product.title}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-black text-rose-800 font-mono">{formatBDT(product.price)}</span>
                          <span className="text-[9px] uppercase font-black bg-rose-100 text-rose-900 px-2 py-0.5 rounded">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-gray-400 hover:text-red-600 p-2 text-xs cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>

      {/* ADMIN PRINTABLE INVOICE MODAL */}
      {activeInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-start items-center overflow-y-auto p-2 sm:p-6 select-none animate-in fade-in duration-200">
          <div className="no-print-action max-w-4xl w-[95vw] bg-rose-950 text-white rounded-t-2xl px-4 py-3 border-b border-rose-800 flex justify-between items-center shadow-xl">
            <div className="flex items-center gap-2.5 truncate">
              <span className="text-xl shrink-0">📄</span>
              <div className="truncate text-left">
                <p className="text-xs sm:text-sm font-bold truncate">Menakkhi_Order_#000{activeInvoiceOrder.id}.pdf</p>
                <p className="text-[10px] text-rose-200/70 font-semibold">Official Admin Invoice</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={triggerSystemPrint}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
              >
                📥 Print Invoice
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
                  <p className="text-xs font-bold text-rose-800 mt-0.5">Admin Dispatch Statement</p>
                </div>
                <div className="text-left sm:text-right">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">INVOICE RECORD</h2>
                  <p className="text-sm sm:text-base font-black text-rose-900 mt-0.5">Order Sequence: #000{activeInvoiceOrder.id}</p>
                  <p className="text-xs text-gray-400 font-bold mt-1">
                    Date: {new Date(activeInvoiceOrder.created_at).toLocaleDateString('en-BD')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-rose-50/40 border border-rose-100 rounded-2xl p-4">
                <div>
                  <h3 className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-1">Customer Identity</h3>
                  <p className="text-sm font-black text-gray-900">{activeInvoiceOrder.customer_name || 'Customer'}</p>
                  <p className="text-xs text-gray-600 mt-0.5">✉️ {activeInvoiceOrder.customer_email || 'N/A'}</p>
                  <p className="text-xs font-mono font-bold text-rose-900 mt-1">📞 {activeInvoiceOrder.contact_number || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-1">Delivery Destination</h3>
                  <p className="text-xs text-gray-800 font-medium leading-relaxed">
                    {activeInvoiceOrder.shipping_address}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-2.5">Line Items</h3>
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b-2 border-rose-950 font-black text-rose-950 bg-rose-50">
                      <th className="py-2.5 px-3 w-[50%]">Saree Title</th>
                      <th className="py-2.5 px-3 text-center w-[15%]">Qty</th>
                      <th className="py-2.5 px-3 text-right w-[35%]">Net Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {activeInvoiceOrder.order_items.map((item, index) => (
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
                  <h3 className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-1">Payment Clearance</h3>
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
                  <div className="flex justify-between items-end pt-2 border-t border-gray-200">
                    <span className="text-xs font-black text-rose-950 uppercase tracking-wider">Grand Total:</span>
                    <span className="text-xl font-black text-rose-950 font-mono">
                      {formatBDT(activeInvoiceOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center text-[9px] text-gray-400 font-bold border-t border-rose-50 pt-3 uppercase tracking-wider">
                Menakkhi Sarees Merchant Copy Record
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}