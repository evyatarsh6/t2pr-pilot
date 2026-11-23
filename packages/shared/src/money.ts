/** Prices are kept in cents, as whole numbers, so sums never pick up floating-point error. */
export type Cents = number;

export function formatCents(cents: Cents, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}
