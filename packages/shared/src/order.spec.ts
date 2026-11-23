import { createOrderSchema, orderTotal } from './order.js';
import { formatCents } from './money.js';

describe('createOrderSchema', () => {
  it('accepts a valid order', () => {
    const parsed = createOrderSchema.safeParse({
      customerEmail: 'dana@example.com',
      items: [{ productId: 'p-1', quantity: 2 }],
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects an empty item list and a bad email', () => {
    const parsed = createOrderSchema.safeParse({ customerEmail: 'not-an-email', items: [] });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const paths = parsed.error.issues.map((i) => i.path.join('.'));
      expect(paths).toEqual(expect.arrayContaining(['customerEmail', 'items']));
    }
  });
});

describe('orderTotal', () => {
  it('sums line totals in cents', () => {
    expect(orderTotal([{ lineTotalCents: 250 }, { lineTotalCents: 1999 }])).toBe(2249);
  });
});

describe('formatCents', () => {
  it('formats cents as dollars', () => {
    expect(formatCents(123456)).toBe('$1,234.56');
  });
});
