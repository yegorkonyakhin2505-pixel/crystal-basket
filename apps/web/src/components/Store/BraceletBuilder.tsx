"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BEAD_MM } from "@crystal-basket/catalog/schemas";
import { formatAED } from "@crystal-basket/catalog/money";
import { cn } from "@/components/ui";
import { useCart } from "@/hooks/useCart";
import { findVariantByOptions } from "@/lib/shopify";
import { contactOpensNewTab, contactUrl } from "@/lib/contact";
import { WRIST_SIZES, beadCount, type WristSizeKey } from "@/lib/sizes";
import { BraceletStage, type StageHandle } from "./BraceletStage";

export interface BuilderStone { id: string; name: string; palette: [string, string]; tier: "classic" | "select" | "rare"; keywords: string[]; waterSafe: boolean; image: string | null; bead: string | null }
export interface BuilderIntention { id: string; short: string; stones: string[] }
interface Pricing { handle: string; baseAED: number; tierAED: Record<"classic" | "select" | "rare", number>; goldAED: number; maxGold: number }

const GOLD = "gold";
const TIER_LABEL = { classic: "Classic", select: "Select", rare: "Rare" } as const;
const SIZE_KEYS = Object.keys(WRIST_SIZES) as WristSizeKey[];
type Bead = { id: number; stone: string };
type Flight = { id: number; stone: string; side: 0 | 1; t0: number; dur: number; from: { x: number; y: number; w: number } };
const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

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
 * Build-your-own bracelet. A tray of the real beads above a loose string (BraceletStage, canvas).
 * Tap a bead and it falls onto the string beside the last one; at the full count, Done curls the
 * string into the bracelet. The finished design goes to Shopify as the "custom-bracelet" variant for
 * its size, stone tier and gold bead, with the exact bead sequence on the order line.
 */
export function BraceletBuilder({ stones, intentions, pricing, goldBead }: { stones: BuilderStone[]; intentions: BuilderIntention[]; pricing: Pricing; goldBead: string | null }) {
  const [size, setSize] = useState<WristSizeKey>("M");
  const [beads, setBeads] = useState<Bead[]>([]);
  const [qty, setQty] = useState(1);
  const [history, setHistory] = useState<Bead[][]>([]);
  const [folded, setFolded] = useState(false);
  const [stageBusy, setStageBusy] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [entries, setEntries] = useState<Record<number, 0 | 1>>({});
  const flightsRef = useRef<Flight[]>([]); flightsRef.current = flights;
  const stageRef = useRef<StageHandle>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const flightEls = useRef<Map<number, HTMLImageElement>>(new Map());
  const busy = stageBusy || flights.length > 0;
  const [hoverStone, setHoverStone] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const nextId = useRef(1);
  const beadsRef = useRef<Bead[]>([]); beadsRef.current = beads;
  const cart = useCart();

  const slots = beadCount(BEAD_MM, WRIST_SIZES[size].cm);
  const remaining = Math.max(0, slots - beads.length);
  const full = beads.length === slots;
  const complete = full && folded && !busy;
  const hidden = useMemo(() => flights.map((f) => f.id), [flights]);
  const byId = useMemo(() => Object.fromEntries(stones.map((s) => [s.id, s])), [stones]);
  const goldCount = beads.filter((b) => b.stone === GOLD).length;
  const nameOf = (id: string) => (id === GOLD ? "Gold-filled bead" : byId[id]?.name ?? id);
  const spriteFor = useCallback((stone: string) => (stone === GOLD ? goldBead : byId[stone]?.bead ?? null), [byId, goldBead]);
  const sprites = useMemo(() => { const m: Record<string, string> = {}; for (const s of stones) if (s.bead) m[s.id] = s.bead; if (goldBead) m[GOLD] = goldBead; return m; }, [stones, goldBead]);
  const tray = useMemo(() => [
    ...stones.map((s) => ({ id: s.id, name: s.name, sprite: s.bead ?? s.image, extra: s.tier === "classic" ? 0 : pricing.tierAED[s.tier], keywords: s.keywords })),
    { id: GOLD, name: "Gold bead", sprite: goldBead, extra: pricing.goldAED, keywords: [`14k gold-filled, up to ${pricing.maxGold}`] },
  ], [stones, goldBead, pricing]);

  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("d");
    if (!d) return;
    const [sz, ...codes] = d.split(".");
    if (!SIZE_KEYS.includes(sz as WristSizeKey)) return;
    const restored: Bead[] = [];
    for (const c of codes) { const stone = c === "g" ? GOLD : stones[Number(c)]?.id; if (stone) restored.push({ id: nextId.current++, stone }); }
    const n = beadCount(BEAD_MM, WRIST_SIZES[sz as WristSizeKey].cm);
    setSize(sz as WristSizeKey); setBeads(restored.slice(0, n)); if (restored.length >= n) setTimeout(() => setFolded(true), 400);
  }, [stones]);
  useEffect(() => { setQty((q) => Math.min(Math.max(1, q), Math.max(1, remaining))); }, [remaining]);

  const snapshot = useCallback(() => setHistory((h) => [...h.slice(-30), beadsRef.current]), []);
  const add = useCallback((stone: string, count: number) => {
    const gold = beadsRef.current.filter((b) => b.stone === GOLD).length;
    if (stone === GOLD) count = Math.min(count, Math.max(0, pricing.maxGold - gold));
    count = Math.min(count, slots - beadsRef.current.length); if (count <= 0) return;
    const fresh = Array.from({ length: count }, () => ({ id: nextId.current++, stone }));
    // Thread on from the nearer tip of the string: left half of the tray enters at the left tip and joins the
    // left of the row, right half enters at the right tip and joins the right, so nothing passes through the pile.
    const trayImg = document.querySelector<HTMLElement>(`[data-tray="${stone}"] [data-bead]`);
    const rect = trayImg?.getBoundingClientRect(); const col = colRef.current?.getBoundingClientRect();
    const side: 0 | 1 = rect && col && rect.left + rect.width / 2 < col.left + col.width / 2 ? 0 : 1;
    setFolded(false); snapshot(); setBeads((b) => (side === 0 ? [...[...fresh].reverse(), ...b] : [...b, ...fresh]));
    setEntries((e) => { const n = { ...e }; for (const b of fresh) n[b.id] = side; return n; });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rect && !reduce) {
      const now = performance.now();
      setFlights((f) => [...f, ...fresh.map((b, k) => ({ id: b.id, stone, side, t0: now + k * 140, dur: 560, from: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, w: rect.width } }))]);
      trayImg?.animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(.3)", opacity: 0, offset: 0.22 }, { transform: "scale(.3)", opacity: 0, offset: 0.55 }, { transform: "scale(1.15)", opacity: 1, offset: 0.85 }, { transform: "scale(1)", opacity: 1 }], { duration: 720, easing: "ease-out" });
    }
  }, [pricing.maxGold, slots, snapshot]);
  // flight loop: aim every frame at the bead's live slot position reported by the stage
  useEffect(() => {
    if (!flights.length) return;
    let raf = 0;
    const tick = (now: number) => {
      const col = colRef.current?.getBoundingClientRect(); if (!col) return;
      const done: number[] = [];
      for (const f of flightsRef.current) {
        const el = flightEls.current.get(f.id); const to = stageRef.current?.endOf(f.side);
        if (!el || !to) continue;
        const k = Math.min(1, Math.max(0, (now - f.t0) / f.dur));
        if (now < f.t0) { el.style.opacity = "0"; continue; }
        const e = easeInOutQuad(k);
        const fx = f.from.x - col.left, fy = f.from.y - col.top, tx = to.x - col.left, ty = to.y - col.top;
        // swing out past the tip and come back onto it, as if threading the cord through the bead
        const lift = Math.max(30, Math.hypot(tx - fx, ty - fy) * 0.2);
        const cx = tx + (f.side === 0 ? -1 : 1) * 70, cy = Math.min(fy, ty) - lift;
        const q = 1 - e;
        const x = q * q * fx + 2 * q * e * cx + e * e * tx, y = q * q * fy + 2 * q * e * cy + e * e * ty;
        const size = f.from.w + (to.r * 2 - f.from.w) * e;
        el.style.opacity = "1";
        el.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px) rotate(${(1 - e) * 140}deg)`;
        el.style.width = el.style.height = `${size}px`;
        if (k >= 1) done.push(f.id);
      }
      if (done.length) setFlights((cur) => cur.filter((f) => !done.includes(f.id)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [flights.length]);
  const fillWithLast = useCallback(() => { const last = beadsRef.current[beadsRef.current.length - 1]; if (last && last.stone !== GOLD) add(last.stone, slots); }, [add, slots]);
  const repeatPattern = useCallback(() => {
    const cur = beadsRef.current; const room = slots - cur.length; if (!cur.length || room <= 0) return;
    const pattern = cur.map((b) => b.stone); const added: Bead[] = []; let gold = cur.filter((b) => b.stone === GOLD).length;
    for (let i = 0; added.length < room && i < slots * 3; i++) { const st = pattern[i % pattern.length]; if (st === GOLD) { if (gold >= pricing.maxGold) continue; gold++; } added.push({ id: nextId.current++, stone: st }); }
    setFolded(false); snapshot(); setBeads((b) => [...b, ...added]);
  }, [pricing.maxGold, slots, snapshot]);
  const removeBead = useCallback((id: number) => { setFolded(false); snapshot(); setBeads((b) => b.filter((x) => x.id !== id)); }, [snapshot]);
  const undo = useCallback(() => { setFolded(false); setFlights([]); setEntries({}); setHistory((h) => { const prev = h[h.length - 1]; if (prev) setBeads(prev); return h.slice(0, -1); }); }, []);
  const clear = useCallback(() => { setFolded(false); setFlights([]); setEntries({}); snapshot(); setBeads([]); }, [snapshot]);
  const changeSize = useCallback((k: WristSizeKey) => { setSize(k); setFolded(false); setFlights([]); const n = beadCount(BEAD_MM, WRIST_SIZES[k].cm); setBeads((b) => b.slice(0, n)); }, []);

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

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div ref={colRef} className="relative space-y-4">
        <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
          {flights.map((f) => <img key={f.id} ref={(el) => { if (el) flightEls.current.set(f.id, el); else flightEls.current.delete(f.id); }} src={spriteFor(f.stone) ?? undefined} alt="" className="absolute left-0 top-0 drop-shadow-[0_10px_10px_rgb(0_0_0/.25)]" style={{ opacity: 0, width: f.from.w, height: f.from.w, willChange: "transform" }} draggable={false} />)}
        </div>
        <div className="rounded-[1.5rem] bg-cb-band px-4 pt-4 pb-3 overflow-visible">
          <div className="flex items-baseline justify-between mb-3"><p className="label-caps">Tap a bead to string it</p><p className="text-[12px] text-cb-muted">{remaining} of {slots} to go</p></div>
          <div className="grid grid-cols-6 sm:grid-cols-9 gap-x-1 gap-y-3" role="listbox" aria-label="Beads">
            {tray.map((t) => {
              const disabled = remaining === 0 || (t.id === GOLD && goldCount >= pricing.maxGold);
              return (
                <button key={t.id} type="button" role="option" aria-selected={false} data-tray={t.id} disabled={disabled} onClick={() => add(t.id, qty)} title={`${t.name}${t.extra ? ` (+${t.extra} AED)` : ""}: ${t.keywords.join(", ")}`} className="group flex flex-col items-center gap-1 transition-opacity disabled:opacity-55 disabled:cursor-not-allowed">
                  <span className="relative block h-12 w-12 sm:h-14 sm:w-14 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-1.5 group-hover:scale-110 group-active:translate-y-0.5 group-active:scale-95">
                    <span className="absolute inset-x-1 -bottom-0.5 h-2 rounded-full bg-black/15 blur-[3px] transition-all duration-300 group-hover:inset-x-2 group-hover:opacity-60" />
                    {t.sprite ? <img data-bead src={t.sprite} alt="" className="relative block h-full w-full" loading="lazy" draggable={false} /> : <span data-bead className="relative block h-full w-full rounded-full bg-cb-line" />}
                    {t.extra > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-white px-1 text-[8px] leading-4 text-cb-rose shadow-sm">+{t.extra}</span>}
                  </span>
                  <span className="text-[10px] leading-tight text-center text-cb-muted group-hover:text-cb-ink">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative rounded-[1.5rem] bg-[radial-gradient(ellipse_at_50%_40%,white_0%,var(--cb-band)_78%)] px-2 pt-2 pb-2 overflow-hidden">
          <BraceletStage ref={stageRef} beads={beads} slots={slots} folded={folded} hidden={hidden} entries={entries} sprites={sprites} onRemove={removeBead} onBusy={setStageBusy} onHover={setHoverStone} />
          <div className="pointer-events-none absolute left-4 top-3 flex items-baseline gap-1.5 text-[12px] text-cb-muted"><span className="font-display text-[1.35rem] text-cb-ink tabular-nums">{beads.length}</span> / {slots}{hoverStone && <span className="ml-2">· {nameOf(hoverStone)} · tap to take off</span>}{busy && !hoverStone && <span className="ml-2">· stringing…</span>}</div>
          <div className="absolute right-4 top-3">
            {full && !folded && <button type="button" disabled={busy} onClick={() => setFolded(true)} className="cta-glow inline-flex h-9 items-center bg-cb-ink px-4 text-white text-[11px] uppercase tracking-[0.14em] transition-all hover:bg-black active:scale-[.97] disabled:opacity-60">Done · form the bracelet</button>}
            {folded && <button type="button" onClick={() => setFolded(false)} className="inline-flex h-9 items-center border border-cb-line bg-white px-4 text-[11px] uppercase tracking-[0.14em] transition-all hover:border-cb-ink active:scale-[.97]">Edit beads</button>}
          </div>
          {beads.length === 0 && <p className="pointer-events-none absolute inset-x-0 top-[38%] text-center text-[12px] tracking-[0.2em] text-cb-muted">TAP A BEAD ABOVE TO START</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <button type="button" onClick={undo} disabled={!history.length} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] transition-all hover:border-cb-ink active:scale-[.97] disabled:opacity-40">Undo</button>
          <button type="button" onClick={repeatPattern} disabled={!beads.length || !remaining} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] transition-all hover:border-cb-ink active:scale-[.97] disabled:opacity-40">Repeat pattern</button>
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
            <button type="button" onClick={fillWithLast} disabled={!remaining || !beads.length || beads[beads.length - 1]?.stone === GOLD} className="inline-flex h-11 items-center justify-center border border-cb-ink text-[12px] uppercase tracking-[0.14em] transition-all hover:bg-cb-ink hover:text-white active:scale-[.98] disabled:opacity-50" title="Fill the rest with the last stone you strung">Fill with the last stone</button>
            <button type="button" onClick={repeatPattern} disabled={!beads.length || !remaining} className="inline-flex h-11 items-center justify-center border border-cb-ink text-[12px] uppercase tracking-[0.14em] transition-all hover:bg-cb-ink hover:text-white active:scale-[.98] disabled:opacity-50">Repeat the pattern</button>
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
                {adding || cart.busy ? "Adding…" : complete ? `Add to bag · ${price} AED` : full ? (folded ? "Forming…" : "Press Done to form the bracelet") : busy ? "Stringing…" : `String ${remaining} more bead${remaining === 1 ? "" : "s"}`}
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
