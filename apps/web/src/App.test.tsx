import type { Order, Product } from '@t2pr/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { App } from './App';
import { ApiError, type ShopApi } from './api';

const products: Product[] = [
  { id: 'p-1', name: 'Beans', description: '', priceCents: 2490, stock: 5 },
  { id: 'p-2', name: 'Kettle', description: '', priceCents: 5900, stock: 0 },
];

function fakeApi(overrides: Partial<ShopApi> = {}): ShopApi {
  const orders: Order[] = [];
  return {
    listProducts: vi.fn(async () => products),
    listOrders: vi.fn(async () => orders),
    placeOrder: vi.fn(async (input) => {
      const order: Order = {
        id: 'o-1',
        customerEmail: input.customerEmail,
        lines: [],
        totalCents: 2490,
        status: 'placed',
        createdAt: new Date().toISOString(),
      };
      orders.push(order);
      return order;
    }),
    cancelOrder: vi.fn(async (id) => ({ ...orders[0]!, id, status: 'cancelled' as const })),
    ...overrides,
  };
}

describe('App', () => {
  it('shows products and disables the ones out of stock', async () => {
    render(<App api={fakeApi()} />);
    expect(await screen.findByText('Beans')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Kettle' })).toBeDisabled();
  });

  it('places an order from the cart', async () => {
    const api = fakeApi();
    const user = userEvent.setup();
    render(<App api={api} />);
    await user.click(await screen.findByRole('button', { name: 'Add Beans' }));
    expect(screen.getByText('Total: $24.90')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Email'), 'dana@example.com');
    await user.click(screen.getByRole('button', { name: 'Place order' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Order o-1 placed.');
    expect(api.placeOrder).toHaveBeenCalledWith({
      customerEmail: 'dana@example.com',
      items: [{ productId: 'p-1', quantity: 1 }],
    });
    expect(await screen.findByRole('button', { name: 'Cancel o-1' })).toBeInTheDocument();
  });

  it('shows the error when the order is refused', async () => {
    const api = fakeApi({
      placeOrder: vi.fn(async () => {
        throw new ApiError(409, 'Not enough stock for Beans');
      }),
    });
    const user = userEvent.setup();
    render(<App api={api} />);
    await user.click(await screen.findByRole('button', { name: 'Add Beans' }));
    await user.type(screen.getByLabelText('Email'), 'dana@example.com');
    await user.click(screen.getByRole('button', { name: 'Place order' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Order failed: Not enough stock for Beans');
  });

  it('shows an error when the shop cannot load', async () => {
    render(<App api={fakeApi({ listProducts: vi.fn(async () => Promise.reject(new Error('HTTP 502'))) })} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the shop: HTTP 502');
  });
});
