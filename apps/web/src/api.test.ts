import { vi } from 'vitest';
import { ApiError, createApi } from './api';

describe('createApi', () => {
  it('calls the gateway under /api', async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify([]), { status: 200 }));
    await createApi('/api', fetchFn as unknown as typeof fetch).listProducts();
    expect(fetchFn).toHaveBeenCalledWith('/api/products?page=1&pageSize=20', expect.objectContaining({}));
  });

  it('turns an error answer into ApiError with the message', async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify({ message: 'Order o-9 not found' }), { status: 404 }));
    const api = createApi('/api', fetchFn as unknown as typeof fetch);
    await expect(api.cancelOrder('o-9')).rejects.toEqual(new ApiError(404, 'Order o-9 not found'));
  });
});
