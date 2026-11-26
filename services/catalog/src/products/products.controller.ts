import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import type { AdjustStockInput, CreateProductInput } from '@t2pr/shared';
import { adjustStockSchema, createProductSchema } from '@t2pr/shared';
import { ZodValidationPipe } from '../zod-validation.pipe.js';
import { listProductsQuerySchema, type ListProductsQuery } from './list-products.query.js';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query(new ZodValidationPipe(listProductsQuerySchema)) query: ListProductsQuery) {
    return this.products.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.products.get(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createProductSchema)) body: CreateProductInput) {
    return this.products.create(body);
  }

  @Patch(':id/stock')
  adjustStock(@Param('id') id: string, @Body(new ZodValidationPipe(adjustStockSchema)) body: AdjustStockInput) {
    return this.products.adjustStock(id, body.delta);
  }
}
