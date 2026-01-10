// Quote Cart Management (localStorage)

export interface QuoteItem {
  sku: string;
  name: string;
  brand: string;
  image: string;
  color: string;
  colorCode?: string;
  size: string;
  quantity: number;
  addedAt: string;
  // Marquage options
  markingType?: string;
  markingLocation?: string;
  markingNotes?: string;
}

const CART_KEY = 'j2l-quote-cart';

export function getQuoteCart(): QuoteItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CART_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addToQuoteCart(item: Omit<QuoteItem, 'addedAt'>): QuoteItem[] {
  const cart = getQuoteCart();
  
  // Check if same product with same variant exists
  const existingIndex = cart.findIndex(
    i => i.sku === item.sku && i.color === item.color && i.size === item.size
  );
  
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push({
      ...item,
      addedAt: new Date().toISOString(),
    });
  }
  
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('quote-cart-updated'));
  return cart;
}

export function updateQuoteItem(
  sku: string,
  color: string,
  size: string,
  quantity: number
): QuoteItem[] {
  const cart = getQuoteCart();
  const index = cart.findIndex(
    i => i.sku === sku && i.color === color && i.size === size
  );
  
  if (index >= 0) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
  }
  
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('quote-cart-updated'));
  return cart;
}

export function removeFromQuoteCart(
  sku: string,
  color: string,
  size: string
): QuoteItem[] {
  const cart = getQuoteCart();
  const filtered = cart.filter(
    i => !(i.sku === sku && i.color === color && i.size === size)
  );
  localStorage.setItem(CART_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('quote-cart-updated'));
  return filtered;
}

export function clearQuoteCart(): void {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('quote-cart-updated'));
}

export function getQuoteItemCount(): number {
  return getQuoteCart().reduce((sum, item) => sum + item.quantity, 0);
}
