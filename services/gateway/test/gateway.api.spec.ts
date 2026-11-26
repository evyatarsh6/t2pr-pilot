import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import type { UpstreamReply, UpstreamService } from '../src/upstream/upstream.client.js';
import { UpstreamClient } from '../src/upstream/upstream.client.js';

class FakeUpstream extends UpstreamClient {
  calls: { service: UpstreamService; method: string; path: string; body?: unknown }[] = [];
  reply: UpstreamReply = { status: 200, body: [] };

  async forward(service: UpstreamService, method: string, path: string, body?: unknown): Promise<UpstreamReply> {
    this.calls.push({ service, method, path, body });
    return this.reply;
  }
}

describe('gateway API', () => {
  let app: INestApplication;
  let upstream: FakeUpstream;

  beforeEach(async () => {
    upstream = new FakeUpstream();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(UpstreamClient)
      .useValue(upstream)
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['health'] });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health stays outside /api', async () => {
    await request(app.getHttpServer()).get('/health').expect(200, { status: 'ok', service: 'gateway' });
  });

  it('GET /api/products goes to the catalog', async () => {
    upstream.reply = { status: 200, body: [{ id: 'p-1' }] };
    await request(app.getHttpServer()).get('/api/products').expect(200, [{ id: 'p-1' }]);
    expect(upstream.calls).toEqual([{ service: 'catalog', method: 'GET', path: '/products', body: undefined }]);
  });

  it('GET /api/products forwards the query string', async () => {
    await request(app.getHttpServer()).get('/api/products?page=2&pageSize=5').expect(200);
    expect(upstream.calls[0]?.path).toBe('/products?page=2&pageSize=5');
  });

  it('passes the upstream status through', async () => {
    upstream.reply = { status: 404, body: { message: 'Product p-9 not found' } };
    await request(app.getHttpServer()).get('/api/products/p-9').expect(404);
  });

  it('POST /api/orders forwards the body to the order service', async () => {
    upstream.reply = { status: 201, body: { id: 'o-1' } };
    const order = { customerEmail: 'dana@example.com', items: [{ productId: 'p-1', quantity: 1 }] };
    await request(app.getHttpServer()).post('/api/orders').send(order).expect(201, { id: 'o-1' });
    expect(upstream.calls[0]).toEqual({ service: 'orders', method: 'POST', path: '/orders', body: order });
  });

  it('does not expose product creation', async () => {
    await request(app.getHttpServer()).post('/api/products').send({}).expect(404);
    expect(upstream.calls).toHaveLength(0);
  });
});
