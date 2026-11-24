import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import type { AdjustStockInput, CreateProductInput } from '@t2pr/shared';
import { adjustStockSchema, createProductSchema } from '@t2pr/shared';
import { z } from 'zod';
import { ZodValidationPipe } from '../zod-validation.pipe.js';
import { ProductsService } from './products.service.js';

const searchQuerySchema = z.string().min(1).max(50);

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list() {
    return this.products.list();
  }

  @Get('search')
  search(@Query('q', new ZodValidationPipe(searchQuerySchema)) q: string) {
    return this.products.search(q);
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
