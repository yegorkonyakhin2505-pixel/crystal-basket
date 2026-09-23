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

// Ring geometry (SVG viewBox units). The active slot sits at the front (bottom), where beads are largest.
const VW = 480, VH = 440, CX = 240, CY = 196, RX = 178, RY = 122, R0 = 20;

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
 * Build-your-own bracelet.
 * The ring is drawn in perspective; the slot being filled always faces you at the front. When you tap
 * a stone, a bead lifts off that stone, arcs across the page and settles into the front slot with a
 * ripple; the whole bracelet then turns one bead to bring the next empty slot forward. Several beads
 * string on one after another. Tap a bead to pop it out; the bracelet turns back. Beads are photographs
 * of the real stones. A finished design goes to Shopify as the "custom-bracelet" variant for its size,
 * stone tier and gold bead, with the exact bead sequence on the order line.
 */
export function BraceletBuilder({ stones, intentions, pricing, goldBead }: { stones: BuilderStone[]; intentions: BuilderIntention[]; pricing: Pricing; goldBead: string | null }) {
  const [size, setSize] = useState<WristSizeKey>("M");
  const [beads, setBeads] = useState<Bead[]>([]);
  const [placed, setPlaced] = useState(0);
  const [selected, setSelected] = useState<string>(stones[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [history, setHistory] = useState<Bead[][]>([]);
  const [leaving, setLeaving] = useState<Set<number>>(new Set());
  const [ripple, setRipple] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const nextId = useRef(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const flyerRef = useRef<SVGGElement>(null);
  const flyingRef = useRef(false);
  const cancelRef = useRef(0);
  const beadsRef = useRef<Bead[]>([]); beadsRef.current = beads;
  const placedRef = useRef(0); placedRef.current = placed;
  const [flyingStone, setFlyingStone] = useState<string | null>(null);
  const cart = useCart();

  const slots = beadCount(BEAD_MM, WRIST_SIZES[size].cm);
  const remaining = Math.max(0, slots - beads.length);
  const complete = beads.length === slots && placed === slots;
  const byId = useMemo(() => Object.fromEntries(stones.map((s) => [s.id, s])), [stones]);
  const goldCount = beads.filter((b) => b.stone === GOLD).length;
  const nameOf = (id: string) => (id === GOLD ? "Gold-filled bead" : byId[id]?.name ?? id);
  const spriteFor = (stone: string) => (stone === GOLD ? goldBead : byId[stone]?.bead ?? null);

  // Positions: slot i sits (i - placed) steps behind the front slot, so the next empty slot is always at the front.
  const place = useCallback((i: number, p: number) => {
    const a = ((i - p) / slots) * Math.PI * 2 + Math.PI / 2;
    const depth = (Math.sin(a) + 1) / 2;
    return { x: CX + Math.cos(a) * RX, y: CY + Math.sin(a) * RY, k: (0.72 + 0.42 * depth) * (23 / slots) ** 0.35, depth };
  }, [slots]);
  const front = useMemo(() => place(placed, placed), [place, placed]);

  // Shared design ?d=<size>.<stoneIndex|g>...
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("d");
    if (!d) return;
    const [sz, ...codes] = d.split(".");
    if (!SIZE_KEYS.includes(sz as WristSizeKey)) return;
    const restored: Bead[] = [];
    for (const c of codes) { const stone = c === "g" ? GOLD : stones[Number(c)]?.id; if (stone) restored.push({ id: nextId.current++, stone }); }
    const n = beadCount(BEAD_MM, WRIST_SIZES[sz as WristSizeKey].cm);
    setSize(sz as WristSizeKey); setBeads(restored.slice(0, n)); setPlaced(Math.min(restored.length, n));
  }, [stones]);
  useEffect(() => { setQty((q) => Math.min(Math.max(1, q), Math.max(1, remaining))); }, [remaining]);
  useEffect(() => { if (complete) { setJustCompleted(true); const t = setTimeout(() => setJustCompleted(false), 1700); return () => clearTimeout(t); } }, [complete]);

  /** Where a flight starts: the stone chip the user tapped, converted into viewBox units; above the ring if it is off screen. */
  const startFor = useCallback((stone: string) => {
    const svg = svgRef.current; const chip = document.querySelector<HTMLElement>(`[data-chip="${stone}"]`);
    if (!svg || !chip) return { x: CX, y: -60 };
    const s = svg.getBoundingClientRect(), c = chip.getBoundingClientRect();
    if (c.bottom < 0 || c.top > window.innerHeight) return { x: CX, y: -60 };
    return { x: ((c.left + c.width / 2 - s.left) / s.width) * VW, y: ((c.top + c.height / 2 - s.top) / s.height) * VH };
  }, []);

  /** String pending beads one after another: fly in, land, ripple, turn the ring. */
  const runFlights = useCallback(async (token: number) => {
    if (flyingRef.current) return; flyingRef.current = true;
    try {
      while (placedRef.current < beadsRef.current.length && token === cancelRef.current) {
        const bead = beadsRef.current[placedRef.current];
        const pending = beadsRef.current.length - placedRef.current;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const dur = reduce ? 0 : pending > 8 ? 300 : 620;
        setFlyingStone(bead.stone);
        const from = startFor(bead.stone), to = place(placedRef.current, placedRef.current);
        const ctrl = { x: (from.x + to.x) / 2 + (to.x - from.x) * 0.15, y: Math.min(from.y, to.y) - 90 };
        await new Promise<void>((done) => {
          const t0 = performance.now();
          const frame = (t: number) => {
            const k = dur ? Math.min(1, (t - t0) / dur) : 1;
            const e = 1 - Math.pow(1 - k, 2.2);
            const x = (1 - e) ** 2 * from.x + 2 * (1 - e) * e * ctrl.x + e ** 2 * to.x;
            const y = (1 - e) ** 2 * from.y + 2 * (1 - e) * e * ctrl.y + e ** 2 * to.y;
            const s = to.k * (k < 0.75 ? 0.55 + 0.75 * (k / 0.75) : 1.3 - 0.3 * ((k - 0.75) / 0.25));
            const el = flyerRef.current; if (el) { el.style.opacity = "1"; el.style.transform = `translate(${x}px, ${y}px) scale(${s}) rotate(${(1 - e) * -40}deg)`; }
            if (k < 1) requestAnimationFrame(frame); else done();
          };
          requestAnimationFrame(frame);
        });
        if (token !== cancelRef.current) break;
        setFlyingStone(null); if (flyerRef.current) flyerRef.current.style.opacity = "0";
        setPlaced((p) => p + 1); setRipple((n) => n + 1);
        await new Promise((r) => setTimeout(r, reduce ? 0 : pending > 8 ? 120 : 260));
      }
    } finally { flyingRef.current = false; setFlyingStone(null); }
  }, [place, startFor]);
  useEffect(() => { if (placed < beads.length && !flyingRef.current) void runFlights(cancelRef.current); }, [beads, placed, runFlights]);

  const snapshot = useCallback(() => setHistory((h) => [...h.slice(-30), beadsRef.current]), []);
  const drop = useCallback((stone: string, count: number) => {
    const gold = beadsRef.current.filter((b) => b.stone === GOLD).length;
    if (stone === GOLD) count = Math.min(count, Math.max(0, pricing.maxGold - gold));
    count = Math.min(count, slots - beadsRef.current.length); if (count <= 0) return;
    snapshot(); setBeads((b) => [...b, ...Array.from({ length: count }, () => ({ id: nextId.current++, stone }))]);
  }, [pricing.maxGold, slots, snapshot]);
  const fillRest = useCallback(() => { if (selected !== GOLD) drop(selected, slots); }, [drop, selected, slots]);
  const repeatPattern = useCallback(() => {
    const cur = beadsRef.current; const room = slots - cur.length; if (!cur.length || room <= 0) return;
    const pattern = cur.map((b) => b.stone); const added: Bead[] = []; let gold = cur.filter((b) => b.stone === GOLD).length;
    for (let i = 0; added.length < room && i < slots * 3; i++) { const st = pattern[i % pattern.length]; if (st === GOLD) { if (gold >= pricing.maxGold) continue; gold++; } added.push({ id: nextId.current++, stone: st }); }
    snapshot(); setBeads((b) => [...b, ...added]);
  }, [pricing.maxGold, slots, snapshot]);
  const settle = useCallback((next: Bead[]) => { cancelRef.current++; setBeads(next); setPlaced(next.length); setFlyingStone(null); if (flyerRef.current) flyerRef.current.style.opacity = "0"; }, []);
  const removeBead = useCallback((id: number) => {
    if (leaving.has(id)) return;
    setLeaving((s) => new Set(s).add(id));
    setTimeout(() => { setLeaving((s) => { const n = new Set(s); n.delete(id); return n; }); snapshot(); settle(beadsRef.current.filter((b) => b.id !== id)); }, 320);
  }, [leaving, settle, snapshot]);
  const undo = useCallback(() => { setHistory((h) => { const prev = h[h.length - 1]; if (prev) settle(prev); return h.slice(0, -1); }); }, [settle]);
  const clear = useCallback(() => { snapshot(); settle([]); }, [settle, snapshot]);
  const changeSize = useCallback((k: WristSizeKey) => { setSize(k); const n = beadCount(BEAD_MM, WRIST_SIZES[k].cm); settle(beadsRef.current.slice(0, n)); }, [settle]);

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

  const order = useMemo(() => Array.from({ length: slots }, (_, i) => i).sort((a, b) => place(a, placed).y - place(b, placed).y), [place, placed, slots]);
  const gradFor = (stone: string) => (stone === GOLD ? "url(#bb-gold)" : `url(#bb-${stone})`);
  const chip = (on: boolean) => cn("group relative flex flex-col items-center gap-1.5 border p-2 text-center transition-all duration-300 active:scale-[.96]", on ? "border-cb-ink bg-cb-band shadow-[0_8px_22px_-10px_rgb(0_0_0/.4)] -translate-y-0.5" : "border-cb-line hover:border-cb-ink hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-10px_rgb(0_0_0/.3)]");
  const hovered = hover != null ? beads.find((b) => b.id === hover) : null;
  const busyStringing = placed < beads.length;

  const BeadArt = ({ stone, k }: { stone: string; k: number }) => {
    const sprite = spriteFor(stone); const r = R0 * k;
    return (
      <>
        <ellipse cx={0} cy={r * 0.95} rx={r * 0.95} ry={r * 0.3} fill="black" opacity={0.16} filter="url(#bb-blur)" />
        {sprite ? <image href={sprite} x={-r} y={-r} width={r * 2} height={r * 2} style={{ clipPath: "circle(49% at 50% 50%)" }} /> : <circle r={r} fill={gradFor(stone)} />}
        <circle r={r} fill="url(#bb-rim)" />
        <circle r={r} fill="url(#bb-shine)" />
      </>
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div>
        <div className={cn("relative mx-auto max-w-[600px] rounded-[2rem] bg-[radial-gradient(ellipse_at_50%_38%,white_0%,var(--cb-band)_72%)] p-2 md:p-4 overflow-visible", justCompleted && "ring-settle")}>
          <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} className="block h-auto w-full overflow-visible" role="img" aria-label={`Your bracelet: ${beads.length} of ${slots} beads placed`}>
            <defs>
              {stones.map((s) => <radialGradient key={s.id} id={`bb-${s.id}`} cx="35%" cy="32%" r="70%"><stop offset="0%" stopColor={s.palette[0]} /><stop offset="100%" stopColor={s.palette[1]} /></radialGradient>)}
              <radialGradient id="bb-gold" cx="35%" cy="32%" r="70%"><stop offset="0%" stopColor="color-mix(in srgb, var(--cb-gold) 40%, white)" /><stop offset="100%" stopColor="color-mix(in srgb, var(--cb-gold) 65%, black)" /></radialGradient>
              <radialGradient id="bb-shine" cx="32%" cy="26%" r="55%"><stop offset="0%" stopColor="white" stopOpacity=".55" /><stop offset="45%" stopColor="white" stopOpacity=".08" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
              <radialGradient id="bb-rim" cx="50%" cy="50%" r="50%"><stop offset="74%" stopColor="black" stopOpacity="0" /><stop offset="100%" stopColor="black" stopOpacity=".3" /></radialGradient>
              <filter id="bb-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
            </defs>
            <g className="ring-float">
              <ellipse cx={CX} cy={CY + RY + 34} rx={RX * 0.9} ry={15} fill="black" opacity=".08" filter="url(#bb-blur)" />
              <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="var(--cb-muted)" strokeOpacity=".32" strokeWidth="2.5" />
              {order.map((i) => {
                const { x, y, k } = place(i, placed);
                const bead = beads[i];
                const isFront = i === placed;
                if (!bead || i >= placed) {
                  return (
                    <g key={`slot-${i}`} className={cn("cursor-pointer", isFront && "slot-pulse")} style={{ transform: `translate(${x}px, ${y}px) scale(${k})`, transition: "transform .55s cubic-bezier(.22,1,.36,1)" }} onClick={() => !busyStringing && drop(selected, 1)}>
                      <circle r={R0 * 0.9} fill="white" fillOpacity=".75" stroke={isFront ? "var(--cb-rose)" : "var(--cb-line)"} strokeWidth={isFront ? 1.6 : 1} strokeDasharray={isFront ? "0" : "2 3"} />
                      {isFront && !busyStringing && !bead && (
                        <g opacity=".38" className="ghost-bob">{spriteFor(selected) ? <image href={spriteFor(selected)!} x={-R0} y={-R0} width={R0 * 2} height={R0 * 2} style={{ clipPath: "circle(49% at 50% 50%)" }} /> : <circle r={R0} fill={gradFor(selected)} />}</g>
                      )}
                    </g>
                  );
                }
                return (
                  <g key={bead.id} className="bead" style={{ transform: `translate(${x}px, ${y}px) scale(${k})`, transition: "transform .55s cubic-bezier(.22,1,.36,1)" }} onMouseEnter={() => setHover(bead.id)} onMouseLeave={() => setHover(null)} onClick={() => removeBead(bead.id)}>
                    <g className={cn("bead-inner", leaving.has(bead.id) && "bead-pop")}>
                      <title>{nameOf(bead.stone)}. Tap to remove.</title>
                      <BeadArt stone={bead.stone} k={1} />
                    </g>
                  </g>
                );
              })}
              {ripple > 0 && <circle key={ripple} cx={front.x} cy={front.y} r={R0 * front.k} className="bead-ripple" fill="none" stroke="var(--cb-rose)" strokeWidth="2" />}
            </g>
            {/* The bead in flight, driven frame by frame from the tapped stone to the front slot. */}
            <g ref={flyerRef} style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center", pointerEvents: "none" }}>
              {flyingStone && <BeadArt stone={flyingStone} k={1} />}
            </g>
            {justCompleted && [0, 1, 2, 3, 4, 5, 6, 7].map((n) => { const a = (n / 8) * Math.PI * 2; return <path key={n} d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z" fill="var(--cb-gold)" className="sparkle" style={{ transform: `translate(${CX + Math.cos(a) * (RX + 30)}px, ${CY + Math.sin(a) * (RY + 30)}px)`, animationDelay: `${n * 80}ms`, transformBox: "fill-box" }} />; })}
            <text x={CX} y={CY - 4} textAnchor="middle" className="font-display" fontSize="30" fill="var(--cb-ink)">{placed} / {slots}</text>
            <text x={CX} y={CY + 20} textAnchor="middle" fontSize="11" letterSpacing="2.5" fill={complete ? "var(--cb-rose)" : "var(--cb-muted)"} className={cn(complete && "shimmer-text")}>{complete ? "READY TO STRING" : busyStringing ? "STRINGING…" : hovered ? nameOf(hovered.stone).toUpperCase() : `${remaining} TO GO`}</text>
          </svg>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[12px]">
          <button type="button" onClick={undo} disabled={!history.length} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] transition-all hover:border-cb-ink active:scale-[.97] disabled:opacity-40">Undo</button>
          <button type="button" onClick={repeatPattern} disabled={!beads.length || !remaining || busyStringing} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] transition-all hover:border-cb-ink active:scale-[.97] disabled:opacity-40">Repeat pattern</button>
          <button type="button" onClick={clear} disabled={!beads.length} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] transition-all hover:border-cb-ink active:scale-[.97] disabled:opacity-40">Clear</button>
          <span className="text-cb-muted ml-2">Tap a bead on the bracelet to remove it.</span>
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
          <div className="flex justify-between mb-2"><span className="label-caps">2 · Tap a stone to string it</span><span className="text-[12px] text-cb-muted">{remaining} slot{remaining === 1 ? "" : "s"} left</span></div>
          <div className="grid grid-cols-4 gap-1.5 max-h-[340px] overflow-y-auto pr-1" role="listbox" aria-label="Stones">
            {[...stones.map((s) => ({ id: s.id, name: s.name, sprite: s.bead ?? s.image, tier: s.tier as "classic" | "select" | "rare" | "gold", keywords: s.keywords, palette: s.palette })), { id: GOLD, name: "Gold bead", sprite: goldBead, tier: "gold" as const, keywords: ["14k gold-filled"], palette: ["color-mix(in srgb, var(--cb-gold) 40%, white)", "var(--cb-gold)"] as [string, string] }].map((s) => (
              <button key={s.id} type="button" role="option" aria-selected={selected === s.id} data-chip={s.id} onClick={() => { setSelected(s.id); if (!busyStringing) drop(s.id, qty); }} className={chip(selected === s.id)} title={`${s.name}: ${s.keywords.join(", ")}`}>
                <span className="relative h-12 w-12 overflow-hidden rounded-full bg-cb-band ring-1 ring-black/10 transition-transform duration-500 group-hover:scale-110 group-active:scale-95">
                  {s.sprite ? <img src={s.sprite} alt="" className="h-full w-full object-cover" loading="lazy" /> : <span className="block h-full w-full" style={{ background: `radial-gradient(circle at 35% 30%, ${s.palette[0]}, ${s.palette[1]})` }} />}
                </span>
                <span className="text-[10px] leading-tight line-clamp-2">{s.name}</span>
                {s.tier === "gold" ? <span className="absolute right-1 top-1 text-[8px] uppercase tracking-[0.1em] text-cb-rose">+{pricing.goldAED}</span> : s.tier !== "classic" && <span className="absolute right-1 top-1 text-[8px] uppercase tracking-[0.1em] text-cb-rose">+{pricing.tierAED[s.tier]}</span>}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-cb-muted mt-2">Each tap strings the number of beads set below. Up to {pricing.maxGold} gold beads per bracelet.</p>
        </div>

        <div>
          <div className="flex justify-between mb-2"><span className="label-caps">3 · Beads per tap</span><span className="price text-[15px] tabular-nums">×{qty}</span></div>
          <input type="range" min={1} max={Math.max(1, remaining)} value={qty} onChange={(e) => setQty(Number(e.target.value))} disabled={!remaining} className="bead-range w-full" aria-label="Beads per tap" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => drop(selected, qty)} disabled={!remaining || busyStringing || (selected === GOLD && goldCount >= pricing.maxGold)} className="inline-flex h-11 items-center justify-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] transition-all hover:bg-black active:scale-[.98] disabled:opacity-50">String {qty} {selected === GOLD ? "gold" : byId[selected]?.name.split(" ")[0]}</button>
            <button type="button" onClick={fillRest} disabled={!remaining || busyStringing || selected === GOLD} className="inline-flex h-11 items-center justify-center border border-cb-ink text-[12px] uppercase tracking-[0.14em] transition-all hover:bg-cb-ink hover:text-white active:scale-[.98] disabled:opacity-50">Fill the rest</button>
          </div>
        </div>

        <div className={cn("border border-cb-line p-5 bg-white transition-shadow duration-500", complete && "shadow-[0_18px_40px_-24px_rgb(0_0_0/.35)]")}>
          <div className="flex items-baseline justify-between"><p className="font-display text-[1.4rem]">Your bracelet</p><p className="price text-[1.4rem] tabular-nums">{formatAED(shownPrice)}</p></div>
          <p className="text-[12px] text-cb-muted mt-1">{pricing.baseAED} AED base{pricing.tierAED[tier] ? ` + ${pricing.tierAED[tier]} for ${TIER_LABEL[tier].toLowerCase()} stones` : ""}{goldCount ? ` + ${pricing.goldAED} for the gold bead` : ""}. Any three bracelets are still 15% off together.</p>
          <ul className="mt-4 space-y-1.5 text-[13px]">
            {usedStones.length === 0 && <li className="text-cb-muted">No beads yet. Tap a stone to string the first one.</li>}
            {usedStones.map(([id, n]) => (
              <li key={id} className="flex items-center gap-2 animate-[fadeIn_.4s_ease]">
                <span className="h-4 w-4 overflow-hidden rounded-full bg-cb-band ring-1 ring-black/10">{spriteFor(id) ? <img src={spriteFor(id)!} alt="" className="h-full w-full object-cover" /> : <span className="block h-full w-full" style={{ background: id === GOLD ? "var(--cb-gold)" : `radial-gradient(circle at 35% 30%, ${byId[id].palette[0]}, ${byId[id].palette[1]})` }} />}</span>
                <span className="flex-1">{nameOf(id)}</span><span className="text-cb-muted tabular-nums">×{n}</span>
              </li>
            ))}
          </ul>
          {leans.length > 0 && <p className="text-[12px] text-cb-muted mt-3">Traditionally worn for {leans.map((l) => l.i.short.toLowerCase()).join(" and ")}.</p>}
          {keepDry && <p className="text-[12px] text-cb-muted mt-1">One of these stones dislikes water: cleanse with smoke, selenite or moonlight.</p>}
          <div className="mt-5 grid gap-2">
            {cart.enabled ? (
              <button type="button" onClick={addToBag} disabled={!complete || adding || cart.busy} className={cn("inline-flex h-12 items-center justify-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] transition-all hover:bg-black active:scale-[.98] disabled:opacity-50", complete && !adding && "cta-glow")}>
                {adding || cart.busy ? "Adding…" : complete ? `Add to bag · ${price} AED` : busyStringing ? "Stringing…" : `Fill ${remaining} more bead${remaining === 1 ? "" : "s"}`}
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
