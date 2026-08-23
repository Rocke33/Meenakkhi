import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

interface CartContextType {
  cartCount: number;
  isShivering: boolean;
  refreshCart: () => Promise<void>;
  triggerCartAlert: () => void;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  isShivering: false,
  refreshCart: async () => {},
  triggerCartAlert: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState<number>(0);
  const [isShivering, setIsShivering] = useState<boolean>(false);

  const triggerCartAlert = () => {
    setIsShivering(true);
    setTimeout(() => {
      setIsShivering(false);
    }, 3500);
  };

  // Memoize refreshCart so components can safely call it on delete actions
  const refreshCart = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCartCount(0);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id);

      if (error) throw error;

      // Sum up total quantity. If cart is empty (data length 0), totalQty becomes 0 instantly.
      const totalQty = (data || []).reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(totalQty);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCart();

    // ⚡ Listen for ALL database events (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel('cart_items_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart_items' },
        () => {
          refreshCart(); // Recalculate count on any DB change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, isShivering, refreshCart, triggerCartAlert }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);