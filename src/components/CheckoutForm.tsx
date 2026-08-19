import React, { useState } from 'react';
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

interface CheckoutFormProps {
  cartItems: CartItemRecord[];
  subtotal: number;
  shipping?: number;
  grandTotal?: number;
  onClose?: () => void;
  onOrderSuccess: () => void;
}

// JU Halls Preset List
const JU_MALE_HALLS = [
  'Al Beruni Hall',
  'A F M Kamaluddin Hall',
  'Mir Mosharraf Hossain Hall',
  'Shaheed Salam-Barkat Hall',
  'Shaheed Rafiq-Jabbar Hall',
  'Sher-e-Bangla A.K. Fazlul Huq Hall',
  'Nawab Salimullah Hall',
  'Shaheed Tajuddin Ahmad Hall',
  'Jatiya Kabi Kazi Nazrul Islam Hall',
  'Maulana Bhashani Hall',
  'Bishwakabi Rabindranath Tagore Hall',
];

const JU_FEMALE_HALLS = [
  'Jahanara Imam Hall',
  'Nawab Faizunnesa Hall',
  'Pritilata Hall',
  'Begum Khaleda Zia Hall',
  'Begum Sufia Kamal Hall',
  'Begum Rokeya Hall',
  'Bir Protik Taramon Bibi Hall',
  'July 24 Jagarani Hall',
  'Shaheed Felani Khatun Hall',
];

export default function CheckoutForm({
  cartItems,
  subtotal,
  shipping = 150,
  grandTotal: passedGrandTotal,
  onClose,
  onOrderSuccess,
}: CheckoutFormProps) {
  const computedGrandTotal = passedGrandTotal ?? (subtotal + (subtotal > 0 ? shipping : 0));

  const [loading, setLoading] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Address configuration: Reordered so University is default/first
  const [addressType, setAddressType] = useState<'University' | 'Standard'>('University');
  const [district, setDistrict] = useState<string>('');
  const [upazila, setUpazila] = useState<string>('');
  const [villageArea, setVillageArea] = useState<string>('');
  
  // University & Hall States
  const [universityName, setUniversityName] = useState<string>('Jahangirnagar University');
  const [hallName, setHallName] = useState<string>('');
  const [customUniversity, setCustomUniversity] = useState<string>('');
  const [customHall, setCustomHall] = useState<string>('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bKash' | 'Nagad'>('COD');
  const [transactionId, setTransactionId] = useState<string>('');

  // Strict Bangladeshi 11-digit mobile validation regex
  const validateBDPhone = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    return /^01[3-9]\d{8}$/.test(cleaned);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const sanitizedPhone = phone.replace(/\D/g, '');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your Full Customer Name.');
      return;
    }

    if (!sanitizedPhone || !validateBDPhone(sanitizedPhone)) {
      setErrorMsg('Please enter a valid 11-digit Bangladeshi mobile number starting with 01 (e.g., 01712345678).');
      return;
    }

    const finalUniversity = universityName === 'Other' ? customUniversity.trim() : universityName;
    const finalHall = hallName === 'Other' ? customHall.trim() : hallName;

    if (addressType === 'University' && (!finalUniversity || !finalHall)) {
      setErrorMsg('Please select or specify your University and Hall/Building name.');
      return;
    }

    if (addressType === 'Standard' && (!district.trim() || !upazila.trim() || !villageArea.trim())) {
      setErrorMsg('Please fill in all home delivery address fields (District, Upazila, and Street/House).');
      return;
    }

    if ((paymentMethod === 'bKash' || paymentMethod === 'Nagad') && !transactionId.trim()) {
      setErrorMsg(`Please enter your ${paymentMethod} payment Verification Transaction ID (TrxID).`);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication expired. Please sign in to place your order.');

      // Compile structured destination payload
      const shippingDestination = addressType === 'University'
        ? { type: 'University', universityName: finalUniversity, hallName: finalHall }
        : { type: 'Standard', district: district.trim(), upazila: upazila.trim(), villageArea: villageArea.trim() };

      const fullAddressSummary = addressType === 'University'
        ? `Hall/Dept: ${finalHall}, Campus: ${finalUniversity}`
        : `Area: ${villageArea.trim()}, Upazila: ${upazila.trim()}, District: ${district.trim()}`;

      // 1. Insert core order log
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: computedGrandTotal,
            shipping_address: fullAddressSummary,
            status: 'Pending',
            contact_number: sanitizedPhone,
            shipping_destination: shippingDestination,
            payment_details: {
              method: paymentMethod,
              trx_id: paymentMethod !== 'COD' ? transactionId.trim().toUpperCase() : 'CASH_ON_DELIVERY',
            },
          },
        ])
        .select();

      if (orderError) throw orderError;
      const newOrder = (orderData as any[])[0];

      // 2. Insert itemized order line breakdowns
      const orderItemsPayload = cartItems.map((item) => ({
        order_id: newOrder.id,
        product_id: item.products.id,
        quantity: item.quantity,
        price_at_purchase: item.products.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
      if (itemsError) throw itemsError;

      // 3. Clear active user shopping cart
      await supabase.from('cart_items').delete().eq('user_id', user.id);

      onOrderSuccess();
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setErrorMsg('Order compilation failed: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border border-rose-100 p-5 sm:p-7 rounded-3xl shadow-xl font-sans text-gray-800">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-rose-100 pb-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-rose-950 tracking-tight flex items-center gap-2">
            <span>📦</span> Courier Delivery & Payment Details
          </h2>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">
            Complete your shipping location and select local payment options.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
            title="Close Checkout"
          >
            ✕
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-start gap-2">
          <span className="shrink-0">⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Payable Amount Summary Banner */}
      <div className="bg-rose-50/70 border border-rose-100 p-3 rounded-2xl flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-rose-900">Total Payable Amount:</span>
        <span className="text-base sm:text-lg font-black text-rose-700 font-mono">
          {formatBDT(computedGrandTotal)}
        </span>
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-4">
        
        {/* Customer Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Nusrat Jahan"
              className="w-full text-xs border border-gray-200 bg-gray-50/50 p-2.5 rounded-xl focus:bg-white focus:outline-rose-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Active BD Mobile (11 Digits) *
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g., 01712345678"
              className="w-full text-xs border border-gray-200 bg-gray-50/50 p-2.5 rounded-xl focus:bg-white focus:outline-rose-500 font-mono font-bold"
            />
          </div>
        </div>

        {/* Address Type Selector - University Option Placed First */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Delivery Channel Type *
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setAddressType('University')}
              className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                addressType === 'University' ? 'bg-white text-purple-900 shadow-xs' : 'text-gray-500'
              }`}
            >
              🎓 Varsity / Campus Hall
            </button>
            <button
              type="button"
              onClick={() => setAddressType('Standard')}
              className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                addressType === 'Standard' ? 'bg-white text-rose-900 shadow-xs' : 'text-gray-500'
              }`}
            >
              🏠 Home Delivery
            </button>
          </div>
        </div>

        {/* Conditional Address Fields */}
        {addressType === 'University' ? (
          <div className="space-y-3 p-3.5 bg-purple-50/40 rounded-2xl border border-purple-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-purple-900 uppercase mb-1">Select University *</label>
                <select
                  value={universityName}
                  onChange={(e) => {
                    setUniversityName(e.target.value);
                    setHallName('');
                  }}
                  className="w-full text-xs border border-purple-200 bg-white p-2.5 rounded-xl focus:outline-purple-500 font-semibold text-gray-700"
                >
                  <option value="Jahangirnagar University">Jahangirnagar University (JU)</option>
                  <option value="Dhaka University">Dhaka University (DU)</option>
                  <option value="Other">Other University...</option>
                </select>
              </div>

              {universityName === 'Other' ? (
                <div>
                  <label className="block text-[9px] font-bold text-purple-900 uppercase mb-1">University Name *</label>
                  <input
                    type="text"
                    required
                    value={customUniversity}
                    onChange={(e) => setCustomUniversity(e.target.value)}
                    placeholder="e.g., Rajshahi University"
                    className="w-full text-xs border border-purple-200 bg-white p-2.5 rounded-xl focus:outline-purple-500 font-medium"
                  />
                </div>
              ) : null}

              {/* Hall Selector */}
              <div>
                <label className="block text-[9px] font-bold text-purple-900 uppercase mb-1">Hall / Campus Location *</label>
                {universityName === 'Jahangirnagar University' ? (
                  <select
                    value={hallName}
                    onChange={(e) => setHallName(e.target.value)}
                    className="w-full text-xs border border-purple-200 bg-white p-2.5 rounded-xl focus:outline-purple-500 font-semibold text-gray-700"
                  >
                    <option value="">-- Select JU Hall --</option>
                    <optgroup label="Male Halls">
                      {JU_MALE_HALLS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Female Halls">
                      {JU_FEMALE_HALLS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </optgroup>
                    <option value="Other">Other Department / Premises</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={hallName}
                    onChange={(e) => setHallName(e.target.value)}
                    placeholder="e.g., Jagannath Hall / Curzon Hall Area"
                    className="w-full text-xs border border-purple-200 bg-white p-2.5 rounded-xl focus:outline-purple-500 font-medium"
                  />
                )}
              </div>

              {hallName === 'Other' && universityName === 'Jahangirnagar University' && (
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-purple-900 uppercase mb-1">Specify Department / Spot *</label>
                  <input
                    type="text"
                    required
                    value={customHall}
                    onChange={(e) => setCustomHall(e.target.value)}
                    placeholder="e.g., WRC, New Arts Building, Room 204"
                    className="w-full text-xs border border-purple-200 bg-white p-2.5 rounded-xl focus:outline-purple-500 font-medium"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 p-3.5 bg-rose-50/30 rounded-2xl border border-rose-100">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">District / Zila *</label>
                <input
                  type="text"
                  required={addressType === 'Standard'}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g., Dhaka"
                  className="w-full text-xs border border-gray-200 bg-white p-2.5 rounded-xl focus:outline-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Upazila / Thana *</label>
                <input
                  type="text"
                  required={addressType === 'Standard'}
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  placeholder="e.g., Dhanmondi"
                  className="w-full text-xs border border-gray-200 bg-white p-2.5 rounded-xl focus:outline-rose-500 font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">
                House, Road, Area Details *
              </label>
              <input
                type="text"
                required={addressType === 'Standard'}
                value={villageArea}
                onChange={(e) => setVillageArea(e.target.value)}
                placeholder="e.g., House #24, Road #7, Sector 4"
                className="w-full text-xs border border-gray-200 bg-white p-2.5 rounded-xl focus:outline-rose-500 font-medium"
              />
            </div>
          </div>
        )}

        {/* Local Payment Method Selection with SVG Vector Logos */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Select Payment Channel *
          </label>
          <div className="grid grid-cols-3 gap-2">
            
            {/* Cash On Delivery */}
            <button
              type="button"
              onClick={() => { setPaymentMethod('COD'); setTransactionId(''); }}
              className={`p-2.5 border rounded-2xl text-center flex flex-col items-center justify-center transition-all cursor-pointer h-20 ${
                paymentMethod === 'COD'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className="text-xl mb-1">💵</span>
              <span className="text-[10px] font-black tracking-tight leading-none">Cash On Delivery</span>
            </button>

            {/* bKash Vector Logo */}
            <button
              type="button"
              onClick={() => setPaymentMethod('bKash')}
              className={`p-2.5 border rounded-2xl text-center flex flex-col items-center justify-center transition-all cursor-pointer h-20 ${
                paymentMethod === 'bKash'
                  ? 'border-pink-600 bg-pink-50 text-pink-800 font-bold ring-2 ring-pink-500/20'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="h-6 mb-1 flex items-center justify-center">
                <svg viewBox="0 0 230 100" className="h-full fill-current text-[#e2136e]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M141.5 5.5l-33 46 22 43h34l-22-43 33-46h-34zM16.5 5.5L0 51.5l16.5 43h33.5L33.5 51.5l33.5-46H16.5zm55 0l-16.5 46 16.5 43h33.5l-16.5-43 16.5-46H71.5z" />
                </svg>
              </div>
              <span className="text-[10px] font-black tracking-tight leading-none text-[#e2136e]">bKash (01648038036)</span>
            </button>

            {/* Nagad Vector Logo */}
            <button
              type="button"
              onClick={() => setPaymentMethod('Nagad')}
              className={`p-2.5 border rounded-2xl text-center flex flex-col items-center justify-center transition-all cursor-pointer h-20 ${
                paymentMethod === 'Nagad'
                  ? 'border-orange-600 bg-orange-50 text-orange-800 font-bold ring-2 ring-orange-500/20'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="h-6 mb-1 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-full fill-current text-[#f7931e]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 5C25.1 5 5 25.1 5 50s20.1 45 45 45 45-20.1 45-45S74.9 5 50 5zm0 18c8.3 0 15 6.7 15 15s-6.7 15-15 15-15-6.7-15-15 6.7-15 15-15zm0 60c-11.3 0-21.3-5.8-27.1-14.7 0.3-8.9 18.1-13.8 27.1-13.8 8.9 0 26.8 4.9 27.1 13.8C71.3 77.2 61.3 83 50 83z" />
                </svg>
              </div>
              <span className="text-[10px] font-black tracking-tight leading-none text-[#f7931e]">Nagad (01648038036)</span>
            </button>

          </div>
        </div>

        {/* Transaction Reference Panel for Mobile Wallets */}
        {paymentMethod !== 'COD' && (
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl space-y-2">
            <div className="text-[11px] text-amber-900 font-medium leading-relaxed">
              👉 Please Send Money <span className="font-extrabold">{formatBDT(computedGrandTotal)}</span> to our merchant wallet number: <span className="font-black underline font-mono">01648038036</span>. After payment, enter your TrxID below:
            </div>
            <div>
              <label className="block text-[9px] font-bold text-amber-800 uppercase mb-1">
                Payment Verification Transaction ID (TrxID) *
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g., BK92837482"
                className="w-full text-xs border border-amber-300 bg-white p-2.5 rounded-xl focus:outline-amber-600 font-mono tracking-wider font-bold uppercase"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-xs font-black uppercase tracking-wider bg-rose-900 hover:bg-rose-800 text-white py-3.5 rounded-2xl shadow-md transition disabled:bg-gray-200 cursor-pointer mt-2"
        >
          {loading ? 'Processing Order...' : `Confirm Saree Order (${formatBDT(computedGrandTotal)})`}
        </button>
      </form>
    </div>
  );
}