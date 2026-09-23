"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BEAD_MM } from "@crystal-basket/catalog/schemas";
import { formatAED } from "@crystal-basket/catalog/money";
import { cn } from "@/components/ui";
import { useCart } from "@/hooks/useCart";
import { findVariantByOptions } from "@/lib/shopify";
import { contactOpensNewTab, contactUrl } from "@/lib/contact";
import { WRIST_SIZES, beadCount, type WristSizeKey } from "@/lib/sizes";

export interface BuilderStone { id: string; name: string; palette: [string, string]; tier: "classic" | "select" | "rare"; keywords: string[]; waterSafe: boolean; image: string | null }
export interface BuilderIntention { id: string; short: string; stones: string[] }
interface Pricing { handle: string; baseAED: number; tierAED: Record<"classic" | "select" | "rare", number>; goldAED: number; maxGold: number }

const GOLD = "gold";
const TIER_LABEL = { classic: "Classic", select: "Select", rare: "Rare" } as const;
const SIZE_KEYS = Object.keys(WRIST_SIZES) as WristSizeKey[];

type Bead = { id: number; stone: string };

/**
 * Build-your-own bracelet. Pick a wrist size (which sets the bead count), tap stones to drop beads
 * onto the ring one at a time, use the slider to drop several at once, or fill the rest in one go.
 * Every bead is 8 mm. The finished design goes to Shopify as the "custom-bracelet" variant that
 * matches the size, stone tier and gold bead, with the bead sequence on the order line.
 */
export function BraceletBuilder({ stones, intentions, pricing }: { stones: BuilderStone[]; intentions: BuilderIntention[]; pricing: Pricing }) {
  const [size, setSize] = useState<WristSizeKey>("M");
  const [beads, setBeads] = useState<Bead[]>([]);
  const [selected, setSelected] = useState<string>(stones[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [history, setHistory] = useState<Bead[][]>([]);
  const [recent, setRecent] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const nextId = useRef(1);
  const cart = useCart();

  const slots = beadCount(BEAD_MM, WRIST_SIZES[size].cm);
  const remaining = Math.max(0, slots - beads.length);
  const complete = beads.length === slots;
  const byId = useMemo(() => Object.fromEntries(stones.map((s) => [s.id, s])), [stones]);
  const goldCount = beads.filter((b) => b.stone === GOLD).length;

  // Restore a shared design from ?d=<size>.<stoneIndex|g>...
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("d");
    if (!d) return;
    const [sz, ...codes] = d.split(".");
    if (!SIZE_KEYS.includes(sz as WristSizeKey)) return;
    const restored: Bead[] = [];
    for (const c of codes) {
      const stone = c === "g" ? GOLD : stones[Number(c)]?.id;
      if (stone) restored.push({ id: nextId.current++, stone });
    }
    setSize(sz as WristSizeKey);
    setBeads(restored.slice(0, beadCount(BEAD_MM, WRIST_SIZES[sz as WristSizeKey].cm)));
  }, [stones]);

  useEffect(() => { setQty((q) => Math.min(Math.max(1, q), Math.max(1, remaining))); }, [remaining]);

  const commit = useCallback((next: Bead[], added: number[] = []) => {
    setHistory((h) => [...h.slice(-30), beads]);
    setBeads(next);
    setRecent(new Set(added));
  }, [beads]);

  const drop = useCallback((stone: string, count: number) => {
    if (stone === GOLD && goldCount + count > pricing.maxGold) count = Math.max(0, pricing.maxGold - goldCount);
    count = Math.min(count, remaining);
    if (count <= 0) return;
    const added = Array.from({ length: count }, () => ({ id: nextId.current++, stone }));
    commit([...beads, ...added], added.map((b) => b.id));
  }, [beads, commit, goldCount, pricing.maxGold, remaining]);

  const fillRest = useCallback(() => {
    if (!remaining) return;
    if (selected === GOLD) { drop(GOLD, remaining); return; }
    drop(selected, remaining);
  }, [drop, remaining, selected]);

  const repeatPattern = useCallback(() => {
    if (!beads.length || !remaining) return;
    const pattern = beads.map((b) => b.stone);
    const added: Bead[] = [];
    for (let i = 0; added.length < remaining; i++) {
      const stone = pattern[i % pattern.length];
      if (stone === GOLD && goldCount + added.filter((b) => b.stone === GOLD).length >= pricing.maxGold) continue;
      added.push({ id: nextId.current++, stone });
      if (i > slots * 3) break;
    }
    commit([...beads, ...added], added.map((b) => b.id));
  }, [beads, commit, goldCount, pricing.maxGold, remaining, slots]);

  const removeAt = useCallback((index: number) => { commit(beads.filter((_, i) => i !== index)); }, [beads, commit]);
  const undo = useCallback(() => { setHistory((h) => { const prev = h[h.length - 1]; if (prev) { setBeads(prev); setRecent(new Set()); } return h.slice(0, -1); }); }, []);
  const clear = useCallback(() => commit([]), [commit]);
  const changeSize = useCallback((k: WristSizeKey) => { setSize(k); const n = beadCount(BEAD_MM, WRIST_SIZES[k].cm); setBeads((b) => b.slice(0, n)); setRecent(new Set()); }, []);

  // Price and summary
  const usedStones = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of beads) counts.set(b.stone, (counts.get(b.stone) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [beads]);
  const tier = useMemo(() => {
    const tiers = usedStones.map(([id]) => byId[id]?.tier).filter(Boolean) as ("classic" | "select" | "rare")[];
    return tiers.includes("rare") ? "rare" : tiers.includes("select") ? "select" : "classic";
  }, [usedStones, byId]);
  const price = pricing.baseAED + pricing.tierAED[tier] + (goldCount > 0 ? pricing.goldAED : 0);
  const leans = useMemo(() => intentions
    .map((i) => ({ i, n: beads.filter((b) => i.stones.includes(b.stone)).length }))
    .filter((x) => x.n >= Math.max(3, slots / 4))
    .sort((a, b) => b.n - a.n).slice(0, 2), [beads, intentions, slots]);
  const keepDry = usedStones.some(([id]) => byId[id] && !byId[id].waterSafe);
  const designLine = usedStones.map(([id, n]) => `${id === GOLD ? "gold-filled bead" : byId[id].name} ×${n}`).join(", ");
  const sequence = beads.map((b) => (b.stone === GOLD ? "gold" : byId[b.stone].name)).join(" › ");
  const shareCode = `${size}.${beads.map((b) => (b.stone === GOLD ? "g" : stones.findIndex((s) => s.id === b.stone))).join(".")}`;

  const addToBag = useCallback(async () => {
    setAdding(true); setAddError(null);
    try {
      const merchandiseId = await findVariantByOptions(pricing.handle, { "Wrist size": size, Stones: TIER_LABEL[tier], "Gold bead": goldCount > 0 ? "Yes" : "No" });
      await cart.add([{ merchandiseId, attributes: [
        { key: "Design", value: designLine },
        { key: "Beads in order", value: sequence },
        { key: "Wrist size", value: `${size} · ${WRIST_SIZES[size].cm} cm` },
      ] }]);
    } catch (e) { setAddError((e as Error).message); }
    finally { setAdding(false); }
  }, [cart, designLine, goldCount, pricing.handle, sequence, size, tier]);

  const share = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}?d=${shareCode}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { window.prompt("Copy your design link", url); }
  }, [shareCode]);

  const emailUrl = contactUrl(`Hi Crystal Basket! I designed a bracelet in the builder.\nWrist size: ${size} (${WRIST_SIZES[size].cm} cm)\nBeads: ${designLine}\nOrder: ${sequence}\nPrice shown: ${price} AED\nLink: ${typeof window !== "undefined" ? `${window.location.origin}/build/?d=${shareCode}` : ""}`, "Custom bracelet design");

  // Ring geometry, same look as the product fallback art.
  const cx = 200, cy = 200, R = 150;
  const r = ((Math.PI * 2 * R) / slots / 2) * 0.94;
  const chip = (on: boolean) => cn("group relative flex flex-col items-center gap-1.5 border p-2 text-center transition-colors", on ? "border-cb-ink bg-cb-band" : "border-cb-line hover:border-cb-ink");

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      {/* Ring */}
      <div>
        <div className="relative mx-auto max-w-[560px]">
          <svg viewBox="0 0 400 400" className="block h-auto w-full" role="img" aria-label={`Your bracelet: ${beads.length} of ${slots} beads placed`}>
            <defs>
              {stones.map((s) => (
                <radialGradient key={s.id} id={`bb-${s.id}`} cx="35%" cy="32%" r="70%"><stop offset="0%" stopColor={s.palette[0]} /><stop offset="100%" stopColor={s.palette[1]} /></radialGradient>
              ))}
              <radialGradient id="bb-gold" cx="35%" cy="32%" r="70%"><stop offset="0%" stopColor="color-mix(in srgb, var(--cb-gold) 40%, white)" /><stop offset="100%" stopColor="color-mix(in srgb, var(--cb-gold) 65%, black)" /></radialGradient>
              <radialGradient id="bb-shine" cx="30%" cy="25%" r="60%"><stop offset="0%" stopColor="white" stopOpacity=".55" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
            </defs>
            <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.92} fill="none" stroke="var(--cb-line)" strokeWidth="1.5" strokeDasharray="3 5" />
            {Array.from({ length: slots }).map((_, i) => {
              const a = (i / slots) * Math.PI * 2 - Math.PI / 2;
              const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R * 0.92;
              const bead = beads[i];
              if (!bead) {
                const nextSlot = i === beads.length;
                return (
                  <g key={`slot-${i}`} onClick={() => drop(selected, 1)} className="cursor-pointer">
                    <circle cx={x} cy={y} r={r} fill="var(--cb-band)" stroke="var(--cb-line)" strokeWidth={nextSlot ? 1.5 : 1} strokeDasharray={nextSlot ? "0" : "2 3"} className="bead-slot" opacity={nextSlot ? 1 : 0.7} />
                    {nextSlot && <circle cx={x} cy={y} r={r * 0.28} fill="var(--cb-muted)" opacity=".35" />}
                  </g>
                );
              }
              const fill = bead.stone === GOLD ? "url(#bb-gold)" : `url(#bb-${bead.stone})`;
              return (
                <g key={bead.id} className={cn("cursor-pointer", recent.has(bead.id) && "bead-drop")} style={recent.has(bead.id) ? { animationDelay: `${[...recent].indexOf(bead.id) * 70}ms` } : undefined} onClick={() => removeAt(i)}>
                  <title>{bead.stone === GOLD ? "Gold-filled bead" : byId[bead.stone].name}. Click to remove.</title>
                  <circle cx={x} cy={y + r * 0.18} r={r * 0.95} fill="black" opacity=".12" />
                  <circle cx={x} cy={y} r={r} fill={fill} />
                  <circle cx={x} cy={y} r={r} fill="url(#bb-shine)" />
                </g>
              );
            })}
            <text x={cx} y={cy - 6} textAnchor="middle" className="font-display" fontSize="26" fill="var(--cb-ink)">{beads.length} / {slots}</text>
            <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" letterSpacing="2" fill="var(--cb-muted)">{complete ? "READY TO STRING" : `${remaining} TO GO`}</text>
          </svg>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[12px]">
          <button type="button" onClick={undo} disabled={!history.length} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] hover:border-cb-ink disabled:opacity-40">Undo</button>
          <button type="button" onClick={repeatPattern} disabled={!beads.length || !remaining} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] hover:border-cb-ink disabled:opacity-40">Repeat pattern</button>
          <button type="button" onClick={clear} disabled={!beads.length} className="border border-cb-line px-3 py-1.5 uppercase tracking-[0.12em] hover:border-cb-ink disabled:opacity-40">Clear</button>
          <span className="text-cb-muted ml-2">Tap a bead on the ring to remove it.</span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-7">
        <div>
          <div className="flex justify-between mb-2"><span className="label-caps">1 · Wrist size</span><span className="text-[12px] text-cb-muted">{slots} beads of {BEAD_MM} mm</span></div>
          <div className="flex gap-2">
            {SIZE_KEYS.map((k) => (
              <button key={k} type="button" onClick={() => changeSize(k)} aria-pressed={size === k} className={cn("flex-1 border py-2.5 px-3 text-left text-[13px] transition-colors", size === k ? "border-cb-ink bg-cb-ink text-white" : "border-cb-line hover:border-cb-ink")}>
                <span className="block">{k} · {WRIST_SIZES[k].cm} cm</span><span className={cn("block text-[11px]", size === k ? "opacity-80" : "text-cb-muted")}>{WRIST_SIZES[k].fits}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label-caps mb-2">2 · Pick a stone</p>
          <div className="grid grid-cols-4 gap-1.5 max-h-[300px] overflow-y-auto pr-1" role="listbox" aria-label="Stones">
            {stones.map((s) => (
              <button key={s.id} type="button" role="option" aria-selected={selected === s.id} onClick={() => setSelected(s.id)} className={chip(selected === s.id)} title={`${s.name}: ${s.keywords.join(", ")}`}>
                <span className="h-9 w-9 rounded-full ring-1 ring-black/10" style={{ background: `radial-gradient(circle at 35% 30%, ${s.palette[0]}, ${s.palette[1]})` }} />
                <span className="text-[10px] leading-tight line-clamp-2">{s.name}</span>
                {s.tier !== "classic" && <span className="absolute right-1 top-1 text-[8px] uppercase tracking-[0.1em] text-cb-rose">+{pricing.tierAED[s.tier]}</span>}
              </button>
            ))}
            <button type="button" role="option" aria-selected={selected === GOLD} onClick={() => setSelected(GOLD)} className={chip(selected === GOLD)} title="14k gold-filled bead">
              <span className="h-9 w-9 rounded-full ring-1 ring-black/10 bg-cb-gold" />
              <span className="text-[10px] leading-tight">Gold bead</span>
              <span className="absolute right-1 top-1 text-[8px] uppercase tracking-[0.1em] text-cb-rose">+{pricing.goldAED}</span>
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2"><span className="label-caps">3 · Drop beads</span><span className="text-[12px] text-cb-muted">{remaining} slot{remaining === 1 ? "" : "s"} left</span></div>
          <div className="flex items-center gap-3">
            <input type="range" min={1} max={Math.max(1, selected === GOLD ? Math.min(remaining, pricing.maxGold - goldCount) : remaining)} value={qty} onChange={(e) => setQty(Number(e.target.value))} disabled={!remaining} className="flex-1 accent-cb-ink" aria-label="How many beads to drop" />
            <span className="price w-14 text-right text-[15px]">×{qty}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => drop(selected, qty)} disabled={!remaining || (selected === GOLD && goldCount >= pricing.maxGold)} className="inline-flex h-11 items-center justify-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] hover:bg-black disabled:opacity-50">Drop {qty} {selected === GOLD ? "gold" : byId[selected]?.name.split(" ")[0]}</button>
            <button type="button" onClick={fillRest} disabled={!remaining || selected === GOLD} className="inline-flex h-11 items-center justify-center border border-cb-ink text-[12px] uppercase tracking-[0.14em] hover:bg-cb-ink hover:text-white disabled:opacity-50">Fill the rest</button>
          </div>
          {selected === GOLD && <p className="text-[11px] text-cb-muted mt-2">Up to {pricing.maxGold} gold-filled beads per bracelet.</p>}
        </div>

        <div className="border border-cb-line p-5 bg-white">
          <div className="flex items-baseline justify-between"><p className="font-display text-[1.4rem]">Your bracelet</p><p className="price text-[1.4rem]">{formatAED(price)}</p></div>
          <p className="text-[12px] text-cb-muted mt-1">{pricing.baseAED} AED base{pricing.tierAED[tier] ? ` + ${pricing.tierAED[tier]} for ${TIER_LABEL[tier].toLowerCase()} stones` : ""}{goldCount ? ` + ${pricing.goldAED} for the gold bead` : ""}. Any three bracelets are still 15% off together.</p>
          <ul className="mt-4 space-y-1.5 text-[13px]">
            {usedStones.length === 0 && <li className="text-cb-muted">No beads yet. Pick a stone and tap the ring.</li>}
            {usedStones.map(([id, n]) => (
              <li key={id} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: id === GOLD ? "var(--cb-gold)" : `radial-gradient(circle at 35% 30%, ${byId[id].palette[0]}, ${byId[id].palette[1]})` }} />
                <span className="flex-1">{id === GOLD ? "Gold-filled bead" : byId[id].name}</span><span className="text-cb-muted">×{n}</span>
              </li>
            ))}
          </ul>
          {leans.length > 0 && <p className="text-[12px] text-cb-muted mt-3">Traditionally worn for {leans.map((l) => l.i.short.toLowerCase()).join(" and ")}.</p>}
          {keepDry && <p className="text-[12px] text-cb-muted mt-1">One of these stones dislikes water: cleanse with smoke, selenite or moonlight.</p>}
          <div className="mt-5 grid gap-2">
            {cart.enabled ? (
              <button type="button" onClick={addToBag} disabled={!complete || adding || cart.busy} className="inline-flex h-12 items-center justify-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] hover:bg-black disabled:opacity-50">
                {adding || cart.busy ? "Adding…" : complete ? `Add to bag · ${price} AED` : `Fill ${remaining} more bead${remaining === 1 ? "" : "s"}`}
              </button>
            ) : (
              <a href={complete ? emailUrl : undefined} aria-disabled={!complete} {...(contactOpensNewTab ? { target: "_blank", rel: "noopener" } : {})} className={cn("inline-flex h-12 items-center justify-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] hover:bg-black", !complete && "pointer-events-none opacity-50")}>Order this design</a>
            )}
            <button type="button" onClick={share} disabled={!beads.length} className="inline-flex h-11 items-center justify-center border border-cb-line text-[12px] uppercase tracking-[0.14em] hover:border-cb-ink disabled:opacity-50">{copied ? "Link copied" : "Copy design link"}</button>
            {(addError || cart.error) && <p className="text-[12px] text-cb-danger text-center">{addError ?? cart.error}</p>}
          </div>
          <p className="text-[11px] text-cb-faint mt-4">Strung to order in Dubai, usually within two working days, on 1 mm stretch cord. Crystal meanings describe traditional beliefs, not medical advice.</p>
        </div>
      </div>
    </div>
  );
}
