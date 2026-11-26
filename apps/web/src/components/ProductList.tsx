import { formatCents, type Product } from '@t2pr/shared';

interface Props {
  products: Product[];
  onAdd(product: Product): void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?(page: number): void;
}

export function ProductList({ products, onAdd, page = 1, pageSize = 20, total = 0, onPageChange }: Props) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  return (
    <>
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
    {onPageChange && (
      <nav aria-label="Product pages">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {lastPage}
        </span>
        <button type="button" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </nav>
    )}
    </>
  );
}
