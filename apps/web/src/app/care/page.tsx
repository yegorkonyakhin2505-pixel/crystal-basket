import type { Metadata } from "next";
import { getStones } from "@crystal-basket/catalog";
export const metadata: Metadata = { title: "Cleanse & care" };
export default function CarePage() {
  const stones = getStones();
  const noWater = stones.filter((s) => !s.data.waterSafe).map((s) => s.data.name);
  const noSun = stones.filter((s) => !s.data.sunSafe).map((s) => s.data.name);
  return (
    <>
      <section className="container-x pt-12 md:pt-20 pb-10 max-w-3xl"><p className="label-caps mb-3">Cleanse & care</p><h1 className="text-4xl md:text-[3.25rem]">A monthly ritual, five minutes long.</h1><p className="text-cb-muted mt-5">Cleansing is the habit of resetting a stone. Whatever you believe it does energetically, it is also when you check the cord, wipe the beads and remember why you bought it.</p></section>
      <section className="container-x pb-12 grid md:grid-cols-3 gap-px bg-cb-line border border-cb-line max-w-5xl">{[["Moonlight", "Leave the bracelet on a windowsill overnight, ideally around the full moon. Safe for every stone."], ["Selenite", "Rest it on a selenite plate for a few hours. Our studio method."], ["Smoke", "Pass it through the smoke of palo santo, sage or oud a few times."]].map(([t, s]) => <div key={t} className="bg-white p-6"><p className="font-display text-2xl">{t}</p><p className="text-[13px] text-cb-muted mt-2">{s}</p></div>)}</section>
      <section className="container-x pb-12 max-w-5xl grid md:grid-cols-2 gap-px bg-cb-line border border-cb-line">
        <div className="bg-white p-6"><p className="label-caps mb-2">Keep out of water</p><p className="text-[14px]">{noWater.join(", ")}</p><p className="text-[12px] text-cb-muted mt-2">Softer or layered stones. Cleanse with smoke, selenite or moonlight.</p></div>
        <div className="bg-white p-6"><p className="label-caps mb-2">Keep out of long sun</p><p className="text-[14px]">{noSun.join(", ")}</p><p className="text-[12px] text-cb-muted mt-2">Colour fades with hours of direct sun. A few minutes is fine.</p></div>
      </section>
      <section className="container-x pb-20 max-w-3xl"><p className="label-caps mb-4">Everyday care</p><ul className="space-y-2 text-[14px]">{["Roll the bracelet on and off over the hand instead of stretching it wide.", "Take it off for showers, swimming, the gym and the beach.", "Put it on after perfume, sunscreen and lotion, not before.", "Store it flat in its pouch, away from jewellery that could scratch it.", "Stretch cord is a wear part. If it ever gives, we restring it for free."].map((t) => <li key={t}>· {t}</li>)}</ul></section>
    </>
  );
}
