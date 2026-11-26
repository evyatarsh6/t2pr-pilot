import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository.js';
import { ProductsService } from './products.service.js';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    service = new ProductsService(new ProductsRepository());
  });

  it('lists the seeded products', () => {
    expect(service.list().items).toHaveLength(3);
  });

  it('creates a product with a new id', () => {
    const created = service.create({ name: 'Grinder', priceCents: 8900, stock: 5 });
    expect(created).toMatchObject({ id: 'p-4', name: 'Grinder', description: '' });
    expect(service.get('p-4')).toEqual(created);
  });

  it('throws NotFound for an unknown id', () => {
    expect(() => service.get('nope')).toThrow(NotFoundException);
  });

  it('adjusts stock up and down', () => {
    expect(service.adjustStock('p-2', 3).stock).toBe(15);
    expect(service.adjustStock('p-2', -15).stock).toBe(0);
  });

  it('refuses to take stock below zero', () => {
    expect(() => service.adjustStock('p-2', -13)).toThrow(ConflictException);
    expect(service.get('p-2').stock).toBe(12);
  });
});
