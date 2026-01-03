import { useState, useEffect, useCallback } from 'react';
import {
  QuoteItem,
  getQuoteCart,
  addToQuoteCart,
  updateQuoteItem,
  removeFromQuoteCart,
  clearQuoteCart,
  getQuoteItemCount,
} from '@/lib/quote-cart';

export function useQuoteCart() {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [itemCount, setItemCount] = useState(0);

  const refreshCart = useCallback(() => {
    setItems(getQuoteCart());
    setItemCount(getQuoteItemCount());
  }, []);

  useEffect(() => {
    refreshCart();
    
    const handleUpdate = () => refreshCart();
    window.addEventListener('quote-cart-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    return () => {
      window.removeEventListener('quote-cart-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshCart]);

  const addItem = useCallback((item: Omit<QuoteItem, 'addedAt'>) => {
    addToQuoteCart(item);
  }, []);

  const updateItem = useCallback(
    (sku: string, color: string, size: string, quantity: number) => {
      updateQuoteItem(sku, color, size, quantity);
    },
    []
  );

  const removeItem = useCallback(
    (sku: string, color: string, size: string) => {
      removeFromQuoteCart(sku, color, size);
    },
    []
  );

  const clear = useCallback(() => {
    clearQuoteCart();
  }, []);

  return {
    items,
    itemCount,
    addItem,
    updateItem,
    removeItem,
    clear,
    refresh: refreshCart,
  };
}
