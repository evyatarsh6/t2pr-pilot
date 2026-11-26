import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateProductInput, Product } from '@t2pr/shared';
import { createProductSchema } from '@t2pr/shared';
import type { ListProductsQuery } from './list-products.query.js';
import { ProductsRepository } from './products.repository.js';

export interface ProductPage {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
}

@Injectable()
export class ProductsService {
  constructor(private readonly repo: ProductsRepository) {}

  list({ page, pageSize }: ListProductsQuery = { page: 1, pageSize: 20 }): ProductPage {
    const all = this.repo.findAll();
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), page, pageSize, total: all.length };
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
