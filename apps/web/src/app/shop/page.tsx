import type { Metadata } from "next";
import { getIntentions, getProducts, getStones } from "@crystal-basket/catalog";
import { ListingHero } from "@/components/Store/ListingHero";
import { FilterBar } from "@/components/Store/FilterBar";
import { ProductGrid } from "@/components/Store/ProductGrid";

export const metadata: Metadata = { title: "All bracelets", description: "Every Crystal Basket bracelet: natural crystal beads strung by intention, 6mm to 10mm, delivered across the UAE." };

export default function ShopPage() {
  const products = getProducts().sort((a, b) => Number(b.data.bestseller) - Number(a.data.bestseller) || Number(b.data.featured) - Number(a.data.featured));
  return (
    <>
      <ListingHero image="/images/hero/hero-2.jpg" crumbs={[["", "Bracelets"]]} title="Crystal bracelets" text="Every piece is natural stone, hand-strung and cleansed before it ships. Whether you are gifting or treating yourself, start with the feeling you want more of." />
      <FilterBar gridId="shop-grid" total={products.length} intentions={getIntentions().map((i) => ({ id: i.id, label: i.data.name }))} stones={getStones().map((s) => ({ id: s.id, label: s.data.name }))} />
      <ProductGrid id="shop-grid" products={products} eagerFirst={4} />
    </>
  );
}
