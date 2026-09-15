import type { Metadata } from "next";
import Link from "next/link";
import { getStones } from "@crystal-basket/catalog";
import { PageIntro } from "@/components/Store/PageIntro";
import { routes } from "@/lib/paths";
import { formatReviewed, lastCommitDate, sources } from "@/lib/git-date";

const description = "How to cleanse and care for a crystal bracelet: moonlight, selenite and smoke, how often to do it, and which stones to keep out of water and sun.";
export const metadata: Metadata = { title: "How to Cleanse a Crystal Bracelet", description, openGraph: { title: "How to Cleanse a Crystal Bracelet", description } };

const methods: [string, string][] = [
  ["Moonlight", "Leave the bracelet on a windowsill overnight, ideally around the full moon. Safe for every stone."],
  ["Selenite", "Rest it on a selenite plate for a few hours. Our studio method."],
  ["Smoke", "Pass it through the smoke of palo santo, sage or oud a few times."],
];
const everyday = [
  "Roll the bracelet on and off over the hand instead of stretching it wide.",
  "Take it off for showers, swimming, the gym and the beach.",
  "Put it on after perfume, sunscreen and lotion, not before.",
  "Store it flat in its pouch, away from jewellery that could scratch it.",
  "Stretch cord is a wear part. If it ever gives, we restring it for free.",
];

export default function CarePage() {
  const stones = getStones();
  const noWater = stones.filter((s) => !s.data.waterSafe);
  const noSun = stones.filter((s) => !s.data.sunSafe);
  const names = (list: typeof stones) => list.map((s, i) => <span key={s.id}>{i > 0 && ", "}<Link href={routes.stone(s.id)} prefetch={false} className="underline underline-offset-4 hover:text-cb-rose">{s.data.name}</Link></span>);
  return (
    <>
      <PageIntro heading="How to cleanse a crystal bracelet" tagline="A monthly ritual, five minutes long." reviewed={formatReviewed(lastCommitDate(sources.page("care")))}>
        <p>Cleanse a crystal bracelet when it arrives and about once a month after that. Moonlight, a selenite plate and smoke all work for every stone we sell. Whatever you believe cleansing does energetically, it is also the moment you check the cord, wipe the beads and remember the intention you bought it for.</p>
      </PageIntro>
      <section className="container-x pb-12 max-w-5xl">
        <h2 className="text-3xl md:text-[2.25rem] mb-5">Which cleansing methods are safe?</h2>
        <div className="grid md:grid-cols-3 gap-px bg-cb-line border border-cb-line">{methods.map(([t, s]) => <div key={t} className="bg-white p-6"><h3 className="font-display text-2xl">{t}</h3><p className="text-[13px] text-cb-muted mt-2">{s}</p></div>)}</div>
      </section>
      <section className="container-x pb-12 max-w-5xl">
        <h2 className="text-3xl md:text-[2.25rem] mb-5">Which crystals should stay out of water and sun?</h2>
        <div className="grid md:grid-cols-2 gap-px bg-cb-line border border-cb-line">
          <div className="bg-white p-6"><h3 className="label-caps mb-2">Keep out of water</h3><p className="text-[14px]">{names(noWater)}</p><p className="text-[12px] text-cb-muted mt-2">Softer, porous or iron-bearing stones that dull, rust or tarnish when wet. Cleanse them with smoke, selenite or moonlight.</p></div>
          <div className="bg-white p-6"><h3 className="label-caps mb-2">Keep out of long sun</h3><p className="text-[14px]">{names(noSun)}</p><p className="text-[12px] text-cb-muted mt-2">Their colour fades after hours of direct sun. A few minutes is fine.</p></div>
        </div>
      </section>
      <section className="container-x pb-20 max-w-3xl">
        <h2 className="text-3xl md:text-[2.25rem] mb-4">How do you make a crystal bracelet last?</h2>
        <ul className="space-y-2 text-[14px] list-disc list-outside pl-5">{everyday.map((t) => <li key={t}>{t}</li>)}</ul>
        <p className="text-[13px] text-cb-muted mt-6">Each stone page lists its own care notes. See the <Link href={routes.stones} className="underline underline-offset-4 hover:text-cb-rose">stone library</Link> or the <Link href={routes.faq} className="underline underline-offset-4 hover:text-cb-rose">FAQ</Link>.</p>
      </section>
    </>
  );
}
