import { formatCents, type Product } from '@t2pr/shared';
import { useState } from 'react';
import { cartTotalCents, type Cart } from '../cart';

interface Props {
  cart: Cart;
  products: Product[];
  busy: boolean;
  onRemove(productId: string): void;
  onCheckout(email: string): void;
}

export function CartPanel({ cart, products, busy, onRemove, onCheckout }: Props) {
  const [email, setEmail] = useState('');
  const lines = products.filter((p) => cart[p.id]);
  if (lines.length === 0) return <p className="cart-empty">Your cart is empty.</p>;

  return (
    <section aria-label="Cart">
      <ul>
        {lines.map((p) => (
          <li key={p.id}>
            {p.name} × {cart[p.id]}
            <button type="button" onClick={() => onRemove(p.id)} aria-label={`Remove ${p.name}`}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p>Total: {formatCents(cartTotalCents(cart, products))}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onCheckout(email);
        }}
      >
        <label>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? 'Placing order…' : 'Place order'}
        </button>
      </form>
    </section>
  );
}
