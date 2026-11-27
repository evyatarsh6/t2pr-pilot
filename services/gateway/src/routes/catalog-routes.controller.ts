import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UpstreamClient } from '../upstream/upstream.client.js';

/** The public, read-only part of the catalog. Creating products and changing stock stay internal. */
@Controller('products')
export class CatalogRoutesController {
  constructor(private readonly upstream: UpstreamClient) {}

  @Get()
  async list(@Query('q') q: unknown, @Res({ passthrough: true }) res: Response) {
    const path = q === undefined ? '/products' : `/products?q=${encodeURIComponent(String(q))}`;
    const reply = await this.upstream.forward('catalog', 'GET', path);
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
