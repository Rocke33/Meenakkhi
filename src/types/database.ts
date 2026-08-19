export interface Product {
  id: number;
  title: string;
  price: number;
  image_url: string;
  category: string;
  description: string;
  in_stock?: boolean;
}

export interface OrderItem {
  quantity: number;
  price_at_purchase: number;
  products: Pick<Product, 'id' | 'title' | 'image_url'> | null;
}

export interface ShippingDestination {
  type: 'Standard' | 'University';
  district?: string;
  upazila?: string;
  villageArea?: string;
  universityName?: string;
  hallName?: string;
}

export interface PaymentDetails {
  method: 'COD' | 'bKash' | 'Nagad';
  trx_id: string;
}

export interface UserOrder {
  id: number;
  total_amount: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | string;
  shipping_address: string;
  contact_number?: string;
  shipping_destination?: ShippingDestination;
  payment_details?: PaymentDetails;
  created_at: string;
  order_items: OrderItem[];
  customer_name?: string;
  customer_email?: string;
}

export interface CartItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  created_at?: string;
  products?: Product;
}

export interface ProductComment {
  id: string;
  product_id: number;
  user_id: string;
  user_email: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

/**
 * Utility helper to format prices cleanly in Bangladeshi Taka (৳ BDT)
 */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}