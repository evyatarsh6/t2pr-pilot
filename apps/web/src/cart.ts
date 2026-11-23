import type { Product } from '@t2pr/shared';

export type Cart = Record<string, number>;

/** Adds one unit, never more than the product's stock. */
export function addToCart(cart: Cart, product: Product): Cart {
  const current = cart[product.id] ?? 0;
  if (current >= product.stock) return cart;
  return { ...cart, [product.id]: current + 1 };
}

export function removeFromCart(cart: Cart, productId: string): Cart {
  const { [productId]: _removed, ...rest } = cart;
  return rest;
}

export function cartTotalCents(cart: Cart, products: Product[]): number {
  return products.reduce((sum, p) => sum + (cart[p.id] ?? 0) * p.priceCents, 0);
}

export function cartItems(cart: Cart): { productId: string; quantity: number }[] {
  return Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
}
