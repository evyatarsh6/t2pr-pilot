import type { CreateOrderInput, Order, Product } from '@t2pr/shared';

/** Everything the web app asks of the gateway. Components get it as a prop, so tests pass a fake. */
export interface ShopApi {
  listProducts(q?: string): Promise<Product[]>;
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
    listProducts: (q) => call<Product[]>(q ? `/products?q=${encodeURIComponent(q)}` : '/products'),
    placeOrder: (input) => call<Order>('/orders', { method: 'POST', body: JSON.stringify(input) }),
    listOrders: () => call<Order[]>('/orders'),
    cancelOrder: (id) => call<Order>(`/orders/${encodeURIComponent(id)}/cancel`, { method: 'POST' }),
  };
}
