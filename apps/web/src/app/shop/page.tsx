import type { Metadata } from "next";
import { getIntentions, getProducts, getStones } from "@crystal-basket/catalog";
import { ListingHero } from "@/components/Store/ListingHero";
import { FilterBar } from "@/components/Store/FilterBar";
import { ProductGrid } from "@/components/Store/ProductGrid";
import { breadcrumbLd, itemListLd, ld } from "@/lib/schema";
import { routes } from "@/lib/paths";
import { productImage } from "@/lib/images";

export const metadata: Metadata = { title: "All bracelets", description: "Every Crystal Basket bracelet: natural 8 mm crystal beads strung by intention, delivered next day across the UAE." };

export default function ShopPage() {
  const products = getProducts().sort((a, b) => Number(b.data.bestseller) - Number(a.data.bestseller) || Number(b.data.featured) - Number(a.data.featured));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbLd([["Bracelets", routes.shop]])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(itemListLd("Crystal bracelets", products.map((p) => ({ name: p.data.name, path: routes.product(p.id), image: productImage(p) })))) }} />
      <ListingHero image="/images/hero/hero-2.jpg" crumbs={[["", "Bracelets"]]} title="Crystal bracelets" text="Every piece is natural stone, hand-strung and cleansed before it ships. Whether you are gifting or treating yourself, start with the feeling you want more of." />
      <FilterBar gridId="shop-grid" total={products.length} intentions={getIntentions().map((i) => ({ id: i.id, label: i.data.name }))} stones={getStones().map((s) => ({ id: s.id, label: s.data.name }))} />
      <ProductGrid id="shop-grid" products={products} eagerFirst={4} />
    </>
  );
}
