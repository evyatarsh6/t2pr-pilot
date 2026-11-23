import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UpstreamClient } from '../upstream/upstream.client.js';

/** Order routes, passed to the order service as they are; the order service validates the bodies. */
@Controller('orders')
export class OrderRoutesController {
  constructor(private readonly upstream: UpstreamClient) {}

  @Get()
  async list(@Res({ passthrough: true }) res: Response) {
    const reply = await this.upstream.forward('orders', 'GET', '/orders');
    res.status(reply.status);
    return reply.body;
  }

  @Get(':id')
  async get(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const reply = await this.upstream.forward('orders', 'GET', `/orders/${encodeURIComponent(id)}`);
    res.status(reply.status);
    return reply.body;
  }

  @Post()
  async place(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const reply = await this.upstream.forward('orders', 'POST', '/orders', body);
    res.status(reply.status);
    return reply.body;
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const reply = await this.upstream.forward('orders', 'POST', `/orders/${encodeURIComponent(id)}/cancel`);
    res.status(reply.status);
    return reply.body;
  }
}
