import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import type { CreateOrderInput } from '@t2pr/shared';
import { createOrderSchema } from '@t2pr/shared';
import { ZodValidationPipe } from '../zod-validation.pipe.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list() {
    return this.orders.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.orders.get(id);
  }

  @Post()
  place(@Body(new ZodValidationPipe(createOrderSchema)) body: CreateOrderInput) {
    return this.orders.place(body);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  cancel(@Param('id') id: string) {
    return this.orders.cancel(id);
  }
}
