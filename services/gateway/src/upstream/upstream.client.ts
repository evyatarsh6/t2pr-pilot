import { Injectable } from '@nestjs/common';

export type UpstreamService = 'catalog' | 'orders';

export interface UpstreamReply {
  status: number;
  body: unknown;
}

/** Forwards a request to one of the services behind the gateway. Tests replace it with a fake. */
export abstract class UpstreamClient {
  abstract forward(service: UpstreamService, method: string, path: string, body?: unknown): Promise<UpstreamReply>;
}

const DEFAULT_URLS: Record<UpstreamService, string> = {
  catalog: 'http://localhost:3001',
  orders: 'http://localhost:3002',
};

/** Service addresses come from CATALOG_URL and ORDERS_URL. A service that does not answer gives 502. */
@Injectable()
export class HttpUpstreamClient extends UpstreamClient {
  private readonly urls: Record<UpstreamService, string> = {
    catalog: (process.env.CATALOG_URL ?? DEFAULT_URLS.catalog).replace(/\/+$/, ''),
    orders: (process.env.ORDERS_URL ?? DEFAULT_URLS.orders).replace(/\/+$/, ''),
  };

  async forward(service: UpstreamService, method: string, path: string, body?: unknown): Promise<UpstreamReply> {
    let res: Response;
    try {
      res = await fetch(`${this.urls[service]}${path}`, {
        method,
        headers: body === undefined ? undefined : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      return { status: 502, body: { message: `${service} service is unreachable` } };
    }
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  }
}
