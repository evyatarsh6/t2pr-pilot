import { Injectable } from '@nestjs/common';
import type { Order } from '@t2pr/shared';

@Injectable()
export class OrdersRepository {
  private readonly orders = new Map<string, Order>();
  private nextId = 1;

  newId(): string {
    return `o-${this.nextId++}`;
  }

  findAll(): Order[] {
    return [...this.orders.values()];
  }

  findById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  save(order: Order): Order {
    this.orders.set(order.id, order);
    return order;
  }
}
