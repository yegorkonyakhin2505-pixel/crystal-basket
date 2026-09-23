import type { Metadata } from "next";
import Link from "next/link";
import { BEAD_MM, getIntentions, getStones } from "@crystal-basket/catalog";
import { BraceletBuilder } from "@/components/Store/BraceletBuilder";
import { PageIntro } from "@/components/Store/PageIntro";
import { stoneImage } from "@/lib/images";
import { routes } from "@/lib/paths";
import { site } from "@/lib/site";
import { breadcrumbLd, ld } from "@/lib/schema";
import { formatReviewed, lastCommitDate, sources } from "@/lib/git-date";

const description = `Design your own crystal bracelet bead by bead: choose a wrist size, drop in any of our ${getStones().length} natural stones, add a gold-filled bead, and we string it to order in Dubai from ${site.custom.baseAED} AED.`;
export const metadata: Metadata = { title: "Build Your Own Crystal Bracelet", description, openGraph: { title: "Build Your Own Crystal Bracelet", description } };

const steps: [string, string][] = [
  ["Pick a size", "S, M or L sets how many 8 mm beads fit around your wrist. Not sure? The size guide takes a minute."],
  ["Drop the beads", "Tap a stone and it drops onto the ring. Use the slider to drop several at once, repeat a pattern, or fill the rest in one go."],
  ["We string it", "Your design goes to the studio exactly as you laid it out. Strung on 1 mm stretch cord, cleansed on selenite, and on its way within two working days."],
];

export default function BuildPage() {
  const stones = getStones().map((s) => ({ id: s.id, name: s.data.name, palette: s.data.palette, tier: s.data.tier, keywords: s.data.keywords, waterSafe: s.data.waterSafe, image: stoneImage(s) }));
  const intentions = getIntentions().map((i) => ({ id: i.id, short: i.data.short, stones: i.data.stones }));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbLd([["Build your own", routes.build]])) }} />
      <PageIntro heading="Build your own crystal bracelet" tagline="Your stones, your order, your wrist." reviewed={formatReviewed(lastCommitDate(sources.page("build")))}>
        <p>Every Crystal Basket bracelet is {BEAD_MM} mm natural stone on stretch cord, so anything you design here sits evenly next to the pieces we already string. Choose a size, drop in the stones you want, and we make it to order.</p>
      </PageIntro>
      <section className="container-x pb-16">
        <BraceletBuilder stones={stones} intentions={intentions} pricing={site.custom} />
      </section>
      <section className="container-x pb-16 md:pb-20">
        <h2 className="text-3xl md:text-[2.25rem] mb-6">How does it work?</h2>
        <ol className="grid md:grid-cols-3 gap-px bg-cb-line border border-cb-line">
          {steps.map(([t, s], i) => <li key={t} className="bg-white p-6"><span className="font-display text-3xl text-cb-gold">0{i + 1}</span><h3 className="font-display text-[1.4rem] mt-2">{t}</h3><p className="text-[13px] text-cb-muted mt-2">{s}</p></li>)}
        </ol>
        <p className="text-[13px] text-cb-muted mt-6">Want a head start? The <Link href={routes.stones} prefetch={false} className="underline underline-offset-4 hover:text-cb-rose">stone library</Link> explains what each stone is traditionally worn for, and the <Link href={routes.sizeGuide} className="underline underline-offset-4 hover:text-cb-rose">size guide</Link> helps you measure. Prefer one of ours? <Link href={routes.shop} className="underline underline-offset-4 hover:text-cb-rose">Shop the ready-made bracelets</Link>.</p>
      </section>
    </>
  );
}
