"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BEAD_MM } from "@crystal-basket/catalog/schemas";
import { formatAED } from "@crystal-basket/catalog/money";
import { cn } from "@/components/ui";
import { useCart } from "@/hooks/useCart";
import { findVariantByOptions } from "@/lib/shopify";
import { contactOpensNewTab, contactUrl } from "@/lib/contact";
import { WRIST_SIZES, beadCount, type WristSizeKey } from "@/lib/sizes";

export interface BuilderStone { id: string; name: string; palette: [string, string]; tier: "classic" | "select" | "rare"; keywords: string[]; waterSafe: boolean; image: string | null; bead: string | null }
export interface BuilderIntention { id: string; short: string; stones: string[] }
interface Pricing { handle: string; baseAED: number; tierAED: Record<"classic" | "select" | "rare", number>; goldAED: number; maxGold: number }

const GOLD = "gold";
const TIER_LABEL = { classic: "Classic", select: "Select", rare: "Rare" } as const;
const SIZE_KEYS = Object.keys(WRIST_SIZES) as WristSizeKey[];
type Bead = { id: number; stone: string };

/** Tweens a number towards its target so the price ticks instead of jumping. */
function useTicker(value: number) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const from = shown, to = value; if (from === to) return;
    const t0 = performance.now(); let raf = 0;
    const step = (t: number) => { const k = Math.min(1, (t - t0) / 420); const e = 1 - Math.pow(1 - k, 3); setShown(Math.round(from + (to - from) * e)); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return shown;
}

/**
 * Build-your-own bracelet. A 2.5D ring: beads are photographs of the real stones, front beads render
 * larger and on top, positions animate when the ring reflows, a new bead drops in with a landing
 * ripple, a removed bead pops out, the whole ring floats and settles with sparkles when it is complete.
 * Complete designs go to Shopify as the "custom-bracelet" variant for the size, stone tier and gold bead,
 * with the bead sequence on the order line.
 */
export function BraceletBuilder({ stones, intentions, pricing, goldBead }: { stones: BuilderStone[]; intentions: BuilderIntention[]; pricing: Pricing; goldBead: string | null }) {
  const [size, setSize] = useState<WristSizeKey>("M");
  const [beads, setBeads] = useState<Bead[]>([]);
  const [selected, setSelected] = useState<string>(stones[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [history, setHistory] = useState<Bead[][]>([]);
  const [recent, setRecent] = useState<number[]>([]);
  const [leaving, setLeaving] = useState<Set<number>>(new Set());
  const [hover, setHover] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const nextId = useRef(1);
  const cart = useCart();

  const slots = beadCount(BEAD_MM, WRIST_SIZES[size].cm);
  const remaining = Math.max(0, slots - beads.length);
  const complete = beads.length === slots;
  const byId = useMemo(() => Object.fromEntries(stones.map((s) => [s.id, s])), [stones]);
  const goldCount = beads.filter((b) => b.stone === GOLD).length;
  const nameOf = (id: string) => (id === GOLD ? "Gold-filled bead" : byId[id]?.name ?? id);

  // Restore a shared design from ?d=<size>.<stoneIndex|g>...
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("d");
    if (!d) return;
    const [sz, ...codes] = d.split(".");
    if (!SIZE_KEYS.includes(sz as WristSizeKey)) return;
    const restored: Bead[] = [];
    for (const c of codes) { const stone = c === "g" ? GOLD : stones[Number(c)]?.id; if (stone) restored.push({ id: nextId.current++, stone }); }
    setSize(sz as WristSizeKey);
    setBeads(restored.slice(0, beadCount(BEAD_MM, WRIST_SIZES[sz as WristSizeKey].cm)));
  }, [stones]);
  useEffect(() => { setQty((q) => Math.min(Math.max(1, q), Math.max(1, remaining))); }, [remaining]);
  useEffect(() => { if (complete) { setJustCompleted(true); const t = setTimeout(() => setJustCompleted(false), 1600); return () => clearTimeout(t); } }, [complete]);

  const commit = useCallback((next: Bead[], added: number[] = []) => { setHistory((h) => [...h.slice(-30), beads]); setBeads(next); setRecent(added); }, [beads]);
  const drop = useCallback((stone: string, count: number) => {
    if (stone === GOLD && goldCount + count > pricing.maxGold) count = Math.max(0, pricing.maxGold - goldCount);
    count = Math.min(count, remaining); if (count <= 0) return;
    const added = Array.from({ length: count }, () => ({ id: nextId.current++, stone }));
    commit([...beads, ...added], added.map((b) => b.id));
  }, [beads, commit, goldCount, pricing.maxGold, remaining]);
  const fillRest = useCallback(() => { if (remaining && selected !== GOLD) drop(selected, remaining); }, [drop, remaining, selected]);
  const repeatPattern = useCallback(() => {
    if (!beads.length || !remaining) return;
    const pattern = beads.map((b) => b.stone); const added: Bead[] = []; let gold = goldCount;
    for (let i = 0; added.length < remaining && i < slots * 3; i++) {
      const stone = pattern[i % pattern.length];
      if (stone === GOLD) { if (gold >= pricing.maxGold) continue; gold++; }
      added.push({ id: nextId.current++, stone });
    }
    commit([...beads, ...added], added.map((b) => b.id));
  }, [beads, commit, goldCount, pricing.maxGold, remaining, slots]);
  const removeBead = useCallback((id: number) => {
    setLeaving((s) => new Set(s).add(id));
    setTimeout(() => { setLeaving((s) => { const n = new Set(s); n.delete(id); return n; }); setHistory((h) => [...h.slice(-30), beads]); setBeads((b) => b.filter((x) => x.id !== id)); setRecent([]); }, 320);
  }, [beads]);
  const undo = useCallback(() => { setHistory((h) => { const prev = h[h.length - 1]; if (prev) { setBeads(prev); setRecent([]); } return h.slice(0, -1); }); }, []);
  const clear = useCallback(() => commit([]), [commit]);
  const changeSize = useCallback((k: WristSizeKey) => { setSize(k); const n = beadCount(BEAD_MM, WRIST_SIZES[k].cm); setBeads((b) => b.slice(0, n)); setRecent([]); }, []);

  const usedStones = useMemo(() => { const c = new Map<string, number>(); for (const b of beads) c.set(b.stone, (c.get(b.stone) ?? 0) + 1); return [...c.entries()].sort((a, b) => b[1] - a[1]); }, [beads]);
  const tier = useMemo(() => { const t = usedStones.map(([id]) => byId[id]?.tier).filter(Boolean) as ("classic" | "select" | "rare")[]; return t.includes("rare") ? "rare" : t.includes("select") ? "select" : "classic"; }, [usedStones, byId]);
  const price = pricing.baseAED + pricing.tierAED[tier] + (goldCount > 0 ? pricing.goldAED : 0);
  const shownPrice = useTicker(price);
  const leans = useMemo(() => intentions.map((i) => ({ i, n: beads.filter((b) => i.stones.includes(b.stone)).length })).filter((x) => x.n >= Math.max(3, slots / 4)).sort((a, b) => b.n - a.n).slice(0, 2), [beads, intentions, slots]);
  const keepDry = usedStones.some(([id]) => byId[id] && !byId[id].waterSafe);
  const designLine = usedStones.map(([id, n]) => `${nameOf(id)} ×${n}`).join(", ");
  const sequence = beads.map((b) => (b.stone === GOLD ? "gold" : byId[b.stone].name)).join(" › ");
  const shareCode = `${size}.${beads.map((b) => (b.stone === GOLD ? "g" : stones.findIndex((s) => s.id === b.stone))).join(".")}`;

  const addToBag = useCallback(async () => {
    setAdding(true); setAddError(null);
    try {
      const merchandiseId = await findVariantByOptions(pricing.handle, { "Wrist size": size, Stones: TIER_LABEL[tier], "Gold bead": goldCount > 0 ? "Yes" : "No" });
      await cart.add([{ merchandiseId, attributes: [{ key: "Design", value: designLine }, { key: "Beads in order", value: sequence }, { key: "Wrist size", value: `${size} · ${WRIST_SIZES[size].cm} cm` }] }]);
    } catch (e) { setAddError((e as Error).message); } finally { setAdding(false); }
  }, [cart, designLine, goldCount, pricing.handle, sequence, size, tier]);
  const share = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}?d=${shareCode}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { window.prompt("Copy your design link", url); }
  }, [shareCode]);
  const emailUrl = contactUrl(`Hi Crystal Basket! I designed a bracelet in the builder.\nWrist size: ${size} (${WRIST_SIZES[size].cm} cm)\nBeads: ${designLine}\nOrder: ${sequence}\nPrice shown: ${price} AED`, "Custom bracelet design");

  // 2.5D ring: an ellipse seen from a raised angle; beads nearer the viewer (larger y) are drawn bigger and last.
  const VW = 480, VH = 440, cx = 240, cy = 208, RX = 178, RY = 128;
  const base = ((Math.PI * 2 * ((RX + RY) / 2)) / slots / 2) * 0.98;
  const place = (i: number) => { const a = (i / slots) * Math.PI * 2 - Math.PI / 2; const depth = (Math.sin(a) + 1) / 2; return { x: cx + Math.cos(a) * RX, y: cy + Math.sin(a) * RY, r: base * (0.82 + 0.26 * depth), depth }; };
  const order = Array.from({ length: slots }, (_, i) => i).sort((a, b) => place(a).y - place(b).y);
  const spriteFor = (stone: string) => (stone === GOLD ? goldBead : byId[stone]?.bead ?? null);
  const gradFor = (stone: string) => (stone === GOLD ? "url(#bb-gold)" : `url(#bb-${stone})`);
  const chip = (on: boolean) => cn("group relative flex flex-col items-center gap-1.5 border p-2 text-center transition-all duration-300 active:scale-[.97]", on ? "border-cb-ink bg-cb-band shadow-[0_6px_18px_-8px_rgb(0_0_0/.35)] -translate-y-0.5" : "border-cb-line hover:border-cb-ink hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-10px_rgb(0_0_0/.3)]");
  const hovered = hover != null ? beads.find((b) => b.id === hover) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div>
        <div className={cn("relative mx-auto max-w-[600px] rounded-[2rem] bg-[radial-gradient(ellipse_at_50%_40%,white_0%,var(--cb-band)_70%)] p-2 md:p-4", justCompleted && "ring-settle")}>
          <svg viewBox={`0 0 ${VW} ${VH}`} className="block h-auto w-full" role="img" aria-label={`Your bracelet: ${beads.length} of ${slots} beads placed`}>
            <defs>
              {stones.map((s) => <radialGradient key={s.id} id={`bb-${s.id}`} cx="35%" cy="32%" r="70%"><stop offset="0%" stopColor={s.palette[0]} /><stop offset="100%" stopColor={s.palette[1]} /></radialGradient>)}
              <radialGradient id="bb-gold" cx="35%" cy="32%" r="70%"><stop offset="0%" stopColor="color-mix(in srgb, var(--cb-gold) 40%, white)" /><stop offset="100%" stopColor="color-mix(in srgb, var(--cb-gold) 65%, black)" /></radialGradient>
              <radialGradient id="bb-shine" cx="32%" cy="26%" r="55%"><stop offset="0%" stopColor="white" stopOpacity=".7" /><stop offset="45%" stopColor="white" stopOpacity=".12" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
              <radialGradient id="bb-rim" cx="50%" cy="50%" r="50%"><stop offset="72%" stopColor="black" stopOpacity="0" /><stop offset="100%" stopColor="black" stopOpacity=".28" /></radialGradient>
              <filter id="bb-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
              <clipPath id="bb-clip"><circle cx="0" cy="0" r="1" /></clipPath>
            </defs>
            <g className="ring-float">
              <ellipse cx={cx} cy={cy + RY + 26} rx={RX * 0.92} ry={16} fill="black" opacity=".08" filter="url(#bb-blur)" className="ring-shadow" />
              <ellipse cx={cx} cy={cy} rx={RX} ry={RY} fill="none" stroke="var(--cb-muted)" strokeOpacity=".35" strokeWidth="2.5" />
              {order.map((i) => {
                const { x, y, r, depth } = place(i);
                const bead = beads[i];
                if (!bead) {
                  const nextSlot = i === beads.length;
                  return (
                    <g key={`slot-${i}`} className={cn("cursor-pointer", nextSlot && "slot-pulse")} style={{ transform: `translate(${x}px, ${y}px)`, transformBox: "fill-box" }} onClick={() => drop(selected, 1)}>
                      <circle r={r * 0.92} fill="white" fillOpacity=".7" stroke={nextSlot ? "var(--cb-rose)" : "var(--cb-line)"} strokeWidth={nextSlot ? 1.6 : 1} strokeDasharray={nextSlot ? "0" : "2 3"} />
                      {nextSlot && <circle r={r * 0.22} fill="var(--cb-rose)" opacity=".7" />}
                    </g>
                  );
                }
                const sprite = spriteFor(bead.stone);
                const dropping = recent.includes(bead.id);
                return (
                  <g key={bead.id} className="bead" style={{ transform: `translate(${x}px, ${y}px)`, transition: "transform .5s cubic-bezier(.22,1,.36,1)" }} onMouseEnter={() => setHover(bead.id)} onMouseLeave={() => setHover(null)} onClick={() => removeBead(bead.id)}>
                    <g className={cn("bead-inner", dropping && "bead-drop", leaving.has(bead.id) && "bead-pop")} style={dropping ? { animationDelay: `${recent.indexOf(bead.id) * 65}ms` } : undefined}>
                      <ellipse cx={0} cy={r * 0.92} rx={r * 0.95} ry={r * 0.32} fill="black" opacity={0.1 + depth * 0.12} filter="url(#bb-blur)" />
                      {sprite ? (
                        <g style={{ clipPath: "circle(50%)" }}><image href={sprite} x={-r} y={-r} width={r * 2} height={r * 2} preserveAspectRatio="xMidYMid slice" /></g>
                      ) : (
                        <circle r={r} fill={gradFor(bead.stone)} />
                      )}
                      <circle r={r} fill="url(#bb-rim)" />
                      <circle r={r} fill="url(#bb-shine)" />
                      <circle r={r * 0.22} cx={-r * 0.36} cy={-r * 0.4} fill="white" opacity=".55" />
                    </g>
                    {dropping && <circle r={r} className="bead-ripple" fill="none" stroke="var(--cb-rose)" strokeWidth="2" style={{ animationDelay: `${recent.indexOf(bead.id) * 65 + 220}ms` }} />}
                  </g>
                );
              })}
            </g>
            {justCompleted && [0, 1, 2, 3, 4, 5].map((k) => { const a = (k / 6) * Math.PI * 2; return <path key={k} d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z" fill="var(--cb-gold)" className="sparkle" style={{ transform: `translate(${cx + Math.cos(a) * (RX + 34)}px, ${cy + Math.sin(a) * (RY + 34)}px)`, animationDelay: `${k * 90}ms`, transformBox: "fill-box" }} />; })}
            <text x={cx} y={cy - 4} textAnchor="middle" className="font-display" fontSize="30" fill="var(--cb-ink)">{beads.length} / {slots}</text>
            <text x={cx} y={cy + 20} textAnchor="middle" fontSize="11" letterSpacing="2.5" fill={complete ? "var(--cb-rose)" : "var(--cb-muted)"} className={cn(complete && "shimmer-text")}>{complete ? "READY TO STRING" : hovered ? nameOf(hovered.stone).toUpperCase() : `${remaining} TO GO`}</text>
          </svg>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[12px]">
          <button type="button" onClick={undo} disabled={!history.length} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] transition-all hover:border-cb-ink active:scale-[.97] disabled:opacity-40">Undo</button>
          <button type="button" onClick={repeatPattern} disabled={!beads.length || !remaining} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] transition-all hover:border-cb-ink active:scale-[.97] disabled:opacity-40">Repeat pattern</button>
          <button type="button" onClick={clear} disabled={!beads.length} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] transition-all hover:border-cb-ink active:scale-[.97] disabled:opacity-40">Clear</button>
          <span className="text-cb-muted ml-2">Tap a bead on the ring to remove it.</span>
        </div>
      </div>

      <div className="space-y-7">
        <div>
          <div className="flex justify-between mb-2"><span className="label-caps">1 · Wrist size</span><span className="text-[12px] text-cb-muted">{slots} beads of {BEAD_MM} mm</span></div>
          <div className="flex gap-2">
            {SIZE_KEYS.map((k) => (
              <button key={k} type="button" onClick={() => changeSize(k)} aria-pressed={size === k} className={cn("flex-1 border py-2.5 px-3 text-left text-[13px] transition-all duration-300 active:scale-[.98]", size === k ? "border-cb-ink bg-cb-ink text-white shadow-[0_10px_24px_-12px_rgb(0_0_0/.5)]" : "border-cb-line hover:border-cb-ink")}>
                <span className="block">{k} · {WRIST_SIZES[k].cm} cm</span><span className={cn("block text-[11px]", size === k ? "opacity-80" : "text-cb-muted")}>{WRIST_SIZES[k].fits}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label-caps mb-2">2 · Pick a stone</p>
          <div className="grid grid-cols-4 gap-1.5 max-h-[320px] overflow-y-auto pr-1" role="listbox" aria-label="Stones">
            {stones.map((s) => (
              <button key={s.id} type="button" role="option" aria-selected={selected === s.id} onClick={() => setSelected(s.id)} className={chip(selected === s.id)} title={`${s.name}: ${s.keywords.join(", ")}`}>
                <span className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-black/10 shadow-[inset_0_-6px_10px_rgb(0_0_0/.15)] transition-transform duration-500 group-hover:scale-110">
                  {s.bead || s.image ? <img src={(s.bead ?? s.image)!} alt="" className="h-full w-full object-cover" loading="lazy" /> : <span className="block h-full w-full" style={{ background: `radial-gradient(circle at 35% 30%, ${s.palette[0]}, ${s.palette[1]})` }} />}
                </span>
                <span className="text-[10px] leading-tight line-clamp-2">{s.name}</span>
                {s.tier !== "classic" && <span className="absolute right-1 top-1 text-[8px] uppercase tracking-[0.1em] text-cb-rose">+{pricing.tierAED[s.tier]}</span>}
              </button>
            ))}
            <button type="button" role="option" aria-selected={selected === GOLD} onClick={() => setSelected(GOLD)} className={chip(selected === GOLD)} title="14k gold-filled bead">
              <span className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-black/10 transition-transform duration-500 group-hover:scale-110">{goldBead ? <img src={goldBead} alt="" className="h-full w-full object-cover" /> : <span className="block h-full w-full bg-cb-gold" />}</span>
              <span className="text-[10px] leading-tight">Gold bead</span>
              <span className="absolute right-1 top-1 text-[8px] uppercase tracking-[0.1em] text-cb-rose">+{pricing.goldAED}</span>
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2"><span className="label-caps">3 · Drop beads</span><span className="text-[12px] text-cb-muted">{remaining} slot{remaining === 1 ? "" : "s"} left</span></div>
          <div className="flex items-center gap-3">
            <input type="range" min={1} max={Math.max(1, selected === GOLD ? Math.min(remaining, pricing.maxGold - goldCount) : remaining)} value={qty} onChange={(e) => setQty(Number(e.target.value))} disabled={!remaining} className="bead-range flex-1" aria-label="How many beads to drop" />
            <span className="price w-14 text-right text-[15px] tabular-nums">×{qty}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => drop(selected, qty)} disabled={!remaining || (selected === GOLD && goldCount >= pricing.maxGold)} className="inline-flex h-11 items-center justify-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] transition-all hover:bg-black active:scale-[.98] disabled:opacity-50">Drop {qty} {selected === GOLD ? "gold" : byId[selected]?.name.split(" ")[0]}</button>
            <button type="button" onClick={fillRest} disabled={!remaining || selected === GOLD} className="inline-flex h-11 items-center justify-center border border-cb-ink text-[12px] uppercase tracking-[0.14em] transition-all hover:bg-cb-ink hover:text-white active:scale-[.98] disabled:opacity-50">Fill the rest</button>
          </div>
          {selected === GOLD && <p className="text-[11px] text-cb-muted mt-2">Up to {pricing.maxGold} gold-filled beads per bracelet.</p>}
        </div>

        <div className={cn("border border-cb-line p-5 bg-white transition-shadow duration-500", complete && "shadow-[0_18px_40px_-24px_rgb(0_0_0/.35)]")}>
          <div className="flex items-baseline justify-between"><p className="font-display text-[1.4rem]">Your bracelet</p><p className="price text-[1.4rem] tabular-nums">{formatAED(shownPrice)}</p></div>
          <p className="text-[12px] text-cb-muted mt-1">{pricing.baseAED} AED base{pricing.tierAED[tier] ? ` + ${pricing.tierAED[tier]} for ${TIER_LABEL[tier].toLowerCase()} stones` : ""}{goldCount ? ` + ${pricing.goldAED} for the gold bead` : ""}. Any three bracelets are still 15% off together.</p>
          <ul className="mt-4 space-y-1.5 text-[13px]">
            {usedStones.length === 0 && <li className="text-cb-muted">No beads yet. Pick a stone and tap the ring.</li>}
            {usedStones.map(([id, n]) => (
              <li key={id} className="flex items-center gap-2 animate-[fadeIn_.4s_ease]">
                <span className="h-4 w-4 overflow-hidden rounded-full ring-1 ring-black/10">{spriteFor(id) ? <img src={spriteFor(id)!} alt="" className="h-full w-full object-cover" /> : <span className="block h-full w-full" style={{ background: id === GOLD ? "var(--cb-gold)" : `radial-gradient(circle at 35% 30%, ${byId[id].palette[0]}, ${byId[id].palette[1]})` }} />}</span>
                <span className="flex-1">{nameOf(id)}</span><span className="text-cb-muted tabular-nums">×{n}</span>
              </li>
            ))}
          </ul>
          {leans.length > 0 && <p className="text-[12px] text-cb-muted mt-3">Traditionally worn for {leans.map((l) => l.i.short.toLowerCase()).join(" and ")}.</p>}
          {keepDry && <p className="text-[12px] text-cb-muted mt-1">One of these stones dislikes water: cleanse with smoke, selenite or moonlight.</p>}
          <div className="mt-5 grid gap-2">
            {cart.enabled ? (
              <button type="button" onClick={addToBag} disabled={!complete || adding || cart.busy} className={cn("inline-flex h-12 items-center justify-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] transition-all hover:bg-black active:scale-[.98] disabled:opacity-50", complete && !adding && "cta-glow")}>
                {adding || cart.busy ? "Adding…" : complete ? `Add to bag · ${price} AED` : `Fill ${remaining} more bead${remaining === 1 ? "" : "s"}`}
              </button>
            ) : (
              <a href={complete ? emailUrl : undefined} aria-disabled={!complete} {...(contactOpensNewTab ? { target: "_blank", rel: "noopener" } : {})} className={cn("inline-flex h-12 items-center justify-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] hover:bg-black", !complete && "pointer-events-none opacity-50")}>Order this design</a>
            )}
            <button type="button" onClick={share} disabled={!beads.length} className="inline-flex h-11 items-center justify-center border border-cb-line text-[12px] uppercase tracking-[0.14em] transition-all hover:border-cb-ink active:scale-[.98] disabled:opacity-50">{copied ? "Link copied" : "Copy design link"}</button>
            {(addError || cart.error) && <p className="text-[12px] text-cb-danger text-center">{addError ?? cart.error}</p>}
          </div>
          <p className="text-[11px] text-cb-faint mt-4">Strung to order in Dubai, usually within two working days, on 1 mm stretch cord. Crystal meanings describe traditional beliefs, not medical advice.</p>
        </div>
      </div>
    </div>
  );
}
