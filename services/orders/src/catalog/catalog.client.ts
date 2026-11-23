import { Injectable } from '@nestjs/common';
import type { Product } from '@t2pr/shared';

/** What the order service needs from the catalog. Tests replace it with a fake (see test/fake-catalog.ts). */
export abstract class CatalogClient {
  /** The product, or undefined when the catalog does not know it. */
  abstract getProduct(id: string): Promise<Product | undefined>;
  /** Changes stock by `delta`; false when the catalog refused (not enough stock). */
  abstract adjustStock(id: string, delta: number): Promise<boolean>;
}

export class CatalogUnavailableError extends Error {}

/** Talks to the catalog service over HTTP. Its address comes from CATALOG_URL. */
@Injectable()
export class HttpCatalogClient extends CatalogClient {
  private readonly baseUrl = (process.env.CATALOG_URL ?? 'http://localhost:3001').replace(/\/+$/, '');

  async getProduct(id: string): Promise<Product | undefined> {
    const res = await this.call(`/products/${encodeURIComponent(id)}`);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new CatalogUnavailableError(`catalog answered ${res.status}`);
    return (await res.json()) as Product;
  }

  async adjustStock(id: string, delta: number): Promise<boolean> {
    const res = await this.call(`/products/${encodeURIComponent(id)}/stock`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ delta }),
    });
    if (res.status === 409) return false;
    if (!res.ok) throw new CatalogUnavailableError(`catalog answered ${res.status}`);
    return true;
  }

  private async call(path: string, init?: RequestInit): Promise<Response> {
    try {
      return await fetch(`${this.baseUrl}${path}`, { ...init, signal: AbortSignal.timeout(5000) });
    } catch (error) {
      throw new CatalogUnavailableError(`catalog unreachable: ${(error as Error).message}`);
    }
  }
}
