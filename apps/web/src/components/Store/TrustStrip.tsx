import { site } from "@/lib/site";
export function TrustStrip() {
  const items = [
    ["100% natural stones", "Never dyed, never glass. Variation is proof."],
    ["Cleansed & charged", "48 hours on selenite before it ships."],
    [`Same-day in ${site.city}`, "Next-day UAE. Cash on delivery available."],
    ["Free re-string, for life", "If the cord ever gives, we fix it."],
  ];
  return (
    <section className="border-y border-cb-line bg-white">
      <div className="container-x grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-cb-line">
        {items.map(([t, s]) => (
          <div key={t} className="py-6 lg:px-8 first:pl-0 last:pr-0 text-center lg:text-left">
            <p className="text-[13px] font-medium tracking-wide">{t}</p>
            <p className="text-[12px] text-cb-muted mt-1">{s}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
