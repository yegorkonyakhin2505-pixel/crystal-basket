"use client";
import { useCallback, useEffect, useState } from "react";
import { CartGoneError, cartCreate, cartFetch, cartLinesAdd, cartLinesRemove, findVariantId, shopifyEnabled, type Cart } from "@/lib/shopify";

const KEY = "cb-cart-id";
const EVENT = "cb:cart";
let shared: Cart | null = null;
let drawerOpen = false;
let restoring: Promise<Cart | null> | null = null;

function broadcast() { window.dispatchEvent(new Event(EVENT)); }
function storedId(): string | null { try { return localStorage.getItem(KEY); } catch { return null; } }
function forget() { shared = null; try { localStorage.removeItem(KEY); } catch {} }
function persist(c: Cart) { shared = c; try { localStorage.setItem(KEY, c.id); } catch {} broadcast(); }

/** Load the cart saved in this browser once, shared by every island; concurrent callers await the same request. */
function restore(): Promise<Cart | null> {
  if (shared) return Promise.resolve(shared);
  const id = storedId();
  if (!id) return Promise.resolve(null);
  if (!restoring) {
    restoring = cartFetch(id)
      .then((c) => { if (c) shared = c; else forget(); broadcast(); return c; })
      .catch(() => null) // keep the stored id; a flaky network must not throw the bag away
      .finally(() => { restoring = null; });
  }
  return restoring;
}

/** Shopify-backed cart shared across islands. No-op when Shopify is not configured. */
export function useCart() {
  const [cart, setCart] = useState<Cart | null>(shared);
  const [open, setOpen] = useState(drawerOpen);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => { setCart(shared); setOpen(drawerOpen); };
    window.addEventListener(EVENT, sync);
    if (shopifyEnabled) restore();
    // Back from checkout (bfcache) or another tab: re-check the bag so a paid cart does not linger.
    const revalidate = () => {
      if (!shopifyEnabled || !shared || document.visibilityState === "hidden") return;
      cartFetch(shared.id).then((c) => { if (c) shared = c; else forget(); broadcast(); }).catch(() => {});
    };
    window.addEventListener("pageshow", revalidate);
    document.addEventListener("visibilitychange", revalidate);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("pageshow", revalidate); document.removeEventListener("visibilitychange", revalidate); };
  }, []);

  const show = useCallback((v: boolean) => { drawerOpen = v; broadcast(); }, []);

  const add = useCallback(async (items: { handle: string; size: string; quantity?: number }[]) => {
    if (!shopifyEnabled) return;
    setBusy(true); setError(null);
    try {
      const lines = await Promise.all(items.map(async (i) => ({ merchandiseId: await findVariantId(i.handle, i.size), quantity: i.quantity ?? 1 })));
      const current = await restore();
      let next: Cart;
      try {
        next = current ? await cartLinesAdd(current.id, lines) : await cartCreate(lines);
      } catch (e) {
        if (!(e instanceof CartGoneError)) throw e;
        forget();
        next = await cartCreate(lines);
      }
      persist(next); show(true);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }, [show]);

  const remove = useCallback(async (lineId: string) => {
    if (!shared) return;
    setBusy(true); setError(null);
    try { persist(await cartLinesRemove(shared.id, [lineId])); }
    catch (e) {
      if (e instanceof CartGoneError) { forget(); broadcast(); }
      else setError((e as Error).message);
    }
    finally { setBusy(false); }
  }, []);

  return { enabled: shopifyEnabled, cart, count: cart?.totalQuantity ?? 0, open, show, add, remove, busy, error };
}
