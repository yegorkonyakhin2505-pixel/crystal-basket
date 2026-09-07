import type { Product } from "@crystal-basket/catalog";
import { ProductTile } from "./ProductTile";

/** Four-up grid with hairline dividers (Swarovski pattern). Each tile carries right/bottom borders so partial rows stay clean. */
export function ProductGrid({ products, eagerFirst = 0, id, empty = "New pieces are being strung. Check back soon." }: { products: Product[]; eagerFirst?: number; id?: string; empty?: string }) {
  if (products.length === 0) return <p className="container-x py-10 text-[14px] text-cb-muted">{empty}</p>;
  return (
    <div id={id} className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-cb-line">
      {products.map((p, i) => <ProductTile key={p.id} product={p} eager={i < eagerFirst} />)}
    </div>
  );
}
