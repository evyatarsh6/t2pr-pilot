import { formatCents, type Product } from '@t2pr/shared';

interface Props {
  products: Product[];
  onAdd(product: Product): void;
}

export function ProductList({ products, onAdd }: Props) {
  return (
    <ul className="products">
      {products.map((p) => (
        <li key={p.id}>
          <strong>{p.name}</strong>
          <span>{formatCents(p.priceCents)}</span>
          <small>{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</small>
          <button type="button" disabled={p.stock === 0} onClick={() => onAdd(p)} aria-label={`Add ${p.name}`}>
            Add
          </button>
        </li>
      ))}
    </ul>
  );
}
