import { z } from 'zod';
import type { Cents } from './money.js';

export const orderItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(100),
});

export const createOrderSchema = z.object({
  customerEmail: z.email(),
  items: z.array(orderItemInputSchema).min(1).max(50),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderStatuses = ['placed', 'cancelled'] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export interface OrderLine {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: Cents;
  lineTotalCents: Cents;
}

export interface Order {
  id: string;
  customerEmail: string;
  lines: OrderLine[];
  totalCents: Cents;
  status: OrderStatus;
  createdAt: string;
}

/** Sums the lines of an order. Kept here so the web app shows the same total the service stores. */
export function orderTotal(lines: Pick<OrderLine, 'lineTotalCents'>[]): Cents {
  return lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
}
