import type { CreateOrderInput, Order, Product } from '@t2pr/shared';

export interface ProductPage {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
}

/** Everything the web app asks of the gateway. Components get it as a prop, so tests pass a fake. */
export interface ShopApi {
  listProducts(page?: number, pageSize?: number): Promise<ProductPage>;
  placeOrder(input: CreateOrderInput): Promise<Order>;
  listOrders(): Promise<Order[]>;
  cancelOrder(id: string): Promise<Order>;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function createApi(baseUrl = '/api', fetchFn: typeof fetch = fetch): ShopApi {
  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetchFn(`${baseUrl}${path}`, {
      ...init,
      headers: init?.body ? { 'content-type': 'application/json' } : undefined,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(res.status, (body as { message?: string } | null)?.message ?? `HTTP ${res.status}`);
    return body as T;
  }

  return {
    listProducts: (page = 1, pageSize = 20) => call<ProductPage>(`/products?page=${page}&pageSize=${pageSize}`),
    placeOrder: (input) => call<Order>('/orders', { method: 'POST', body: JSON.stringify(input) }),
    listOrders: () => call<Order[]>('/orders'),
    cancelOrder: (id) => call<Order>(`/orders/${encodeURIComponent(id)}/cancel`, { method: 'POST' }),
  };
}
