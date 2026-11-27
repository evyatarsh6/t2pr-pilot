import { formatCents, type Product } from '@t2pr/shared';

interface Props {
  products: Product[];
  onAdd(product: Product): void;
  query: string;
  onQueryChange(query: string): void;
}

export function ProductList({ products, onAdd, query, onQueryChange }: Props) {
  return (
    <section>
      <input
        type="search"
        aria-label="Search products"
        placeholder="Search products"
        maxLength={100}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      {products.length === 0 && <p>No products found</p>}
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
    </section>
  );
}
