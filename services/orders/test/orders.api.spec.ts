import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { CatalogClient } from '../src/catalog/catalog.client.js';
import { FakeCatalog, sampleProducts } from './fake-catalog.js';

describe('orders API', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CatalogClient)
      .useValue(new FakeCatalog(sampleProducts()))
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /orders places an order', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .send({ customerEmail: 'dana@example.com', items: [{ productId: 'p-1', quantity: 1 }] })
      .expect(201);
    expect(res.body).toMatchObject({ id: 'o-1', totalCents: 2490, status: 'placed' });
    await request(app.getHttpServer()).get('/orders/o-1').expect(200);
  });

  it('POST /orders validates the body', async () => {
    const res = await request(app.getHttpServer()).post('/orders').send({ customerEmail: 'x', items: [] }).expect(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('POST /orders answers 409 when stock is short', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({ customerEmail: 'dana@example.com', items: [{ productId: 'p-2', quantity: 3 }] })
      .expect(409);
  });

  it('POST /orders/:id/cancel cancels the order', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({ customerEmail: 'dana@example.com', items: [{ productId: 'p-1', quantity: 1 }] })
      .expect(201);
    const res = await request(app.getHttpServer()).post('/orders/o-1/cancel').expect(200);
    expect(res.body.status).toBe('cancelled');
  });
});
