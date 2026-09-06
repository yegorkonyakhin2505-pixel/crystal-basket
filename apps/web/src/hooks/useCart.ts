"use client";
import { useCallback, useEffect, useState } from "react";
import { cartCreate, cartFetch, cartLinesAdd, cartLinesRemove, findVariantId, shopifyEnabled, type Cart } from "@/lib/shopify";

const KEY = "cb-cart-id";
const EVENT = "cb:cart";
let shared: Cart | null = null;
let drawerOpen = false;

function broadcast() { window.dispatchEvent(new Event(EVENT)); }

/** Shopify-backed cart shared across islands. No-op when Shopify is not configured. */
export function useCart() {
  const [cart, setCart] = useState<Cart | null>(shared);
  const [open, setOpen] = useState(drawerOpen);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => { setCart(shared); setOpen(drawerOpen); };
    window.addEventListener(EVENT, sync);
    if (shopifyEnabled && !shared) {
      const id = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();
      if (id) cartFetch(id).then((c) => { shared = c; if (!c) localStorage.removeItem(KEY); broadcast(); }).catch(() => {});
    }
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const persist = (c: Cart) => { shared = c; try { localStorage.setItem(KEY, c.id); } catch {} broadcast(); };
  const show = useCallback((v: boolean) => { drawerOpen = v; broadcast(); }, []);

  const add = useCallback(async (items: { handle: string; beadMm: number; size: string; quantity?: number }[]) => {
    if (!shopifyEnabled) return;
    setBusy(true); setError(null);
    try {
      const lines = await Promise.all(items.map(async (i) => ({ merchandiseId: await findVariantId(i.handle, i.beadMm, i.size), quantity: i.quantity ?? 1 })));
      const next = shared ? await cartLinesAdd(shared.id, lines) : await cartCreate(lines);
      persist(next); show(true);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }, [show]);

  const remove = useCallback(async (lineId: string) => {
    if (!shared) return;
    setBusy(true);
    try { persist(await cartLinesRemove(shared.id, [lineId])); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }, []);

  return { enabled: shopifyEnabled, cart, count: cart?.totalQuantity ?? 0, open, show, add, remove, busy, error };
}
