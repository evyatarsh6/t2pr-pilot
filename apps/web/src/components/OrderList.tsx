import { formatCents, type Order } from '@t2pr/shared';

interface Props {
  orders: Order[];
  onCancel(id: string): void;
}

export function OrderList({ orders, onCancel }: Props) {
  if (orders.length === 0) return null;
  return (
    <section aria-label="Orders">
      <h2>Your orders</h2>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            {o.id}: {formatCents(o.totalCents)} ({o.status})
            {o.status === 'placed' && (
              <button type="button" onClick={() => onCancel(o.id)} aria-label={`Cancel ${o.id}`}>
                Cancel
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
