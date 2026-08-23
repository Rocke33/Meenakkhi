import React, { useState, useMemo } from 'react';
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
  onClose?: () => void;
  onOrderSuccess: () => void;
}

// Bangladesh Cascading Location Data
const BD_LOCATIONS: Record<string, string[]> = {
  Dhaka: ['Dhaka', 'Gazipur', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Faridpur', 'Gopalganj', 'Rajbari', 'Shariatpur', 'Tangail'],
  Chattogram: ['Chattogram', 'Bandarban', 'Brahmanbaria', 'Chandpur', 'Cumilla', "Cox's Bazar", 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati'],
  Rajshahi: ['Rajshahi', 'Bogura', 'Joypurhat', 'Naogaon', 'Natore', 'Chapai Nawabganj', 'Pabna', 'Sirajganj'],
  Khulna: ['Khulna', 'Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira'],
  Barishal: ['Barishal', 'Barguna', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'],
  Sylhet: ['Sylhet', 'Habiganj', 'Moulvibazar', 'Sunamganj'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'],
};

// Varsity & Hall Mapping
const UNIVERSITIES: Record<string, string[]> = {
  'Jahangirnagar University': [
    'Al Beruni Hall', 'A F M Kamaluddin Hall', 'Mir Mosharraf Hossain Hall', 'Shaheed Salam-Barkat Hall',
    'Shaheed Rafiq-Jabbar Hall', 'Sher-e-Bangla A.K. Fazlul Huq Hall', 'Nawab Salimullah Hall',
    'Shaheed Tajuddin Ahmad Hall', 'Jatiya Kabi Kazi Nazrul Islam Hall', 'Maulana Bhashani Hall',
    'Bishwakabi Rabindranath Tagore Hall', 'Jahanara Imam Hall', 'Nawab Faizunnesa Hall',
    'Pritilata Hall', 'Begum Khaleda Zia Hall', 'Begum Sufia Kamal Hall', 'Begum Rokeya Hall',
    'Bir Protik Taramon Bibi Hall', 'July 24 Jagarani Hall', 'Shaheed Felani Khatun Hall'
  ],
  'University of Dhaka': ['Jagannath Hall', 'Salimullah Muslim Hall', 'Dhaka Hall', 'Fazlul Huq Muslim Hall', 'Surja Sen Hall', 'Haji Muhammad Mohsin Hall', 'Kavi Sufia Kamal Hall', 'Ruqayyah Hall'],
  'Bangladesh University of Engineering and Technology': ['Ahsanullah Hall', 'Chhatri Hall', 'Nazrul Islam Hall', 'Sher-e-Bangla Hall', 'Suhrawardy Hall', 'Titumir Hall'],
  'Rajshahi University': ['Sher-e-Bangla Fazlul Haque Hall', 'Shah Makhdum Hall', 'Nawab Abdul Latif Hall', 'Syed Amir Ali Hall'],
  'Chittagong University': ['Alaol Hall', 'AF Rahman Hall', 'Sharttaz Hall', 'Pritilata Hall']
};

export default function CheckoutForm({
  cartItems,
  subtotal,
  onClose,
  onOrderSuccess,
}: CheckoutFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Delivery Info Modal state
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState<boolean>(false);

  // Location Selector State
  const [locationType, setLocationType] = useState<'Varsity' | 'Residential'>('Varsity');

  // Varsity State
  const [selectedUniversity, setSelectedUniversity] = useState<string>('Jahangirnagar University');
  const [selectedHall, setSelectedHall] = useState<string>('');

  // Residential Cascading Dropdown States
  const [selectedDivision, setSelectedDivision] = useState<string>('Dhaka');
  const [divisionSearch, setDivisionSearch] = useState<string>('');
  const [isDivOpen, setIsDivOpen] = useState<boolean>(false);

  const [selectedZila, setSelectedZila] = useState<string>('Dhaka');
  const [zilaSearch, setZilaSearch] = useState<string>('');
  const [isZilaOpen, setIsZilaOpen] = useState<boolean>(false);

  const [locationDetails, setLocationDetails] = useState<string>('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bKash' | 'Nagad'>('COD');
  const [transactionId, setTransactionId] = useState<string>('');

  // Calculate Delivery Charge Automatically
  const deliveryCharge = useMemo(() => {
    if (locationType === 'Varsity') {
      if (selectedUniversity === 'Jahangirnagar University') {
        return 0; // JU Campus -> ৳0
      }
      return 130; // Other Universities -> ৳130
    } else {
      if (selectedZila === 'Dhaka') {
        return 80; // Dhaka Zila -> ৳80
      }
      return 130; // All other Zilas -> ৳130
    }
  }, [locationType, selectedUniversity, selectedZila]);

  const grandTotal = subtotal + deliveryCharge;

  // Search Filters
  const filteredDivisions = useMemo(() => {
    return Object.keys(BD_LOCATIONS).filter((div) =>
      div.toLowerCase().includes(divisionSearch.toLowerCase())
    );
  }, [divisionSearch]);

  const availableZilas = useMemo(() => {
    return BD_LOCATIONS[selectedDivision] || [];
  }, [selectedDivision]);

  const filteredZilas = useMemo(() => {
    return availableZilas.filter((zila) =>
      zila.toLowerCase().includes(zilaSearch.toLowerCase())
    );
  }, [availableZilas, zilaSearch]);

  const validateBDPhone = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    return /^01[3-9]\d{8}$/.test(cleaned);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const sanitizedPhone = phone.replace(/\D/g, '');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your Customer Full Name.');
      return;
    }

    if (!sanitizedPhone || !validateBDPhone(sanitizedPhone)) {
      setErrorMsg('Please enter a valid 11-digit Bangladeshi mobile number.');
      return;
    }

    if (locationType === 'Varsity' && (!selectedUniversity || !selectedHall)) {
      setErrorMsg('Please select your University and Hall.');
      return;
    }

    if (locationType === 'Residential') {
      if (!selectedDivision || !selectedZila) {
        setErrorMsg('Please select both Division and Zila.');
        return;
      }
      if (!locationDetails.trim()) {
        setErrorMsg('Please enter your full Location Details / Address.');
        return;
      }
    }

    if ((paymentMethod === 'bKash' || paymentMethod === 'Nagad') && !transactionId.trim()) {
      setErrorMsg(`Please enter your ${paymentMethod} Verification Transaction ID (TrxID).`);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication expired. Please sign in again.');

      const shippingDestination = locationType === 'Varsity'
        ? { type: 'Varsity', university: selectedUniversity, hall: selectedHall }
        : { type: 'Residential', division: selectedDivision, zila: selectedZila, details: locationDetails.trim() };

      const fullAddressSummary = locationType === 'Varsity'
        ? `Varsity: ${selectedUniversity}, Hall: ${selectedHall}`
        : `Details: ${locationDetails.trim()}, Zila: ${selectedZila}, Division: ${selectedDivision}`;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: grandTotal,
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

      const orderItemsPayload = cartItems.map((item) => ({
        order_id: newOrder.id,
        product_id: item.products.id,
        quantity: item.quantity,
        price_at_purchase: item.products.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
      if (itemsError) throw itemsError;

      await supabase.from('cart_items').delete().eq('user_id', user.id);

      onOrderSuccess();
    } catch (err: unknown) {
      setErrorMsg('Order creation failed: ' + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border border-rose-100 rounded-3xl shadow-2xl font-sans text-gray-800 relative max-h-[90vh] flex flex-col overflow-hidden">
      
      {/* HEADER SECTION (Top Navigation + Delivery Info Button) */}
      <div className="flex items-center justify-between bg-white border-b border-rose-100 px-6 py-4 sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-black text-rose-950 tracking-tight">
            Checkout
          </h2>
          
          {/* TASK 6 — Delivery Info Button */}
          <button
            type="button"
            onClick={() => setIsDeliveryModalOpen(true)}
            className="text-[11px] font-bold uppercase tracking-wide bg-rose-50 hover:bg-rose-100 text-rose-900 px-3 py-1.5 rounded-xl border border-rose-200 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <span>ℹ️</span>
            <span>Delivery Info</span>
          </button>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-100 hover:bg-rose-100 text-gray-600 hover:text-rose-900 transition cursor-pointer font-bold text-xs"
            title="Close Checkout"
          >
            ✕
          </button>
        )}
      </div>

      {/* FORM CONTENT BODY */}
      <div className="p-5 sm:p-7 overflow-y-auto space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="space-y-4">
          
          {/* 1. Price of Product */}
          <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs font-bold">
            <span className="text-gray-600 uppercase tracking-wide text-[10px]">1. Price of Product:</span>
            <span className="text-rose-950 font-mono text-sm sm:text-base font-black">{formatBDT(subtotal)}</span>
          </div>

          {/* 2. Choose Location */}
          <div className="space-y-2.5">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              2. Choose Location *
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setLocationType('Varsity');
                  setSelectedUniversity('Jahangirnagar University');
                  setSelectedHall('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  locationType === 'Varsity' ? 'bg-white text-purple-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                🎓 Varsity
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocationType('Residential');
                  setSelectedDivision('Dhaka');
                  setSelectedZila('Dhaka');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  locationType === 'Residential' ? 'bg-white text-rose-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                🏠 Residential
              </button>
            </div>

            {/* VARSITY FLOW */}
            {locationType === 'Varsity' ? (
              <div className="space-y-3 p-3.5 bg-purple-50/40 rounded-2xl border border-purple-100">
                <div>
                  <label className="block text-[9px] font-bold text-purple-900 uppercase mb-1">University *</label>
                  <select
                    value={selectedUniversity}
                    onChange={(e) => {
                      setSelectedUniversity(e.target.value);
                      setSelectedHall('');
                    }}
                    className="w-full text-xs border border-purple-200 bg-white p-2.5 rounded-xl focus:outline-purple-500 font-semibold"
                  >
                    {Object.keys(UNIVERSITIES).map((uni) => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-purple-900 uppercase mb-1">Hall / Residential Hall *</label>
                  <select
                    value={selectedHall}
                    onChange={(e) => setSelectedHall(e.target.value)}
                    className="w-full text-xs border border-purple-200 bg-white p-2.5 rounded-xl focus:outline-purple-500 font-semibold"
                  >
                    <option value="">-- Select Hall --</option>
                    {(UNIVERSITIES[selectedUniversity] || []).map((hall) => (
                      <option key={hall} value={hall}>{hall}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              /* RESIDENTIAL FLOW: Division -> Zila -> Location Details */
              <div className="space-y-3 p-3.5 bg-rose-50/30 rounded-2xl border border-rose-100">
                
                {/* Searchable Division Dropdown */}
                <div className="relative">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Division *</label>
                  <div
                    onClick={() => setIsDivOpen(!isDivOpen)}
                    className="w-full text-xs border border-gray-200 bg-white p-2.5 rounded-xl cursor-pointer font-semibold flex justify-between items-center"
                  >
                    <span>{selectedDivision || 'Select Division'}</span>
                    <span>▾</span>
                  </div>

                  {isDivOpen && (
                    <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 max-h-48 overflow-y-auto space-y-1">
                      <input
                        type="text"
                        value={divisionSearch}
                        onChange={(e) => setDivisionSearch(e.target.value)}
                        placeholder="Search division..."
                        className="w-full p-2 text-xs border border-gray-200 rounded-lg mb-1 focus:outline-rose-500"
                      />
                      {filteredDivisions.map((div) => (
                        <div
                          key={div}
                          onClick={() => {
                            setSelectedDivision(div);
                            setSelectedZila(BD_LOCATIONS[div][0] || '');
                            setIsDivOpen(false);
                            setDivisionSearch('');
                          }}
                          className={`p-2 text-xs rounded-lg cursor-pointer hover:bg-rose-50 font-medium ${
                            selectedDivision === div ? 'bg-rose-100 text-rose-900 font-bold' : ''
                          }`}
                        >
                          {div}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Searchable Zila Dropdown (Filtered by Division) */}
                <div className="relative">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Zila *</label>
                  <div
                    onClick={() => setIsZilaOpen(!isZilaOpen)}
                    className="w-full text-xs border border-gray-200 bg-white p-2.5 rounded-xl cursor-pointer font-semibold flex justify-between items-center"
                  >
                    <span>{selectedZila || 'Select Zila'}</span>
                    <span>▾</span>
                  </div>

                  {isZilaOpen && (
                    <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 max-h-48 overflow-y-auto space-y-1">
                      <input
                        type="text"
                        value={zilaSearch}
                        onChange={(e) => setZilaSearch(e.target.value)}
                        placeholder="Search zila..."
                        className="w-full p-2 text-xs border border-gray-200 rounded-lg mb-1 focus:outline-rose-500"
                      />
                      {filteredZilas.map((zila) => (
                        <div
                          key={zila}
                          onClick={() => {
                            setSelectedZila(zila);
                            setIsZilaOpen(false);
                            setZilaSearch('');
                          }}
                          className={`p-2 text-xs rounded-lg cursor-pointer hover:bg-rose-50 font-medium ${
                            selectedZila === zila ? 'bg-rose-100 text-rose-900 font-bold' : ''
                          }`}
                        >
                          {zila}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Detailed Address Text Input */}
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Location Details / Full Address *</label>
                  <input
                    type="text"
                    required
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    placeholder="Area, Road, House number, Village, Street..."
                    className="w-full text-xs border border-gray-200 bg-white p-2.5 rounded-xl focus:outline-rose-500 font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Delivery Charge */}
          <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs font-bold">
            <span className="text-gray-600 uppercase tracking-wide text-[10px]">3. Delivery Charge:</span>
            <span className="text-emerald-700 font-mono text-sm sm:text-base font-black">{formatBDT(deliveryCharge)}</span>
          </div>

          {/* 4. Total */}
          <div className="flex justify-between items-center bg-rose-50/70 border border-rose-100 p-3.5 rounded-2xl">
            <span className="text-xs font-black text-rose-950 uppercase tracking-wider">4. Total (Product + Delivery):</span>
            <span className="text-base sm:text-xl font-black text-rose-700 font-mono">
              {formatBDT(grandTotal)}
            </span>
          </div>

          {/* 5. Customer Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                5. Customer Full Name *
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
                Activated Phone Number (11 Digits) *
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

          {/* 6. Payment Channel (Official Vector Logos) */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              6. Payment Channel *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Cash On Delivery */}
              <button
                type="button"
                onClick={() => { setPaymentMethod('COD'); setTransactionId(''); }}
                className={`p-2 border rounded-2xl text-center flex flex-col items-center justify-center transition-all cursor-pointer h-20 ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xl mb-1">💵</span>
                <span className="text-[10px] font-black tracking-tight leading-none">Cash On Delivery</span>
              </button>

              {/* bKash Official Image Logo */}
    <button
      type="button"
      onClick={() => setPaymentMethod('bKash')}
      className={`p-2 border rounded-2xl text-center flex flex-col items-center justify-center transition-all cursor-pointer h-20 ${
        paymentMethod === 'bKash'
          ? 'border-pink-600 bg-pink-50 text-pink-800 font-bold ring-2 ring-pink-500/20 shadow-2xs'
          : 'border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
    >
      <div className="h-8 mb-1 flex items-center justify-center">
        <img 
          src="/bkash.png" 
          alt="bKash Logo" 
          className="h-full object-contain"
        />
      </div>
      <span className="text-[9px] font-black tracking-tight leading-none text-[#e2136e]">bKash (01648038036)</span>
    </button>

             {/* Nagad Official Image Logo */}
    <button
      type="button"
      onClick={() => setPaymentMethod('Nagad')}
      className={`p-2 border rounded-2xl text-center flex flex-col items-center justify-center transition-all cursor-pointer h-20 ${
        paymentMethod === 'Nagad'
          ? 'border-orange-600 bg-orange-50 text-orange-800 font-bold ring-2 ring-orange-500/20 shadow-2xs'
          : 'border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
    >
      <div className="h-8 mb-1 flex items-center justify-center">
        <img 
          src="/nagad.png" 
          alt="Nagad Logo" 
          className="h-full object-contain"
        />
      </div>
      <span className="text-[9px] font-black tracking-tight leading-none text-[#f15a24]">Nagad (01648038036)</span>
    </button>

            </div>
          </div>

          {/* TrxID Input for Mobile Wallets */}
          {paymentMethod !== 'COD' && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl space-y-1.5">
              <div className="text-[11px] text-amber-900 font-medium">
                👉 Send Money <span className="font-extrabold">{formatBDT(grandTotal)}</span> to <span className="font-black underline font-mono">01648038036</span>. Enter TrxID below:
              </div>
              <div>
                <label className="block text-[9px] font-bold text-amber-800 uppercase mb-1">
                  Transaction ID (TrxID) *
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g., BK92837482"
                  className="w-full text-xs border border-amber-300 bg-white p-2.5 rounded-xl focus:outline-amber-600 font-mono font-bold uppercase"
                />
              </div>
            </div>
          )}

          {/* 7. Confirm Order Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-xs font-black uppercase tracking-wider bg-rose-900 hover:bg-rose-800 text-white py-3.5 rounded-2xl shadow-md transition disabled:bg-gray-200 cursor-pointer mt-2"
          >
            {loading ? 'Processing Order...' : `7. Confirm Order (${formatBDT(grandTotal)})`}
          </button>
        </form>
      </div>

      {/* TASK 6 — Delivery Info Centered Modal */}
      {isDeliveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsDeliveryModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-sm bg-white border border-rose-100 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-rose-100 pb-3">
              <h3 className="text-sm font-black text-rose-950 uppercase tracking-tight">
                Delivery Charge Information
              </h3>
              <button
                type="button"
                aria-label="Close Delivery Information Modal"
                onClick={() => setIsDeliveryModalOpen(false)}
                className="text-gray-400 hover:text-rose-900 font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-semibold text-gray-700">
              <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100">
                <span>Jahangirnagar University Campus</span>
                <span className="font-mono font-black">৳0.00</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-rose-50 text-rose-900 border border-rose-100">
                <span>Dhaka Zila</span>
                <span className="font-mono font-black">৳80</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 text-gray-900 border border-gray-200">
                <span>Out of Dhaka (All Bangladesh)</span>
                <span className="font-mono font-black">৳130</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDeliveryModalOpen(false)}
              className="w-full text-xs font-black uppercase tracking-wider bg-rose-900 text-white py-2.5 rounded-xl hover:bg-rose-800 transition cursor-pointer shadow-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}