import { useState, useEffect, useCallback } from 'react';
import {
  CartItem,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemCount,
  getCartTotal,
} from '@/lib/cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [totals, setTotals] = useState({ totalHT: 0, totalTTC: 0 });

  const refreshCart = useCallback(() => {
    setItems(getCart());
    setItemCount(getCartItemCount());
    setTotals(getCartTotal());
  }, []);

  useEffect(() => {
    refreshCart();
    
    const handleUpdate = () => refreshCart();
    window.addEventListener('cart-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    return () => {
      window.removeEventListener('cart-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshCart]);

  const addItem = useCallback((item: Omit<CartItem, 'addedAt'>) => {
    addToCart(item);
  }, []);

  const updateItem = useCallback(
    (sku: string, color: string, size: string, quantity: number) => {
      updateCartItem(sku, color, size, quantity);
    },
    []
  );

  const removeItem = useCallback(
    (sku: string, color: string, size: string) => {
      removeFromCart(sku, color, size);
    },
    []
  );

  const clear = useCallback(() => {
    clearCart();
  }, []);

  return {
    items,
    itemCount,
    totals,
    addItem,
    updateItem,
    removeItem,
    clear,
    refresh: refreshCart,
  };
}
