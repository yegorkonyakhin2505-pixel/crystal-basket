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
type Pt = { x: number; y: number };

// Stage (SVG viewBox units). The loose string hangs in a gentle curve; the finished bracelet is an ellipse seen from a raised angle.
const VW = 640, VH = 360;
const CORD: [Pt, Pt, Pt] = [{ x: 24, y: 78 }, { x: 320, y: 268 }, { x: 616, y: 78 }];
const RING = { cx: 320, cy: 176, rx: 226, ry: 126 };

/** Sample a curve into an arc-length table so beads can be laid along it at equal spacing. */
function arcTable(fn: (t: number) => Pt, n = 720) {
  const pts: Pt[] = [], len: number[] = [0];
  for (let i = 0; i <= n; i++) pts.push(fn(i / n));
  for (let i = 1; i <= n; i++) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const total = len[n];
  const at = (s: number): Pt => {
    const target = Math.max(0, Math.min(total, s));
    let lo = 0, hi = n;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (len[mid] < target) lo = mid + 1; else hi = mid; }
    const i = Math.max(1, lo); const f = (target - len[i - 1]) / Math.max(1e-6, len[i] - len[i - 1]);
    return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f };
  };
  return { total, at };
}
const cordCurve = arcTable((t) => { const [a, b, c] = CORD; const u = 1 - t; return { x: u * u * a.x + 2 * u * t * b.x + t * t * c.x, y: u * u * a.y + 2 * u * t * b.y + t * t * c.y }; });
const ringCurve = arcTable((t) => { const a = t * Math.PI * 2 + Math.PI / 2; return { x: RING.cx + Math.cos(a) * RING.rx, y: RING.cy + Math.sin(a) * RING.ry }; });

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
 * A tray of the real beads sits above a loose string. Tap a bead and it drops from the tray onto the
 * string, sliding up against the last one; the row keeps itself centred. When every slot is filled,
 * "Done" curls the string into a bracelet: each bead glides from the string to its place on the ring,
 * beads touching, seen from a slightly raised angle. Tap a bead on the string to lift it off again.
 * The finished design goes to Shopify as the "custom-bracelet" variant for its size, stone tier and
 * gold bead, with the exact bead sequence on the order line.
 */
export function BraceletBuilder({ stones, intentions, pricing, goldBead }: { stones: BuilderStone[]; intentions: BuilderIntention[]; pricing: Pricing; goldBead: string | null }) {
  const [size, setSize] = useState<WristSizeKey>("M");
  const [beads, setBeads] = useState<Bead[]>([]);
  const [placed, setPlaced] = useState(0);
  const [qty, setQty] = useState(1);
  const [history, setHistory] = useState<Bead[][]>([]);
  const [leaving, setLeaving] = useState<Set<number>>(new Set());
  const [folded, setFolded] = useState(false);
  const [landing, setLanding] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [flyingStone, setFlyingStone] = useState<string | null>(null);
  const nextId = useRef(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const flyerRef = useRef<SVGGElement>(null);
  const flyingRef = useRef(false);
  const cancelRef = useRef(0);
  const beadsRef = useRef<Bead[]>([]); beadsRef.current = beads;
  const placedRef = useRef(0); placedRef.current = placed;
  const cart = useCart();

  const slots = beadCount(BEAD_MM, WRIST_SIZES[size].cm);
  const remaining = Math.max(0, slots - beads.length);
  const full = beads.length === slots && placed === slots;
  const complete = full && folded;
  const stringing = placed < beads.length;
  const byId = useMemo(() => Object.fromEntries(stones.map((s) => [s.id, s])), [stones]);
  const goldCount = beads.filter((b) => b.stone === GOLD).length;
  const nameOf = (id: string) => (id === GOLD ? "Gold-filled bead" : byId[id]?.name ?? id);
  const spriteFor = (stone: string) => (stone === GOLD ? goldBead : byId[stone]?.bead ?? null);
  const tray = useMemo(() => [
    ...stones.map((s) => ({ id: s.id, name: s.name, sprite: s.bead ?? s.image, extra: s.tier === "classic" ? 0 : pricing.tierAED[s.tier], keywords: s.keywords })),
    { id: GOLD, name: "Gold bead", sprite: goldBead, extra: pricing.goldAED, keywords: ["14k gold-filled, up to " + pricing.maxGold] },
  ], [stones, goldBead, pricing]);

  // Bead diameter: on the string, beads touch and the row is centred; on the ring, beads touch all the way round.
  const dCord = Math.min(34, cordCurve.total / slots);
  const dRing = ringCurve.total / slots;
  const cordPos = useCallback((i: number, count: number): Pt => cordCurve.at((cordCurve.total - count * dCord) / 2 + (i + 0.5) * dCord), [dCord]);
  const ringPos = useCallback((i: number) => { const p = ringCurve.at((i + 0.5) * dRing); const depth = (p.y - (RING.cy - RING.ry)) / (2 * RING.ry); return { ...p, depth }; }, [dRing]);
  const posFor = useCallback((i: number, count: number) => {
    if (folded) { const p = ringPos(i); return { x: p.x, y: p.y, r: (dRing / 2) * (0.84 + 0.3 * p.depth), depth: p.depth }; }
    const p = cordPos(i, count); return { x: p.x, y: p.y, r: dCord / 2, depth: 0.5 };
  }, [cordPos, dCord, dRing, folded, ringPos]);

  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("d");
    if (!d) return;
    const [sz, ...codes] = d.split(".");
    if (!SIZE_KEYS.includes(sz as WristSizeKey)) return;
    const restored: Bead[] = [];
    for (const c of codes) { const stone = c === "g" ? GOLD : stones[Number(c)]?.id; if (stone) restored.push({ id: nextId.current++, stone }); }
    const n = beadCount(BEAD_MM, WRIST_SIZES[sz as WristSizeKey].cm);
    setSize(sz as WristSizeKey); setBeads(restored.slice(0, n)); setPlaced(Math.min(restored.length, n)); if (restored.length >= n) setFolded(true);
  }, [stones]);
  useEffect(() => { setQty((q) => Math.min(Math.max(1, q), Math.max(1, remaining))); }, [remaining]);

  const startFor = useCallback((stone: string) => {
    const svg = svgRef.current; const el = document.querySelector<HTMLElement>(`[data-tray="${stone}"]`);
    if (!svg || !el) return { x: VW / 2, y: -40 };
    const s = svg.getBoundingClientRect(), c = el.getBoundingClientRect();
    return { x: ((c.left + c.width / 2 - s.left) / s.width) * VW, y: ((c.top + c.height / 2 - s.top) / s.height) * VH };
  }, []);

  /** Drop pending beads onto the string one after another. */
  const runDrops = useCallback(async (token: number) => {
    if (flyingRef.current) return; flyingRef.current = true;
    try {
      while (placedRef.current < beadsRef.current.length && token === cancelRef.current) {
        const i = placedRef.current, bead = beadsRef.current[i];
        const pending = beadsRef.current.length - i;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const dur = reduce ? 0 : pending > 6 ? 260 : 560;
        setFlyingStone(bead.stone);
        const from = startFor(bead.stone), to = cordPos(i, i + 1);
        const ctrl = { x: from.x + (to.x - from.x) * 0.35, y: Math.min(from.y, to.y) - 40 };
        await new Promise<void>((done) => {
          const t0 = performance.now();
          const frame = (t: number) => {
            const k = dur ? Math.min(1, (t - t0) / dur) : 1;
            const e = k < 0.85 ? 1 - Math.pow(1 - k / 0.85, 2.4) : 1;           // fast fall, soft settle
            const squash = k > 0.85 ? 1 - 0.12 * Math.sin(((k - 0.85) / 0.15) * Math.PI) : 1;
            const x = (1 - e) ** 2 * from.x + 2 * (1 - e) * e * ctrl.x + e ** 2 * to.x;
            const y = (1 - e) ** 2 * from.y + 2 * (1 - e) * e * ctrl.y + e ** 2 * to.y;
            const s = (dCord / 2 / 20) * (0.7 + 0.3 * e);
            const el = flyerRef.current; if (el) { el.style.opacity = "1"; el.style.transform = `translate(${x}px, ${y}px) scale(${s * (2 - squash)}, ${s * squash}) rotate(${(1 - e) * 60}deg)`; }
            if (k < 1) requestAnimationFrame(frame); else done();
          };
          requestAnimationFrame(frame);
        });
        if (token !== cancelRef.current) break;
        setFlyingStone(null); if (flyerRef.current) flyerRef.current.style.opacity = "0";
        setPlaced((p) => p + 1); setLanding((n) => n + 1);
        await new Promise((r) => setTimeout(r, reduce ? 0 : pending > 6 ? 70 : 180));
      }
    } finally { flyingRef.current = false; setFlyingStone(null); }
  }, [cordPos, dCord, startFor]);
  useEffect(() => { if (placed < beads.length && !flyingRef.current) void runDrops(cancelRef.current); }, [beads, placed, runDrops]);

  const snapshot = useCallback(() => setHistory((h) => [...h.slice(-30), beadsRef.current]), []);
  const drop = useCallback((stone: string, count: number) => {
    const gold = beadsRef.current.filter((b) => b.stone === GOLD).length;
    if (stone === GOLD) count = Math.min(count, Math.max(0, pricing.maxGold - gold));
    count = Math.min(count, slots - beadsRef.current.length); if (count <= 0) return;
    setFolded(false); snapshot(); setBeads((b) => [...b, ...Array.from({ length: count }, () => ({ id: nextId.current++, stone }))]);
  }, [pricing.maxGold, slots, snapshot]);
  const fillRest = useCallback((stone: string) => { if (stone !== GOLD) drop(stone, slots); }, [drop, slots]);
  const repeatPattern = useCallback(() => {
    const cur = beadsRef.current; const room = slots - cur.length; if (!cur.length || room <= 0) return;
    const pattern = cur.map((b) => b.stone); const added: Bead[] = []; let gold = cur.filter((b) => b.stone === GOLD).length;
    for (let i = 0; added.length < room && i < slots * 3; i++) { const st = pattern[i % pattern.length]; if (st === GOLD) { if (gold >= pricing.maxGold) continue; gold++; } added.push({ id: nextId.current++, stone: st }); }
    setFolded(false); snapshot(); setBeads((b) => [...b, ...added]);
  }, [pricing.maxGold, slots, snapshot]);
  const settle = useCallback((next: Bead[]) => { cancelRef.current++; setBeads(next); setPlaced(next.length); setFlyingStone(null); if (flyerRef.current) flyerRef.current.style.opacity = "0"; }, []);
  const removeBead = useCallback((id: number) => {
    if (leaving.has(id)) return;
    setFolded(false); setLeaving((s) => new Set(s).add(id));
    setTimeout(() => { setLeaving((s) => { const n = new Set(s); n.delete(id); return n; }); snapshot(); settle(beadsRef.current.filter((b) => b.id !== id)); }, 300);
  }, [leaving, settle, snapshot]);
  const undo = useCallback(() => { setFolded(false); setHistory((h) => { const prev = h[h.length - 1]; if (prev) settle(prev); return h.slice(0, -1); }); }, [settle]);
  const clear = useCallback(() => { setFolded(false); snapshot(); settle([]); }, [settle, snapshot]);
  const changeSize = useCallback((k: WristSizeKey) => { setSize(k); setFolded(false); const n = beadCount(BEAD_MM, WRIST_SIZES[k].cm); settle(beadsRef.current.slice(0, n)); }, [settle]);

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

  const visible = beads.slice(0, placed);
  const drawOrder = useMemo(() => visible.map((b, i) => ({ b, i })).sort((a, c) => posFor(a.i, visible.length).y - posFor(c.i, visible.length).y), [visible, posFor]);
  const hovered = hover != null ? beads.find((b) => b.id === hover) : null;
  const landPos = placed > 0 ? cordPos(placed - 1, placed) : null;

  const BeadArt = ({ stone, r }: { stone: string; r: number }) => {
    const sprite = spriteFor(stone);
    return (
      <>
        <ellipse cx={0} cy={r * 0.9} rx={r * 0.92} ry={r * 0.26} fill="black" opacity=".14" filter="url(#bb-blur)" />
        {sprite ? <image href={sprite} x={-r} y={-r} width={r * 2} height={r * 2} /> : <circle r={r} fill={stone === GOLD ? "url(#bb-gold)" : `url(#bb-${stone})`} />}
        <circle r={r * 0.985} fill="url(#bb-shine)" />
      </>
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        {/* Tray */}
        <div className="rounded-[1.5rem] bg-cb-band px-4 pt-4 pb-3">
          <div className="flex items-baseline justify-between mb-3"><p className="label-caps">Tap a bead to string it</p><p className="text-[12px] text-cb-muted">{remaining} of {slots} to go</p></div>
          <div className="grid grid-cols-6 sm:grid-cols-9 gap-x-1 gap-y-3" role="listbox" aria-label="Beads">
            {tray.map((t) => {
              const disabled = remaining === 0 || (t.id === GOLD && goldCount >= pricing.maxGold);
              return (
                <button key={t.id} type="button" role="option" aria-selected={false} data-tray={t.id} disabled={disabled} onClick={() => drop(t.id, qty)} title={`${t.name}${t.extra ? ` (+${t.extra} AED)` : ""}: ${t.keywords.join(", ")}`} className="group flex flex-col items-center gap-1 transition-opacity disabled:opacity-55 disabled:cursor-not-allowed">
                  <span className="relative block h-12 w-12 sm:h-14 sm:w-14 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-1.5 group-hover:scale-110 group-active:translate-y-0.5 group-active:scale-95">
                    <span className="absolute inset-x-1 -bottom-0.5 h-2 rounded-full bg-black/15 blur-[3px] transition-all duration-300 group-hover:inset-x-2 group-hover:opacity-60" />
                    {t.sprite ? <img src={t.sprite} alt="" className="relative block h-full w-full" loading="lazy" draggable={false} /> : <span className="relative block h-full w-full rounded-full bg-cb-line" />}
                    {t.extra > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-white px-1 text-[8px] leading-4 text-cb-rose shadow-sm">+{t.extra}</span>}
                  </span>
                  <span className="text-[10px] leading-tight text-center text-cb-muted group-hover:text-cb-ink">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* String, and the finished bracelet */}
        <div className="relative rounded-[1.5rem] bg-[radial-gradient(ellipse_at_50%_40%,white_0%,var(--cb-band)_78%)] px-2 pt-2 pb-4">
          <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} className="block h-auto w-full overflow-visible" role="img" aria-label={`${placed} of ${slots} beads strung`}>
            <defs>
              {stones.map((s) => <radialGradient key={s.id} id={`bb-${s.id}`} cx="35%" cy="32%" r="70%"><stop offset="0%" stopColor={s.palette[0]} /><stop offset="100%" stopColor={s.palette[1]} /></radialGradient>)}
              <radialGradient id="bb-gold" cx="35%" cy="32%" r="70%"><stop offset="0%" stopColor="color-mix(in srgb, var(--cb-gold) 40%, white)" /><stop offset="100%" stopColor="color-mix(in srgb, var(--cb-gold) 65%, black)" /></radialGradient>
              <radialGradient id="bb-shine" cx="32%" cy="26%" r="55%"><stop offset="0%" stopColor="white" stopOpacity=".38" /><stop offset="40%" stopColor="white" stopOpacity=".05" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
              <filter id="bb-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" /></filter>
              <linearGradient id="bb-cord" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="white" /><stop offset="100%" stopColor="var(--cb-line)" /></linearGradient>
            </defs>
            {/* the loose string */}
            <g style={{ transition: "opacity .6s", opacity: folded ? 0 : 1 }}>
              <path d={`M${CORD[0].x} ${CORD[0].y} Q${CORD[1].x} ${CORD[1].y} ${CORD[2].x} ${CORD[2].y}`} fill="none" stroke="var(--cb-muted)" strokeOpacity=".45" strokeWidth="2.2" strokeLinecap="round" />
              <path d={`M${CORD[0].x} ${CORD[0].y} Q${CORD[1].x} ${CORD[1].y} ${CORD[2].x} ${CORD[2].y}`} fill="none" stroke="white" strokeOpacity=".8" strokeWidth="0.8" strokeLinecap="round" transform="translate(0,-1)" />
              {[CORD[0], CORD[2]].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--cb-muted)" opacity=".5" />)}
            </g>
            {/* the bracelet */}
            <g style={{ transition: "opacity .6s .3s", opacity: folded ? 1 : 0 }}>
              <ellipse cx={RING.cx} cy={RING.cy + RING.ry + 30} rx={RING.rx * 0.88} ry={14} fill="black" opacity=".09" filter="url(#bb-blur)" />
              <ellipse cx={RING.cx} cy={RING.cy} rx={RING.rx} ry={RING.ry} fill="none" stroke="var(--cb-muted)" strokeOpacity=".35" strokeWidth="2.2" />
            </g>
            {drawOrder.map(({ b, i }) => {
              const p = posFor(i, visible.length);
              return (
                <g key={b.id} className="bead" style={{ transform: `translate(${p.x}px, ${p.y}px)`, transition: `transform ${folded ? 0.9 : 0.45}s cubic-bezier(.22,1,.36,1) ${folded ? i * 22 : 0}ms` }} onMouseEnter={() => setHover(b.id)} onMouseLeave={() => setHover(null)} onClick={() => removeBead(b.id)}>
                  <g className={cn("bead-inner", leaving.has(b.id) && "bead-pop")} style={{ transform: `scale(${p.r / 20})`, transition: `transform ${folded ? 0.9 : 0.45}s cubic-bezier(.22,1,.36,1) ${folded ? i * 22 : 0}ms` }}>
                    <title>{nameOf(b.stone)}. Tap to take it off.</title>
                    <BeadArt stone={b.stone} r={20} />
                  </g>
                </g>
              );
            })}
            {landing > 0 && landPos && !folded && <circle key={landing} cx={landPos.x} cy={landPos.y} r={dCord / 2} className="bead-ripple" fill="none" stroke="var(--cb-rose)" strokeWidth="1.5" />}
            <g ref={flyerRef} style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center", pointerEvents: "none" }}>{flyingStone && <BeadArt stone={flyingStone} r={20} />}</g>
            {complete && [0, 1, 2, 3, 4, 5, 6, 7].map((n) => { const a = (n / 8) * Math.PI * 2; return <path key={n} d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z" fill="var(--cb-gold)" className="sparkle" style={{ transform: `translate(${RING.cx + Math.cos(a) * (RING.rx + 26)}px, ${RING.cy + Math.sin(a) * (RING.ry + 26)}px)`, animationDelay: `${600 + n * 80}ms`, transformBox: "fill-box" }} />; })}
            {folded && (
              <>
                <text x={RING.cx} y={RING.cy - 2} textAnchor="middle" className="font-display" fontSize="28" fill="var(--cb-ink)" style={{ opacity: 0, animation: "fadeIn .8s .9s forwards" }}>{slots} beads</text>
                <text x={RING.cx} y={RING.cy + 20} textAnchor="middle" fontSize="11" letterSpacing="2.5" fill="var(--cb-rose)" className="shimmer-text" style={{ opacity: 0, animation: "fadeIn .8s 1s forwards" }}>YOUR BRACELET</text>
              </>
            )}
            {!folded && placed === 0 && !stringing && <text x={VW / 2} y={CORD[1].y - 96} textAnchor="middle" fontSize="12" letterSpacing="2.5" fill="var(--cb-muted)">TAP A BEAD ABOVE TO START</text>}
          </svg>
          <div className="absolute left-4 top-3 flex items-baseline gap-1.5 text-[12px] text-cb-muted"><span className="font-display text-[1.35rem] text-cb-ink tabular-nums">{placed}</span> / {slots}{hovered && <span className="ml-2">· {nameOf(hovered.stone)}</span>}{stringing && <span className="ml-2">· stringing…</span>}</div>
          <div className="absolute right-4 top-3">
            {full && !folded && <button type="button" onClick={() => setFolded(true)} className="cta-glow inline-flex h-9 items-center bg-cb-ink px-4 text-white text-[11px] uppercase tracking-[0.14em] transition-all hover:bg-black active:scale-[.97]">Done · form the bracelet</button>}
            {folded && <button type="button" onClick={() => setFolded(false)} className="inline-flex h-9 items-center border border-cb-line bg-white px-4 text-[11px] uppercase tracking-[0.14em] transition-all hover:border-cb-ink active:scale-[.97]">Edit beads</button>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <button type="button" onClick={undo} disabled={!history.length} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] transition-all hover:border-cb-ink active:scale-[.97] disabled:opacity-40">Undo</button>
          <button type="button" onClick={repeatPattern} disabled={!beads.length || !remaining || stringing} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] transition-all hover:border-cb-ink active:scale-[.97] disabled:opacity-40">Repeat pattern</button>
          <button type="button" onClick={clear} disabled={!beads.length} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] transition-all hover:border-cb-ink active:scale-[.97] disabled:opacity-40">Clear</button>
          <span className="text-cb-muted">Tap a bead on the string to take it off.</span>
        </div>
      </div>

      <div className="space-y-7">
        <div>
          <div className="flex justify-between mb-2"><span className="label-caps">Wrist size</span><span className="text-[12px] text-cb-muted">{slots} beads of {BEAD_MM} mm</span></div>
          <div className="flex gap-2">
            {SIZE_KEYS.map((k) => (
              <button key={k} type="button" onClick={() => changeSize(k)} aria-pressed={size === k} className={cn("flex-1 border py-2.5 px-3 text-left text-[13px] transition-all duration-300 active:scale-[.98]", size === k ? "border-cb-ink bg-cb-ink text-white shadow-[0_10px_24px_-12px_rgb(0_0_0/.5)]" : "border-cb-line hover:border-cb-ink")}>
                <span className="block">{k} · {WRIST_SIZES[k].cm} cm</span><span className={cn("block text-[11px]", size === k ? "opacity-80" : "text-cb-muted")}>{WRIST_SIZES[k].fits}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2"><span className="label-caps">Beads per tap</span><span className="price text-[15px] tabular-nums">×{qty}</span></div>
          <input type="range" min={1} max={Math.max(1, remaining)} value={qty} onChange={(e) => setQty(Number(e.target.value))} disabled={!remaining} className="bead-range w-full" aria-label="Beads per tap" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { const last = beadsRef.current[beadsRef.current.length - 1]; if (last) fillRest(last.stone); }} disabled={!remaining || stringing || !beads.length || beads[beads.length - 1]?.stone === GOLD} className="inline-flex h-11 items-center justify-center border border-cb-ink text-[12px] uppercase tracking-[0.14em] transition-all hover:bg-cb-ink hover:text-white active:scale-[.98] disabled:opacity-50" title="Fill the rest with the last stone you strung">Fill with the last stone</button>
            <button type="button" onClick={repeatPattern} disabled={!beads.length || !remaining || stringing} className="inline-flex h-11 items-center justify-center border border-cb-ink text-[12px] uppercase tracking-[0.14em] transition-all hover:bg-cb-ink hover:text-white active:scale-[.98] disabled:opacity-50">Repeat the pattern</button>
          </div>
        </div>
        <div className={cn("border border-cb-line p-5 bg-white transition-shadow duration-500", complete && "shadow-[0_18px_40px_-24px_rgb(0_0_0/.35)]")}>
          <div className="flex items-baseline justify-between"><p className="font-display text-[1.4rem]">Your bracelet</p><p className="price text-[1.4rem] tabular-nums">{formatAED(shownPrice)}</p></div>
          <p className="text-[12px] text-cb-muted mt-1">{pricing.baseAED} AED base{pricing.tierAED[tier] ? ` + ${pricing.tierAED[tier]} for ${TIER_LABEL[tier].toLowerCase()} stones` : ""}{goldCount ? ` + ${pricing.goldAED} for the gold bead` : ""}. Any three bracelets are still 15% off together.</p>
          <ul className="mt-4 space-y-1.5 text-[13px]">
            {usedStones.length === 0 && <li className="text-cb-muted">No beads yet. Tap a bead in the tray to string the first one.</li>}
            {usedStones.map(([id, n]) => (
              <li key={id} className="flex items-center gap-2 animate-[fadeIn_.4s_ease]">
                <span className="h-4 w-4 overflow-hidden rounded-full bg-cb-band">{spriteFor(id) ? <img src={spriteFor(id)!} alt="" className="h-full w-full" /> : <span className="block h-full w-full" style={{ background: id === GOLD ? "var(--cb-gold)" : `radial-gradient(circle at 35% 30%, ${byId[id].palette[0]}, ${byId[id].palette[1]})` }} />}</span>
                <span className="flex-1">{nameOf(id)}</span><span className="text-cb-muted tabular-nums">×{n}</span>
              </li>
            ))}
          </ul>
          {leans.length > 0 && <p className="text-[12px] text-cb-muted mt-3">Traditionally worn for {leans.map((l) => l.i.short.toLowerCase()).join(" and ")}.</p>}
          {keepDry && <p className="text-[12px] text-cb-muted mt-1">One of these stones dislikes water: cleanse with smoke, selenite or moonlight.</p>}
          <div className="mt-5 grid gap-2">
            {cart.enabled ? (
              <button type="button" onClick={addToBag} disabled={!complete || adding || cart.busy} className={cn("inline-flex h-12 items-center justify-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] transition-all hover:bg-black active:scale-[.98] disabled:opacity-50", complete && !adding && "cta-glow")}>
                {adding || cart.busy ? "Adding…" : complete ? `Add to bag · ${price} AED` : full ? "Press Done to form the bracelet" : stringing ? "Stringing…" : `String ${remaining} more bead${remaining === 1 ? "" : "s"}`}
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
