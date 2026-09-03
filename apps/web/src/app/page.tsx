import Link from "next/link";
import { formatAED, getProducts, getStacks, getIntention, getProduct, stackSubtotal } from "@crystal-basket/catalog";
import { Hero } from "@/components/Store/Hero";
import { CategoryGrid } from "@/components/Store/CategoryGrid";
import { ProductGrid } from "@/components/Store/ProductGrid";
import { TrustStrip } from "@/components/Store/TrustStrip";
import { Testimonials } from "@/components/Store/Testimonials";
import { SectionTitle, ButtonLink } from "@/components/ui";
import { Img } from "@/components/Img";
import { routes, asset } from "@/lib/paths";
import { site } from "@/lib/site";
import { stackImage } from "@/lib/images";

export default function HomePage() {
  const products = getProducts();
  const bestsellers = products.filter((p) => p.data.bestseller).slice(0, 8);
  const fresh = products.filter((p) => p.data.isNew).slice(0, 4);
  const stacks = getStacks().filter((s) => s.data.featured);
  return (
    <>
      <Hero
        image="/images/hero/hero-1.jpg"
        eyebrow={`Hand-strung in ${site.city}`}
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
        <SectionTitle eyebrow="Bestsellers" title="The ones that leave first" />
        <ProductGrid products={bestsellers} eagerFirst={4} />
        <div className="text-center mt-8"><ButtonLink href={routes.shop} variant="outline">View all bracelets</ButtonLink></div>
      </section>

      <TrustStrip />

      <section className="bg-cb-band py-16 md:py-24">
        <div className="container-x grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
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

      {fresh.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <SectionTitle eyebrow="New in" title="Just strung" />
          <ProductGrid products={fresh} />
        </section>
      )}

      <section className="container-x pb-16 md:pb-24 grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
        <div className="order-2 lg:order-1 reveal">
          <p className="label-caps mb-3">Our story</p>
          <h2 className="text-3xl md:text-[2.5rem]">Chosen by hand. Strung one at a time.</h2>
          <p className="text-cb-muted mt-4 max-w-md">Crystal Basket started as a basket of stones on a kitchen table in {site.city}. Every bracelet is still made the same way: natural beads only, graded by eye, strung on premium cord, then rested on selenite before it goes into its linen pouch.</p>
          <ButtonLink href={routes.about} variant="outline" className="mt-6">Read the whole story</ButtonLink>
        </div>
        <div className="order-1 lg:order-2 aspect-[4/3] overflow-hidden reveal"><Img src={asset("/images/about/studio.jpg")} alt="Stringing gemstone beads at the studio table" /></div>
      </section>

      <Testimonials />
    </>
  );
}
