import type { Intention, Product, Stack } from "@crystal-basket/catalog";
import { asset } from "./paths";

/** Resolve the primary image for a product, or null when photos are pending. */
export function productImage(p: Product, index = 0): string | null {
  const f = p.data.images[index];
  return f ? asset(`/images/products/${p.id}/${f}`) : null;
}
export function intentionImage(i: Intention): string | null {
  return i.data.image ? asset(`/images/intentions/${i.data.image}`) : null;
}
export function stackImage(s: Stack): string | null {
  return s.data.image ? asset(`/images/stacks/${s.data.image}`) : null;
}
