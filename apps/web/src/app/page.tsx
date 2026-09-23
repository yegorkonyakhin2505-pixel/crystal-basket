import type { Metadata } from "next";
import Link from "next/link";
import { formatAED, getProducts, getStacks, getStones, getIntention, getProduct, stackSubtotal } from "@crystal-basket/catalog";
import { Hero } from "@/components/Store/Hero";
import { CategoryGrid } from "@/components/Store/CategoryGrid";
import { ProductGrid } from "@/components/Store/ProductGrid";
import { TrustStrip } from "@/components/Store/TrustStrip";
import { Testimonials } from "@/components/Store/Testimonials";
import { SectionTitle, ButtonLink } from "@/components/ui";
import { Img } from "@/components/Img";
import { routes, asset } from "@/lib/paths";
import { flags, site } from "@/lib/site";
import { stackImage } from "@/lib/images";

const homeDescription = "Natural crystal bracelets hand-strung in Dubai from 65 AED: amethyst, rose quartz, tiger's eye and more, chosen by intention. Next-day UAE delivery.";
export const metadata: Metadata = { title: { absolute: "Crystal Bracelets Hand-Strung in Dubai | Crystal Basket" }, description: homeDescription, openGraph: { title: "Crystal Bracelets Hand-Strung in Dubai | Crystal Basket", description: homeDescription } };

export default function HomePage() {
  const products = getProducts();
  // Four tiles: bestsellers first, then featured pieces so the row is never left half empty.
  const bestsellers = [...products.filter((p) => p.data.bestseller), ...products.filter((p) => p.data.featured && !p.data.bestseller)].slice(0, 4);
  const fresh = products.filter((p) => p.data.isNew).slice(0, 4);
  const leaving = products.filter((p) => p.data.leavingSoon && p.data.inStock);
  const stoneCount = getStones().length;
  const stacks = getStacks().filter((s) => s.data.featured);
  return (
    <>
      <Hero
        image="/images/hero/hero-1.jpg"
        alt="Natural crystal bracelet on a wrist, hand-strung by Crystal Basket in Dubai"
        headingOnEyebrow
        eyebrow={`Crystal bracelets, hand-strung in ${site.city}`}
        title="Energy you can wear."
        subtitle="Natural crystal bracelets, chosen by intention."
        primary={{ href: routes.shop, label: "Shop bracelets" }}
        secondary={{ href: routes.intentions, label: "Find your intention" }}
        align="left"
      />

      <section className="bg-cb-band py-10 md:py-14">
        <div className="container-x">
          <SectionTitle eyebrow="Shop by intention" title="What do you need more of?" />
          <CategoryGrid />
        </div>
      </section>

      <section className="container-x py-16 md:py-24">
        <SectionTitle eyebrow="Bestsellers" title="Where most people start" />
        <ProductGrid products={bestsellers} />
        <div className="text-center mt-8"><ButtonLink href={routes.shop} variant="outline">View all bracelets</ButtonLink></div>
      </section>

      <TrustStrip />

      <section className="bg-cb-band py-16 md:py-24">
        <div className="container-x grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          <div className="aspect-[3/4] lg:aspect-[4/5] overflow-hidden reveal"><Img src={asset("/images/stacks/stacks-wrist.jpg")} alt="Three crystal bracelets stacked on a wrist" /></div>
          <div className="reveal" style={{ transitionDelay: "100ms" }}>
            <p className="label-caps mb-3">Stacks & sets</p>
            <h2 className="text-3xl md:text-[2.75rem]">Three pieces. One wrist. {site.stackDiscountPct}% off.</h2>
            <p className="text-cb-muted mt-4 max-w-md">Start from a curated stack for one intention, or build your own from any three bracelets. Every stack unlocks the set price.</p>
            <div className="mt-8 grid gap-px bg-cb-line border border-cb-line">
              {stacks.map((s) => {
                const img = stackImage(s);
                return (
                  <Link key={s.id} href={routes.stacks} className="flex items-center gap-4 bg-white p-3 hover:bg-cb-band-2 transition-colors">
                    <div className="h-16 w-16 shrink-0 bg-white">{img ? <Img src={img} alt={s.data.name} /> : null}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-[1.2rem] leading-tight">{s.data.name}</p>
                      <p className="text-[12px] text-cb-muted truncate">{s.data.products.map((p) => getProduct(p).data.name).join(" · ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="price">{formatAED(s.data.priceAED)}</p>
                      <p className="text-[11px] text-cb-faint line-through">{formatAED(stackSubtotal(s))}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <ButtonLink href={routes.stacks} className="mt-6">Build your stack</ButtonLink>
          </div>
        </div>
      </section>

      {leaving.length >= 2 && (
        <section className="bg-cb-band py-16 md:py-24">
          <div className="container-x">
            <SectionTitle eyebrow="Limited edition" title="Leaving soon" text="One-off pieces from the studio, separate from our regular line. We have them in hand today and will not restring them once they sell out." />
          </div>
          <ProductGrid products={leaving} />
          <div className="container-x mt-8 text-center"><ButtonLink href={routes.shop} variant="outline">Shop all bracelets</ButtonLink></div>
        </section>
      )}

      <section className="container-x py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
        <div className="order-2 lg:order-1 reveal">
          <p className="label-caps mb-3">Build your own</p>
          <h2 className="text-3xl md:text-[2.5rem]">Design it bead by bead.</h2>
          <p className="text-cb-muted mt-4 max-w-md">Pick a wrist size, tap a stone and watch it drop onto the ring. Mix any of our {stoneCount} stones, add a gold-filled bead, and we string it to order in Dubai from {site.custom.baseAED} AED.</p>
          <ButtonLink href={routes.build} className="mt-6">Start building</ButtonLink>
        </div>
        <Link href={routes.build} className="order-1 lg:order-2 block overflow-hidden bg-cb-band group" aria-label="Open the bracelet builder">
          <div className="aspect-square transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"><Img src={asset("/images/build/teaser.jpg")} alt="A half-strung bracelet of amethyst, rose quartz, clear quartz and aventurine beads beside dishes of loose beads" sizes="(min-width: 1024px) 50vw, 100vw" /></div>
        </Link>
      </section>

      {fresh.length >= 2 && (
        <section className="container-x py-16 md:py-24">
          <SectionTitle eyebrow="New in" title="Just strung" />
          <ProductGrid products={fresh} />
        </section>
      )}

      <section className="container-x pb-16 md:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
        <div className="order-2 lg:order-1 reveal">
          <p className="label-caps mb-3">Our story</p>
          <h2 className="text-3xl md:text-[2.5rem]">Chosen by hand. Strung one at a time.</h2>
          <p className="text-cb-muted mt-4 max-w-md">Crystal Basket started as a basket of stones on a kitchen table in {site.city}. Every bracelet is still made the same way: natural beads only, graded by eye, strung on premium cord, then rested on selenite before it goes into its linen pouch.</p>
          <p className="text-cb-muted mt-3 max-w-md">Twelve bracelets in 8 mm natural stone, from 65 AED, chosen by what you want more of: calm, love, protection, confidence and more. Delivered across the UAE, usually the next working day, with card or cash on delivery. Crystal meanings describe tradition, not medical advice.</p>
          <ButtonLink href={routes.about} variant="outline" className="mt-6">Read the whole story</ButtonLink>
        </div>
        <div className="order-1 lg:order-2 aspect-[4/3] overflow-hidden reveal"><Img src={asset("/images/about/studio.jpg")} alt="Stringing gemstone beads at the studio table" /></div>
      </section>

      {flags.reviews && <Testimonials />}
    </>
  );
}
