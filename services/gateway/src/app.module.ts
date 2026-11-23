import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { CatalogRoutesController } from './routes/catalog-routes.controller.js';
import { OrderRoutesController } from './routes/order-routes.controller.js';
import { HttpUpstreamClient, UpstreamClient } from './upstream/upstream.client.js';

@Module({
  controllers: [HealthController, CatalogRoutesController, OrderRoutesController],
  providers: [{ provide: UpstreamClient, useClass: HttpUpstreamClient }],
})
export class AppModule {}
