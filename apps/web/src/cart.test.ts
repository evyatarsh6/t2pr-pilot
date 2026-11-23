import type { Product } from '@t2pr/shared';
import { addToCart, cartItems, cartTotalCents, removeFromCart } from './cart';

const kettle: Product = { id: 'p-2', name: 'Kettle', description: '', priceCents: 5900, stock: 2 };
const mug: Product = { id: 'p-3', name: 'Mug', description: '', priceCents: 1450, stock: 10 };

describe('cart', () => {
  it('adds units up to the stock', () => {
    let cart = addToCart({}, kettle);
    cart = addToCart(cart, kettle);
    cart = addToCart(cart, kettle);
    expect(cart).toEqual({ 'p-2': 2 });
  });

  it('totals and lists items', () => {
    const cart = addToCart(addToCart({}, kettle), mug);
    expect(cartTotalCents(cart, [kettle, mug])).toBe(7350);
    expect(cartItems(cart)).toEqual([
      { productId: 'p-2', quantity: 1 },
      { productId: 'p-3', quantity: 1 },
    ]);
  });

  it('removes a product', () => {
    expect(removeFromCart({ 'p-2': 1, 'p-3': 2 }, 'p-2')).toEqual({ 'p-3': 2 });
  });
});
