import type { Order, Product } from '@t2pr/shared';
import { useCallback, useEffect, useState } from 'react';
import type { ProductPage, ShopApi } from './api';
import { addToCart, cartItems, removeFromCart, type Cart } from './cart';
import { CartPanel } from './components/CartPanel';
import { OrderList } from './components/OrderList';
import { ProductList } from './components/ProductList';

export function App({ api }: { api: ShopApi }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<Omit<ProductPage, 'items'>>({ page: 1, pageSize: 20, total: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [p, o] = await Promise.all([api.listProducts(page), api.listOrders()]);
      setProducts(p.items);
      setPageInfo({ page: p.page, pageSize: p.pageSize, total: p.total });
      setOrders(o);
      setError(null);
    } catch (e) {
      setError(`Could not load the shop: ${(e as Error).message}`);
    }
  }, [api, page]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function checkout(email: string) {
    setBusy(true);
    setNotice(null);
    try {
      const order = await api.placeOrder({ customerEmail: email, items: cartItems(cart) });
      setCart({});
      setNotice(`Order ${order.id} placed.`);
      setError(null);
      await refresh();
    } catch (e) {
      setError(`Order failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id: string) {
    try {
      await api.cancelOrder(id);
      await refresh();
    } catch (e) {
      setError(`Cancel failed: ${(e as Error).message}`);
    }
  }

  return (
    <main>
      <h1>Brew Supply</h1>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <ProductList
        products={products}
        onAdd={(p) => setCart((c) => addToCart(c, p))}
        page={pageInfo.page}
        pageSize={pageInfo.pageSize}
        total={pageInfo.total}
        onPageChange={setPage}
      />
      <CartPanel
        cart={cart}
        products={products}
        busy={busy}
        onRemove={(id) => setCart((c) => removeFromCart(c, id))}
        onCheckout={checkout}
      />
      <OrderList orders={orders} onCancel={cancel} />
    </main>
  );
}
