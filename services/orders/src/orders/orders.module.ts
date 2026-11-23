import { Module } from '@nestjs/common';
import { CatalogClient, HttpCatalogClient } from '../catalog/catalog.client.js';
import { OrdersController } from './orders.controller.js';
import { OrdersRepository } from './orders.repository.js';
import { OrdersService } from './orders.service.js';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, { provide: CatalogClient, useClass: HttpCatalogClient }],
})
export class OrdersModule {}
