import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('catalog API', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health', async () => {
    await request(app.getHttpServer()).get('/health').expect(200, { status: 'ok', service: 'catalog' });
  });

  it('GET /products returns the catalog', async () => {
    const res = await request(app.getHttpServer()).get('/products').expect(200);
    expect(res.body.map((p: { id: string }) => p.id)).toEqual(['p-1', 'p-2', 'p-3']);
  });

  it('GET /products/:id answers 404 for an unknown product', async () => {
    await request(app.getHttpServer()).get('/products/p-999').expect(404);
  });

  it('POST /products validates the body', async () => {
    const res = await request(app.getHttpServer()).post('/products').send({ name: '', priceCents: -1 }).expect(400);
    const paths = res.body.issues.map((i: { path: string }) => i.path);
    expect(paths).toEqual(expect.arrayContaining(['name', 'priceCents', 'stock']));
  });

  it('POST /products creates a product', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .send({ name: 'Milk jug', priceCents: 1900, stock: 8 })
      .expect(201);
    expect(res.body).toMatchObject({ id: 'p-4', name: 'Milk jug' });
  });

  it('PATCH /products/:id/stock answers 409 when stock would go negative', async () => {
    await request(app.getHttpServer()).patch('/products/p-2/stock').send({ delta: -50 }).expect(409);
  });
});
