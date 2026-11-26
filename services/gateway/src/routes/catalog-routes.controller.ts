import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { UpstreamClient } from '../upstream/upstream.client.js';

/** The public, read-only part of the catalog. Creating products and changing stock stay internal. */
@Controller('products')
export class CatalogRoutesController {
  constructor(private readonly upstream: UpstreamClient) {}

  @Get()
  async list(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const queryIndex = req.url.indexOf('?');
    const search = queryIndex === -1 ? '' : req.url.slice(queryIndex);
    const reply = await this.upstream.forward('catalog', 'GET', `/products${search}`);
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
