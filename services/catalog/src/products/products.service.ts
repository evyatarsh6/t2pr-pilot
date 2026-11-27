import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateProductInput, Product } from '@t2pr/shared';
import { createProductSchema } from '@t2pr/shared';
import { ProductsRepository } from './products.repository.js';

@Injectable()
export class ProductsService {
  constructor(private readonly repo: ProductsRepository) {}

  /** All products, or only those whose name contains `q` (case-insensitive) when it is given. */
  list(q?: string): Product[] {
    const all = this.repo.findAll();
    if (!q) return all;
    const needle = q.toLowerCase();
    return all.filter((p) => p.name.toLowerCase().includes(needle));
  }

  get(id: string): Product {
    const product = this.repo.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  create(input: CreateProductInput): Product {
    return this.repo.insert(createProductSchema.parse(input));
  }

  /** Changes stock by `delta`. Stock never goes below zero: such a change is refused with 409. */
  adjustStock(id: string, delta: number): Product {
    const product = this.get(id);
    const stock = product.stock + delta;
    if (stock < 0) {
      throw new ConflictException(`Not enough stock for ${id}: ${product.stock} left, ${-delta} requested`);
    }
    return this.repo.save({ ...product, stock });
  }
}
