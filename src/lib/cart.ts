// Shopping Cart Management (localStorage)

export interface CartItem {
  sku: string;
  name: string;
  brand: string;
  image: string;
  color: string;
  colorCode?: string;
  size: string;
  quantity: number;
  priceHT: number;
  addedAt: string;
  // Marquage options
  markingType?: string;
  markingLocation?: string;
  markingNotes?: string;
}

const CART_KEY = 'j2l-shopping-cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CART_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addToCart(item: Omit<CartItem, 'addedAt'>): CartItem[] {
  const cart = getCart();
  
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
  window.dispatchEvent(new Event('cart-updated'));
  return cart;
}

export function updateCartItem(
  sku: string,
  color: string,
  size: string,
  quantity: number
): CartItem[] {
  const cart = getCart();
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
  window.dispatchEvent(new Event('cart-updated'));
  return cart;
}

export function removeFromCart(
  sku: string,
  color: string,
  size: string
): CartItem[] {
  const cart = getCart();
  const filtered = cart.filter(
    i => !(i.sku === sku && i.color === color && i.size === size)
  );
  localStorage.setItem(CART_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('cart-updated'));
  return filtered;
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cart-updated'));
}

export function getCartItemCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(): { totalHT: number; totalTTC: number } {
  const items = getCart();
  const totalHT = items.reduce((sum, item) => sum + (item.priceHT * item.quantity), 0);
  const totalTTC = totalHT * 1.2; // TVA 20%
  return { totalHT, totalTTC };
}
