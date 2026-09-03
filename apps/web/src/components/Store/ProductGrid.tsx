import type { Product } from "@crystal-basket/catalog";
import { ProductTile } from "./ProductTile";

/** Four-up grid with hairline dividers (Swarovski pattern). Each tile carries right/bottom borders so partial rows stay clean. */
export function ProductGrid({ products, eagerFirst = 0, id }: { products: Product[]; eagerFirst?: number; id?: string }) {
  return (
    <div id={id} className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-cb-line">
      {products.map((p, i) => <ProductTile key={p.id} product={p} eager={i < eagerFirst} />)}
    </div>
  );
}
