import { loadCatalog } from "./loader";
import type { Intention, Product, Stack, Stone } from "./schemas";

export const getIntentions = (): Intention[] => loadCatalog().intentions;
export const getStones = (): Stone[] => loadCatalog().stones;
export const getProducts = (): Product[] => loadCatalog().products;
export const getStacks = (): Stack[] => loadCatalog().stacks;

export const getIntention = (id: string): Intention => must(getIntentions().find((i) => i.id === id), "intention", id);
export const getStone = (id: string): Stone => must(getStones().find((s) => s.id === id), "stone", id);
export const getProduct = (id: string): Product => must(getProducts().find((p) => p.id === id), "product", id);
export const getStack = (id: string): Stack => must(getStacks().find((s) => s.id === id), "stack", id);

export const productsForIntention = (id: string, includeSecondary = false): Product[] =>
  getProducts().filter((p) => p.data.intention === id || (includeSecondary && p.data.secondaryIntentions.includes(id)));

export const productsForStone = (id: string): Product[] => getProducts().filter((p) => p.data.stones.includes(id));

export const stonesForProduct = (p: Product): Stone[] => p.data.stones.map(getStone);

/** Products related by shared intention or stone, excluding itself. */
export function relatedProducts(p: Product, limit = 4): Product[] {
  return getProducts()
    .filter((o) => o.id !== p.id && (o.data.intention === p.data.intention || o.data.stones.some((s) => p.data.stones.includes(s))))
    .slice(0, limit);
}

export function stackSubtotal(s: Stack): number {
  return s.data.products.map(getProduct).reduce((t, p) => t + p.data.priceAED, 0);
}

function must<T>(v: T | undefined, kind: string, id: string): T {
  if (!v) throw new Error(`Catalog: unknown ${kind} "${id}"`);
  return v;
}
