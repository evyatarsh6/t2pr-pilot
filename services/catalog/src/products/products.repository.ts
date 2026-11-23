import { Injectable } from '@nestjs/common';
import type { Product } from '@t2pr/shared';

/** In-memory store. The pilot has no database on purpose: every test runs without a network. */
@Injectable()
export class ProductsRepository {
  private readonly products = new Map<string, Product>();
  private nextId = 1;

  constructor() {
    for (const seed of SEED_PRODUCTS) this.insert(seed);
  }

  findAll(): Product[] {
    return [...this.products.values()];
  }

  findById(id: string): Product | undefined {
    return this.products.get(id);
  }

  insert(data: Omit<Product, 'id'>): Product {
    const product: Product = { id: `p-${this.nextId++}`, ...data };
    this.products.set(product.id, product);
    return product;
  }

  save(product: Product): Product {
    this.products.set(product.id, product);
    return product;
  }
}

const SEED_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'Espresso beans, 1 kg', description: 'Dark roast, whole beans.', priceCents: 2490, stock: 40 },
  { name: 'Pour-over kettle', description: 'Gooseneck, 1 litre.', priceCents: 5900, stock: 12 },
  { name: 'Ceramic mug', description: '350 ml, dishwasher safe.', priceCents: 1450, stock: 100 },
];
