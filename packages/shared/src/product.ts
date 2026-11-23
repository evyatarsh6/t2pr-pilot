import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  description: z.string().max(1000).default(''),
  priceCents: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
});
export type Product = z.infer<typeof productSchema>;

export const createProductSchema = productSchema.omit({ id: true });
export type CreateProductInput = z.input<typeof createProductSchema>;

/** Body of PATCH /products/:id/stock: a positive delta adds stock, a negative one removes it. */
export const adjustStockSchema = z.object({
  delta: z.number().int(),
});
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
