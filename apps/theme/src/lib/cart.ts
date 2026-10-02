"use client";
import { useCallback, useEffect, useState } from "react";
import { site } from "./config";

/**
 * Shopify cart for the theme, through the same-origin Ajax API (/cart.js, /cart/add.js, /cart/change.js,
 * /products/<handle>.js). Same shapes and `useCart()` surface as apps/web (hooks/useCart.ts + lib/shopify.ts),
 * so the ported islands (BuyBox, CartDrawer, StackBuilder, BraceletBuilder) work unchanged.
 */
export const FRIENDLY_ERROR = "We couldn't reach the shop just now. Please try again in a moment.";

/** Kept for API parity: the theme cart never expires mid-session, but callers may still catch it. */
export class CartGoneError extends Error {
  constructor() { super("Your bag had expired, so we started a new one."); this.name = "CartGoneError"; }
}

export interface CartLine { id: string; quantity: number; title: string; variantTitle: string; handle: string; priceAED: number; image?: string; variantGid: string; productGid: string; vendor: string; attributes: { key: string; value: string }[] }
export interface LineInput { merchandiseId: string; quantity: number; attributes?: { key: string; value: string }[] }
export interface Cart { id: string; checkoutUrl: string; totalQuantity: number; subtotalAED: number; lines: CartLine[] }

interface AjaxItem { key: string; variant_id: number; product_id: number; quantity: number; product_title: string; variant_title: string | null; handle: string; price: number; image: string | null; vendor: string; properties: Record<string, string> | null }
interface AjaxCart { token: string; item_count: number; items_subtotal_price: number; items: AjaxItem[] }
interface AjaxVariant { id: number; title: string; available: boolean; options: string[] }
interface AjaxProduct { options: { name: string; position: number }[]; variants: AjaxVariant[] }

const ROOT = (typeof window !== "undefined" && (window as unknown as { Shopify?: { routes?: { root?: string } } }).Shopify?.routes?.root) || "/";
const url = (path: string) => `${ROOT.replace(/\/$/, "")}${path}`;
const gidVariant = (id: number) => `gid://shopify/ProductVariant/${id}`;
const gidProduct = (id: number) => `gid://shopify/Product/${id}`;
const variantNumericId = (merchandiseId: string) => Number(merchandiseId.replace(/^gid:\/\/shopify\/ProductVariant\//, ""));

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try { res = await fetch(url(path), { credentials: "same-origin", headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) }, ...init }); }
  catch (e) { console.error("Cart request failed", e); throw new Error(FRIENDLY_ERROR); }
  const json = (await res.json().catch(() => ({}))) as T & { description?: string; message?: string };
  if (!res.ok) throw new Error(json.description || json.message || FRIENDLY_ERROR);
  return json;
}

function shape(c: AjaxCart): Cart {
  return {
    id: c.token,
    checkoutUrl: site.routes.checkout,
    totalQuantity: c.item_count,
    subtotalAED: c.items_subtotal_price / 100,
    lines: c.items.map((l) => ({
      id: l.key, quantity: l.quantity, title: l.product_title, variantTitle: l.variant_title ?? "", handle: l.handle,
      priceAED: l.price / 100, image: l.image ?? undefined, variantGid: gidVariant(l.variant_id), productGid: gidProduct(l.product_id),
      vendor: l.vendor, attributes: Object.entries(l.properties ?? {}).filter(([k]) => !k.startsWith("_")).map(([key, value]) => ({ key, value: String(value) })),
    })),
  };
}

const products = new Map<string, Promise<AjaxProduct>>();
const loadProduct = (handle: string) => {
  if (!products.has(handle)) products.set(handle, call<AjaxProduct>(`/products/${handle}.js`).catch((e) => { products.delete(handle); throw e; }));
  return products.get(handle)!;
};
const norm = (s: string) => s.trim().toLowerCase();

/** Resolve the variant for a product handle + wrist size ("Wrist size" option, values "S · 16 cm" etc.). */
export async function findVariantId(handle: string, size: string): Promise<string> {
  const p = await loadProduct(handle);
  const idx = p.options.findIndex((o) => norm(o.name).startsWith("wrist"));
  const v = p.variants.find((n) => (idx >= 0 ? n.options[idx] : n.title).trim().toUpperCase().startsWith(size.toUpperCase()) && n.available);
  if (!v) throw new Error("This size is not available online yet. Message us and we will string it for you.");
  return gidVariant(v.id);
}

/** Resolve a variant by every option it must match (e.g. Wrist size, Stones, Gold bead), for the custom bracelet. */
export async function findVariantByOptions(handle: string, wanted: Record<string, string>): Promise<string> {
  const p = await loadProduct(handle);
  const v = p.variants.find((n) =>
    Object.entries(wanted).every(([name, value]) => {
      const idx = p.options.findIndex((o) => norm(o.name) === norm(name));
      if (idx < 0) return false;
      const have = norm(n.options[idx] ?? "");
      return have === norm(value) || have.startsWith(norm(value));
    }),
  );
  if (!v) throw new Error("This design is not available online yet. Email us the design and we will string it for you.");
  return gidVariant(v.id);
}

export async function cartFetch(): Promise<Cart> { return shape(await call<AjaxCart>("/cart.js")); }
export async function cartLinesAdd(lines: LineInput[]): Promise<Cart> {
  await call("/cart/add.js", { method: "POST", body: JSON.stringify({ items: lines.map((l) => ({ id: variantNumericId(l.merchandiseId), quantity: l.quantity, properties: l.attributes?.length ? Object.fromEntries(l.attributes.map((a) => [a.key, a.value])) : undefined })) }) });
  return cartFetch();
}
export async function cartLinesRemove(lineIds: string[]): Promise<Cart> {
  let cart: AjaxCart | null = null;
  for (const id of lineIds) cart = await call<AjaxCart>("/cart/change.js", { method: "POST", body: JSON.stringify({ id, quantity: 0 }) });
  return cart ? shape(cart) : cartFetch();
}

export type AddItem = { handle: string; size: string; quantity?: number } | { merchandiseId: string; quantity?: number; attributes?: { key: string; value: string }[] };

const EVENT = "cb:cart";
let shared: Cart | null = null;
let drawerOpen = false;
let restoring: Promise<Cart | null> | null = null;
function broadcast() { window.dispatchEvent(new Event(EVENT)); }
function persist(c: Cart) { shared = c; broadcast(); }
function restore(): Promise<Cart | null> {
  if (shared) return Promise.resolve(shared);
  if (!restoring) restoring = cartFetch().then((c) => { shared = c; broadcast(); return c; }).catch(() => null).finally(() => { restoring = null; });
  return restoring;
}
export const shopifyEnabled = site.cartEnabled;

/** Shopify-backed cart shared across islands. */
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
    const revalidate = () => { if (!shopifyEnabled || document.visibilityState === "hidden") return; cartFetch().then((c) => { shared = c; broadcast(); }).catch(() => {}); };
    window.addEventListener("pageshow", revalidate);
    document.addEventListener("visibilitychange", revalidate);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("pageshow", revalidate); document.removeEventListener("visibilitychange", revalidate); };
  }, []);

  const show = useCallback((v: boolean) => { drawerOpen = v; broadcast(); }, []);

  const add = useCallback(async (items: AddItem[]) => {
    if (!shopifyEnabled) return;
    setBusy(true); setError(null);
    try {
      const lines: LineInput[] = await Promise.all(items.map(async (i) => "merchandiseId" in i
        ? { merchandiseId: i.merchandiseId, quantity: i.quantity ?? 1, attributes: i.attributes }
        : { merchandiseId: await findVariantId(i.handle, i.size), quantity: i.quantity ?? 1 }));
      persist(await cartLinesAdd(lines)); show(true);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }, [show]);

  const remove = useCallback(async (lineId: string) => {
    setBusy(true); setError(null);
    try { persist(await cartLinesRemove([lineId])); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }, []);

  return { enabled: shopifyEnabled, cart, count: cart?.totalQuantity ?? 0, open, show, add, remove, busy, error };
}
