import type { Metadata } from "next";
import { getIntentions, getProducts, getStones } from "@crystal-basket/catalog";
import { ListingHero } from "@/components/Store/ListingHero";
import { FilterBar } from "@/components/Store/FilterBar";
import { ProductGrid } from "@/components/Store/ProductGrid";
import { breadcrumbLd, collectionPageLd, ld } from "@/lib/schema";
import { routes } from "@/lib/paths";
import { stoneImage } from "@/lib/images";
import { site } from "@/lib/site";
import { productImage } from "@/lib/images";

export const metadata: Metadata = { title: "Crystal Bracelets in Dubai", description: "Twelve natural crystal bracelets from 65 AED, hand-strung in Dubai: amethyst, rose quartz, black tourmaline and more. Next-day delivery across the UAE." };

export default function ShopPage() {
  const products = getProducts().sort((a, b) => Number(b.data.inStock) - Number(a.data.inStock) || Number(b.data.bestseller) - Number(a.data.bestseller) || Number(b.data.featured) - Number(a.data.featured));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbLd([["Bracelets", routes.shop]])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(collectionPageLd("Crystal bracelets", routes.shop, "Every Crystal Basket bracelet, hand-strung in Dubai.", products.map((p) => ({ name: p.data.name, path: routes.product(p.id), image: productImage(p) })))) }} />
      <ListingHero image="/images/hero/hero-2.jpg" crumbs={[["", "Bracelets"]]} alt="Crystal bracelets stacked on a wrist" title="Crystal bracelets" text={`Twelve natural crystal bracelets in 8 mm stone, from 65 AED, hand-strung and cleansed in ${site.city} before they ship. Delivery across the UAE is ${site.deliveryFeeAED} AED, free over ${site.freeDeliveryAED} AED, and any three bracelets are ${site.stackDiscountPct}% off as a stack. Start with the feeling you want more of.`} />
      <FilterBar gridId="shop-grid" total={products.length} intentions={getIntentions().map((i) => ({ id: i.id, label: i.data.name }))} stones={getStones().map((s) => ({ id: s.id, label: s.data.name, image: stoneImage(s) }))} />
      <ProductGrid id="shop-grid" products={products} eagerFirst={4} />
    </>
  );
}
