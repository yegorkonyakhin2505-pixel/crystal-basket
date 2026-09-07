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

/** Products related to `p`, best match first: same intention, shared stones, secondary intention, then bestsellers to fill the row. */
export function relatedProducts(p: Product, limit = 4): Product[] {
  const score = (o: Product) =>
    (o.data.intention === p.data.intention ? 4 : 0) +
    o.data.stones.filter((s) => p.data.stones.includes(s)).length * 2 +
    (o.data.secondaryIntentions.includes(p.data.intention) || p.data.secondaryIntentions.includes(o.data.intention) ? 1 : 0) +
    (o.data.bestseller ? 0.5 : 0);
  return getProducts()
    .filter((o) => o.id !== p.id)
    .map((o, i) => ({ o, s: score(o), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.o);
}

export function stackSubtotal(s: Stack): number {
  return s.data.products.map(getProduct).reduce((t, p) => t + p.data.priceAED, 0);
}

function must<T>(v: T | undefined, kind: string, id: string): T {
  if (!v) throw new Error(`Catalog: unknown ${kind} "${id}"`);
  return v;
}
