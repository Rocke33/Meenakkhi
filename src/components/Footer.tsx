import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-rose-950 text-rose-200/80 pt-12 pb-6 px-6 font-sans mt-auto border-t border-rose-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        
        {/* Brand Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🌸</span>
            <h3 className="text-white text-lg font-serif font-bold tracking-tight">Menakkhi Sarees</h3>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-rose-200/70">
            Your premier online destination for authentic Dhakai Jamdani, Katan Silk, Rajshahi Silk, Muslin, Organza, and bespoke Bridal Sarees. Handcrafted with traditional Bangladeshi heritage craftsmanship.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white text-sm font-black uppercase tracking-wider mb-4">Saree Collections</h4>
          <ul className="space-y-2 text-xs font-semibold">
            <li><Link to="/products" className="hover:text-amber-300 transition">All Saree Weaves</Link></li>
            <li><Link to="/category/katan" className="hover:text-amber-300 transition">Pure Katan Silk</Link></li>
            <li><Link to="/category/jamdani" className="hover:text-amber-300 transition">Dhakai Muslin Jamdani</Link></li>
            <li><Link to="/category/bridal%20collection" className="hover:text-amber-300 transition">Royal Bridal Collection</Link></li>
          </ul>
        </div>

        {/* Customer Center */}
        <div>
          <h4 className="text-white text-sm font-black uppercase tracking-wider mb-4">Customer Care</h4>
          <ul className="space-y-2 text-xs font-semibold">
            <li><Link to="/cart" className="hover:text-amber-300 transition">Shopping Bag & Checkout</Link></li>
            <li><Link to="/profile" className="hover:text-amber-300 transition">Order History & Vouchers</Link></li>
            <li><Link to="/orders" className="hover:text-amber-300 transition">Top Sales Showcase</Link></li>
          </ul>
        </div>

      </div>

      <div className="border-t border-rose-900/80 max-w-6xl mx-auto pt-6 text-center text-xs text-rose-300/50 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>
          &copy; {currentYear} Menakkhi Sarees Boutique. All rights reserved.
        </div>
        <div className="text-[10px] font-mono text-amber-300/80">
          Delivery Across Bangladesh (bKash | Nagad | Cash on Delivery)
        </div>
      </div>
    </footer>
  );
}