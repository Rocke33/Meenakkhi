import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-950 text-stone-300 pt-14 pb-8 px-6 font-sans mt-auto border-t border-amber-500/20 relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        
        {/* Brand Info */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Meenakkhi Logo" className="h-12 w-auto rounded-lg border border-amber-500/30 p-1 bg-stone-900" />
            <div>
              <h3 className="text-amber-200 text-xl font-serif font-bold tracking-tight">মীনাক্ষী Sarees</h3>
              <p className="text-[10px] text-amber-400/80 font-sans font-bold uppercase tracking-widest">Royal Bangladeshi Heritage</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-stone-400 max-w-md">
            Your premier online luxury boutique for authentic Dhakai Jamdani, pure Katan Silk, Rajshahi Silk, Muslin, Organza, and bespoke Royal Bridal Sarees. Woven with traditional heritage craftsmanship across Bangladesh.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-4 border-b border-stone-800 pb-2">
            Signature Collections
          </h4>
          <ul className="space-y-2.5 text-xs font-semibold">
            <li><Link to="/products" className="hover:text-amber-300 transition-colors">All Saree Weaves</Link></li>
            <li><Link to="/category/katan" className="hover:text-amber-300 transition-colors">Pure Handloom Katan Silk</Link></li>
            <li><Link to="/category/jamdani" className="hover:text-amber-300 transition-colors">Dhakai Muslin Jamdani</Link></li>
            <li><Link to="/category/bridal%20collection" className="hover:text-amber-300 transition-colors">Royal Bridal Collection</Link></li>
          </ul>
        </div>

        {/* Customer Center */}
        <div>
          <h4 className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-4 border-b border-stone-800 pb-2">
            Customer Concierge
          </h4>
          <ul className="space-y-2.5 text-xs font-semibold">
            <li><Link to="/cart" className="hover:text-amber-300 transition-colors">Shopping Bag & Checkout</Link></li>
            <li><Link to="/profile" className="hover:text-amber-300 transition-colors">Order History & Vouchers</Link></li>
            <li><Link to="/orders" className="hover:text-amber-300 transition-colors">Top Sales Showcase</Link></li>
            <li><Link to="/admin" className="hover:text-amber-300 transition-colors">Admin Portal</Link></li>
          </ul>
        </div>

      </div>

      <div className="border-t border-stone-800/80 max-w-7xl mx-auto pt-6 text-center text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div>
          &copy; {currentYear} Meenakkhi Sarees Boutique. All rights reserved.
        </div>
        <div className="text-[11px] font-sans font-semibold text-amber-400/90 bg-stone-900 px-3 py-1 rounded-full border border-stone-800">
          Delivery Across Bangladesh (bKash | Nagad | Cash on Delivery)
        </div>
      </div>
    </footer>
  );
}