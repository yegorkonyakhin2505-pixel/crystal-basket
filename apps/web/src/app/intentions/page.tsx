import type { Metadata } from "next";
import { ListingHero } from "@/components/Store/ListingHero";
import { CategoryGrid } from "@/components/Store/CategoryGrid";
export const metadata: Metadata = { title: "Shop by intention", description: "Protection, love, abundance, calm, confidence, focus, grounding, sleep. Find the crystal bracelet for what you need more of." };
export default function IntentionsPage() {
  return (
    <>
      <ListingHero image="/images/intentions/calm.jpg" crumbs={[["", "Intentions"]]} title="Start with what you need" text="Eight intentions. Each has a small family of stones traditionally worn for it. Pick the feeling, and the bracelet follows." />
      <section className="bg-cb-band py-10 md:py-14"><div className="container-x"><CategoryGrid /></div></section>
    </>
  );
}
