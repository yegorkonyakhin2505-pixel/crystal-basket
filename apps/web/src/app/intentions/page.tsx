import type { Metadata } from "next";
import { getIntentions } from "@crystal-basket/catalog";
import { ListingHero } from "@/components/Store/ListingHero";
import { CategoryGrid } from "@/components/Store/CategoryGrid";
import { routes } from "@/lib/paths";
import { breadcrumbLd, collectionPageLd, ld } from "@/lib/schema";

export const metadata: Metadata = { title: "Crystal Bracelets by Intention", description: "Protection, love, abundance, calm, confidence, focus, grounding and sleep: find the crystal bracelet traditionally worn for what you need more of." };

export default function IntentionsPage() {
  const intentions = getIntentions();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbLd([["Intentions", routes.intentions]])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(collectionPageLd("Crystal bracelets by intention", routes.intentions, "Eight intentions and the stones traditionally worn for each.", intentions.map((i) => ({ name: i.data.name, path: routes.intention(i.id), image: i.data.image ? `/images/intentions/${i.data.image}` : null })))) }} />
      <ListingHero image="/images/intentions/calm.jpg" alt="Amethyst bracelet on a wrist" crumbs={[["", "Intentions"]]} title="Crystal bracelets by intention" text="Eight intentions, each with a small family of stones traditionally worn for it. Pick the feeling, and the bracelet follows." />
      <section className="bg-cb-band py-10 md:py-14"><div className="container-x"><CategoryGrid /></div></section>
    </>
  );
}
