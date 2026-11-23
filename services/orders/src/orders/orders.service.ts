import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { CreateOrderInput, Order, OrderLine } from '@t2pr/shared';
import { orderTotal } from '@t2pr/shared';
import { CatalogClient, CatalogUnavailableError } from '../catalog/catalog.client.js';
import { OrdersRepository } from './orders.repository.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly catalog: CatalogClient,
    private readonly repo: OrdersRepository,
  ) {}

  list(): Order[] {
    return this.repo.findAll();
  }

  get(id: string): Order {
    const order = this.repo.findById(id);
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  /**
   * Places an order: looks every product up, reserves its stock in the catalog, and stores the order.
   * If any reservation fails, the ones already made are given back, so a refused order leaves stock as it was.
   */
  async place(input: CreateOrderInput): Promise<Order> {
    const items = mergeDuplicateItems(input.items);
    const lines: OrderLine[] = [];
    const reserved: { productId: string; quantity: number }[] = [];
    try {
      for (const item of items) {
        const product = await this.catalog.getProduct(item.productId);
        if (!product) throw new BadRequestException(`Unknown product ${item.productId}`);
        const ok = await this.catalog.adjustStock(product.id, -item.quantity);
        if (!ok) throw new ConflictException(`Not enough stock for ${product.name}`);
        reserved.push({ productId: product.id, quantity: item.quantity });
        lines.push({
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          unitPriceCents: product.priceCents,
          lineTotalCents: product.priceCents * item.quantity,
        });
      }
    } catch (error) {
      await this.release(reserved);
      if (error instanceof CatalogUnavailableError) throw new ServiceUnavailableException('Catalog is unavailable');
      throw error;
    }
    return this.repo.save({
      id: this.repo.newId(),
      customerEmail: input.customerEmail,
      lines,
      totalCents: orderTotal(lines),
      status: 'placed',
      createdAt: new Date().toISOString(),
    });
  }

  /** Cancels a placed order and returns its stock to the catalog. Cancelling twice is refused. */
  async cancel(id: string): Promise<Order> {
    const order = this.get(id);
    if (order.status === 'cancelled') throw new ConflictException(`Order ${id} is already cancelled`);
    await this.release(order.lines);
    return this.repo.save({ ...order, status: 'cancelled' });
  }

  private async release(items: { productId: string; quantity: number }[]): Promise<void> {
    for (const item of items) {
      try {
        await this.catalog.adjustStock(item.productId, item.quantity);
      } catch {
        // Best effort: a lost release only leaves stock lower than it should be; it never oversells.
      }
    }
  }
}

function mergeDuplicateItems(items: CreateOrderInput['items']): CreateOrderInput['items'] {
  const merged = new Map<string, number>();
  for (const item of items) merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
  return [...merged].map(([productId, quantity]) => ({ productId, quantity }));
}
