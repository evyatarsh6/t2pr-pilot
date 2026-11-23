import { BadRequestException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { FakeCatalog, sampleProducts } from '../../test/fake-catalog.js';
import { OrdersRepository } from './orders.repository.js';
import { OrdersService } from './orders.service.js';

describe('OrdersService', () => {
  let catalog: FakeCatalog;
  let service: OrdersService;

  beforeEach(() => {
    catalog = new FakeCatalog(sampleProducts());
    service = new OrdersService(catalog, new OrdersRepository());
  });

  it('places an order, prices it from the catalog and reserves stock', async () => {
    const order = await service.place({
      customerEmail: 'dana@example.com',
      items: [
        { productId: 'p-1', quantity: 2 },
        { productId: 'p-2', quantity: 1 },
      ],
    });
    expect(order).toMatchObject({ id: 'o-1', status: 'placed', totalCents: 2 * 2490 + 5900 });
    expect(catalog.products.get('p-1')?.stock).toBe(3);
    expect(catalog.products.get('p-2')?.stock).toBe(0);
  });

  it('merges repeated items into one line', async () => {
    const order = await service.place({
      customerEmail: 'dana@example.com',
      items: [
        { productId: 'p-1', quantity: 1 },
        { productId: 'p-1', quantity: 2 },
      ],
    });
    expect(order.lines).toHaveLength(1);
    expect(order.lines[0]?.quantity).toBe(3);
  });

  it('gives reserved stock back when a later item has too little stock', async () => {
    await expect(
      service.place({
        customerEmail: 'dana@example.com',
        items: [
          { productId: 'p-1', quantity: 2 },
          { productId: 'p-2', quantity: 2 },
        ],
      }),
    ).rejects.toThrow(ConflictException);
    expect(catalog.products.get('p-1')?.stock).toBe(5);
    expect(service.list()).toHaveLength(0);
  });

  it('refuses an unknown product', async () => {
    await expect(
      service.place({ customerEmail: 'dana@example.com', items: [{ productId: 'nope', quantity: 1 }] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('answers 503 when the catalog is down', async () => {
    catalog.down = true;
    await expect(
      service.place({ customerEmail: 'dana@example.com', items: [{ productId: 'p-1', quantity: 1 }] }),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('cancels an order once and returns its stock', async () => {
    const order = await service.place({ customerEmail: 'dana@example.com', items: [{ productId: 'p-1', quantity: 4 }] });
    const cancelled = await service.cancel(order.id);
    expect(cancelled.status).toBe('cancelled');
    expect(catalog.products.get('p-1')?.stock).toBe(5);
    await expect(service.cancel(order.id)).rejects.toThrow(ConflictException);
  });
});
