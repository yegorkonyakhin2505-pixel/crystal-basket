"use client";
import { useMemo, useState } from "react";
import { cn } from "@/components/ui";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export interface BuilderProduct { id: string; name: string; intention: string; intentionName: string; stones: string; priceAED: number; image: string | null; palettes: [string, string][] }

export function StackBuilder({ products, intentions, discountPct }: { products: BuilderProduct[]; intentions: { id: string; name: string }[]; discountPct: number }) {
  const [filter, setFilter] = useState("all");
  const [picked, setPicked] = useState<string[]>([]);
  const list = filter === "all" ? products : products.filter((p) => p.intention === filter);
  const chosen = picked.map((id) => products.find((p) => p.id === id)!).filter(Boolean);
  const subtotal = chosen.reduce((s, p) => s + p.priceAED, 0);
  const complete = chosen.length === 3;
  const total = complete ? Math.round(subtotal * (1 - discountPct / 100)) : subtotal;
  const waUrl = useMemo(() => buildWhatsAppUrl(chosen.map((c) => ({ name: c.name, priceAED: c.priceAED })), complete ? `Stack of 3 — ${discountPct}% off applied: ${total} AED` : undefined), [chosen, complete, total, discountPct]);
  const toggle = (id: string) => setPicked((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));
  const chip = (on: boolean) => cn("px-3.5 py-1.5 text-[12px] uppercase tracking-[0.12em] border transition-colors", on ? "bg-cb-ink text-white border-cb-ink" : "border-cb-line hover:border-cb-ink");

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8">
      <div>
        <div className="flex flex-wrap gap-2 mb-5">
          <button type="button" onClick={() => setFilter("all")} className={chip(filter === "all")}>All</button>
          {intentions.map((i) => <button key={i.id} type="button" onClick={() => setFilter(i.id)} className={chip(filter === i.id)}>{i.name}</button>)}
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-px bg-cb-line border border-cb-line">
          {list.map((p) => {
            const on = picked.includes(p.id);
            const full = picked.length >= 3 && !on;
            return (
              <button key={p.id} type="button" onClick={() => toggle(p.id)} disabled={full} aria-pressed={on} className={cn("text-left bg-white p-4 transition-colors", on ? "outline outline-2 -outline-offset-2 outline-cb-ink" : "hover:bg-cb-band", "disabled:opacity-40")}>
                <div className="aspect-square bg-white mb-3 overflow-hidden">{p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}</div>
                <p className="font-display text-[1.15rem] leading-tight">{p.name}</p>
                <p className="text-[12px] text-cb-muted truncate">{p.stones}</p>
                <div className="flex justify-between mt-2 text-[12px]"><span className="text-cb-rose uppercase tracking-[0.12em]">{p.intentionName}</span><span className="price text-[14px]">{p.priceAED} AED</span></div>
              </button>
            );
          })}
        </div>
      </div>
      <aside className="lg:sticky lg:top-32 self-start bg-white border border-cb-line p-5">
        <p className="label-caps mb-4">Your stack · {chosen.length}/3</p>
        <div className="flex justify-center -space-x-3 mb-5">
          {[0, 1, 2].map((i) => { const c = chosen[i]; return <div key={i} className={cn("h-16 w-16 rounded-full border-[5px] border-white ring-1 ring-cb-line bg-cb-band overflow-hidden", !c && "border-dashed")}>{c?.image && <img src={c.image} alt="" className="h-full w-full object-cover" />}</div>; })}
        </div>
        <ul className="divide-y divide-cb-line text-[14px]">
          {chosen.map((c) => <li key={c.id} className="flex justify-between py-2"><span>{c.name}</span><span className="price text-[14px] text-cb-muted">{c.priceAED} AED</span></li>)}
          {chosen.length === 0 && <li className="py-2 text-cb-muted text-[13px]">Pick any three bracelets. Mix intentions or stay on one.</li>}
        </ul>
        <div className="hairline my-3" />
        <div className="flex justify-between text-[13px]"><span className="text-cb-muted">Subtotal</span><span className="price text-[14px]">{subtotal} AED</span></div>
        <div className="flex justify-between text-[13px] mt-1"><span className="text-cb-muted">Stack of 3 · {discountPct}% off</span><span className={cn("price text-[14px]", complete ? "text-cb-rose" : "text-cb-faint")}>{complete ? `− ${subtotal - total} AED` : "add 3 to unlock"}</span></div>
        <div className="flex justify-between mt-3 text-[16px] font-medium"><span>Total</span><span className="price text-[18px]">{total} AED</span></div>
        <a href={chosen.length ? waUrl : undefined} target="_blank" rel="noopener" aria-disabled={!chosen.length} className={cn("mt-5 inline-flex h-12 w-full items-center justify-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] hover:bg-black", !chosen.length && "pointer-events-none opacity-50")}>Order this stack on WhatsApp</a>
        <p className="text-[11px] text-cb-faint mt-3">Card checkout for custom stacks arrives with our payment links. WhatsApp orders are confirmed within the hour.</p>
      </aside>
    </div>
  );
}
