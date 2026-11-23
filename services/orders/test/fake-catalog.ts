import type { Product } from '@t2pr/shared';
import { CatalogClient, CatalogUnavailableError } from '../src/catalog/catalog.client.js';

/** An in-memory catalog for tests: no HTTP, no other service running. */
export class FakeCatalog extends CatalogClient {
  readonly products = new Map<string, Product>();
  down = false;

  constructor(products: Product[]) {
    super();
    for (const p of products) this.products.set(p.id, { ...p });
  }

  async getProduct(id: string): Promise<Product | undefined> {
    if (this.down) throw new CatalogUnavailableError('down');
    return this.products.get(id);
  }

  async adjustStock(id: string, delta: number): Promise<boolean> {
    if (this.down) throw new CatalogUnavailableError('down');
    const p = this.products.get(id);
    if (!p || p.stock + delta < 0) return false;
    p.stock += delta;
    return true;
  }
}

export const sampleProducts = (): Product[] => [
  { id: 'p-1', name: 'Beans', description: '', priceCents: 2490, stock: 5 },
  { id: 'p-2', name: 'Kettle', description: '', priceCents: 5900, stock: 1 },
];
