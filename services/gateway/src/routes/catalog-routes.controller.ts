import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UpstreamClient } from '../upstream/upstream.client.js';

/** The public, read-only part of the catalog. Creating products and changing stock stay internal. */
@Controller('products')
export class CatalogRoutesController {
  constructor(private readonly upstream: UpstreamClient) {}

  @Get()
  async list(@Res({ passthrough: true }) res: Response) {
    const reply = await this.upstream.forward('catalog', 'GET', '/products');
    res.status(reply.status);
    return reply.body;
  }

  @Get('search')
  async search(@Query('q') q: string | string[] | undefined, @Res({ passthrough: true }) res: Response) {
    const value = typeof q === 'string' ? q : '';
    const reply = await this.upstream.forward('catalog', 'GET', `/products/search?q=${encodeURIComponent(value)}`);
    res.status(reply.status);
    return reply.body;
  }

  @Get(':id')
  async get(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const reply = await this.upstream.forward('catalog', 'GET', `/products/${encodeURIComponent(id)}`);
    res.status(reply.status);
    return reply.body;
  }
}
