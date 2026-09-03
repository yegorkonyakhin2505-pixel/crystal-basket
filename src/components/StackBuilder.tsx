import { useMemo, useState } from 'react';
import { buildWhatsAppUrl } from '../lib/whatsapp';

export interface BuilderProduct {
  id: string;
  name: string;
  intention: string;
  intentionName: string;
  stones: string;
  priceAED: number;
  palettes: [string, string][];
  gold: boolean;
}

interface Props {
  products: BuilderProduct[];
  intentions: { id: string; name: string }[];
  discountPct: number;
}

function Bead({ p, size = 14 }: { p: [string, string]; size?: number }) {
  return (
    <span
      className="inline-block rounded-full ring-1 ring-black/10"
      style={{ width: size, height: size, background: `radial-gradient(circle at 35% 30%, ${p[0]}, ${p[1]})` }}
    />
  );
}

export default function StackBuilder({ products, intentions, discountPct }: Props) {
  const [filter, setFilter] = useState<string>('all');
  const [picked, setPicked] = useState<string[]>([]);

  const list = filter === 'all' ? products : products.filter((p) => p.intention === filter);
  const chosen = picked.map((id) => products.find((p) => p.id === id)!).filter(Boolean);
  const subtotal = chosen.reduce((s, p) => s + p.priceAED, 0);
  const complete = chosen.length === 3;
  const total = complete ? Math.round(subtotal * (1 - discountPct / 100)) : subtotal;

  const waUrl = useMemo(
    () =>
      buildWhatsAppUrl(
        chosen.map((c) => ({ name: c.name, priceAED: c.priceAED })),
        complete ? `Stack of 3 — ${discountPct}% off applied: AED ${total}` : undefined,
      ),
    [chosen, complete, total, discountPct],
  );

  function toggle(id: string) {
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < 3 ? [...cur, id] : cur));
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8">
      <div>
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full border text-[0.8rem] ${filter === 'all' ? 'bg-text text-bg border-text' : 'border-border hover:border-text'}`}>All</button>
          {intentions.map((i) => (
            <button key={i.id} onClick={() => setFilter(i.id)} className={`px-3 py-1.5 rounded-full border text-[0.8rem] ${filter === i.id ? 'bg-text text-bg border-text' : 'border-border hover:border-text'}`}>
              {i.name}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {list.map((p) => {
            const on = picked.includes(p.id);
            const full = picked.length >= 3 && !on;
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                disabled={full}
                className={`text-left p-4 rounded-brand border transition-all ${on ? 'border-accent bg-surface-2 shadow-sm' : 'border-border bg-surface hover:border-text'} disabled:opacity-40`}
                aria-pressed={on}
              >
                <div className="flex items-center gap-1 mb-3">
                  {p.palettes.map((pal, i) => <Bead key={i} p={pal} size={18} />)}
                  {p.gold && <Bead p={['#f6e3a1', '#8a6a2b']} size={18} />}
                </div>
                <p className="font-display text-lg leading-tight">{p.name}</p>
                <p className="text-[0.78rem] text-muted">{p.stones}</p>
                <div className="flex justify-between items-center mt-2 text-[0.85rem]">
                  <span className="text-muted">{p.intentionName}</span>
                  <span className="price">AED {p.priceAED}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 self-start bg-surface border border-border rounded-brand p-5">
        <p className="eyebrow mb-3">Your stack · {chosen.length}/3</p>
        <div className="flex items-center justify-center gap-[-6px] h-24 mb-4 relative">
          {[0, 1, 2].map((i) => {
            const c = chosen[i];
            return (
              <div
                key={i}
                className={`w-16 h-16 rounded-full border-[6px] -ml-3 first:ml-0 transition-all ${c ? 'border-double' : 'border-dashed border-border'}`}
                style={c ? { borderColor: c.palettes[0][1], background: `conic-gradient(${c.palettes.flatMap((p) => [p[0], p[1]]).join(',')}, ${c.palettes[0][0]})` } : {}}
                title={c?.name}
              />
            );
          })}
        </div>
        <ul className="divide-y divide-border text-[0.9rem]">
          {chosen.map((c) => (
            <li key={c.id} className="flex justify-between py-2">
              <span>{c.name}</span>
              <span className="price text-muted">AED {c.priceAED}</span>
            </li>
          ))}
          {chosen.length === 0 && <li className="py-2 text-muted text-[0.85rem]">Pick any three bracelets. Mix intentions or stay on one.</li>}
        </ul>
        <div className="hairline my-3" />
        <div className="flex justify-between text-[0.9rem]">
          <span className="text-muted">Subtotal</span>
          <span className="price">AED {subtotal}</span>
        </div>
        <div className="flex justify-between text-[0.9rem] mt-1">
          <span className="text-muted">Stack of 3 · {discountPct}% off</span>
          <span className={`price ${complete ? 'text-accent' : 'text-muted'}`}>{complete ? `− AED ${subtotal - total}` : 'add 3 to unlock'}</span>
        </div>
        <div className="flex justify-between font-medium mt-2 text-lg">
          <span>Total</span>
          <span className="price">AED {total}</span>
        </div>
        <a
          href={chosen.length ? waUrl : undefined}
          target="_blank"
          rel="noopener"
          className={`btn btn-primary w-full mt-4 ${chosen.length ? '' : 'pointer-events-none opacity-50'}`}
          aria-disabled={!chosen.length}
        >
          Order this stack on WhatsApp
        </a>
        <p className="text-[0.72rem] text-muted mt-2">Card checkout for custom stacks arrives with our payment links. WhatsApp orders are confirmed within the hour.</p>
      </aside>
    </div>
  );
}
