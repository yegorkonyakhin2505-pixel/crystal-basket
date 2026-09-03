import type { Metadata } from "next";
import { getProducts, getStone } from "@crystal-basket/catalog";
import { WishlistClient } from "@/components/Store/WishlistClient";
import { productImage } from "@/lib/images";
export const metadata: Metadata = { title: "Wishlist" };
export default function WishlistPage() {
  const items = getProducts().map((p) => ({ id: p.id, name: p.data.name, stones: p.data.stones.map((s) => getStone(s).data.name).join(", "), priceAED: p.data.priceAED, image: productImage(p) }));
  return (
    <section className="container-x pt-12 md:pt-20 pb-20">
      <p className="label-caps mb-3">Wishlist</p><h1 className="text-4xl md:text-[3rem] mb-10">Saved for later</h1>
      <WishlistClient items={items} />
    </section>
  );
}
