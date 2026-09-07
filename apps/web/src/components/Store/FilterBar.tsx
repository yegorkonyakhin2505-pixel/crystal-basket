"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/components/ui";

export interface FilterOption { id: string; label: string }
type GroupKey = "intention" | "stone" | "style" | "price";
export type FilterState = Record<GroupKey, string[]>;
export type SortKey = "recommended" | "price-asc" | "price-desc" | "new";

const EMPTY: FilterState = { intention: [], stone: [], style: [], price: [] };
const PRICE_BANDS: FilterOption[] = [
  { id: "0-74", label: "Under 75 AED" },
  { id: "75-89", label: "75 – 89 AED" },
  { id: "90-9999", label: "90 AED and up" },
];
const STYLES: FilterOption[] = [
  { id: "women", label: "Slim & feminine" },
  { id: "unisex", label: "Unisex" },
  { id: "men", label: "Men’s" },
  { id: "gold", label: "Gold accent" },
];
const SORTS: { id: SortKey; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "new", label: "New in" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
];

interface Tile { el: HTMLElement; index: number; price: number; intention: string; stones: string[]; style: string; gold: boolean; isNew: boolean }

const readTiles = (grid: HTMLElement): Tile[] =>
  Array.from(grid.querySelectorAll<HTMLElement>("[data-price]")).map((el, index) => ({
    el, index,
    price: Number(el.dataset.price),
    intention: el.dataset.intention ?? "",
    stones: (el.dataset.stones ?? "").split(" "),
    style: el.dataset.style ?? "",
    gold: el.dataset.gold === "1",
    isNew: el.dataset.new === "1",
  }));

const hit = (t: Tile, key: GroupKey, id: string): boolean => {
  if (key === "intention") return t.intention === id;
  if (key === "stone") return t.stones.includes(id);
  if (key === "style") return id === "gold" ? t.gold : t.style === id;
  const [lo, hi] = id.split("-").map(Number);
  return t.price >= lo && t.price <= hi;
};
const matches = (t: Tile, state: FilterState, skip?: GroupKey) =>
  (Object.keys(state) as GroupKey[]).every((k) => k === skip || state[k].length === 0 || state[k].some((id) => hit(t, k, id)));

function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(mq.matches);
    sync(); mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return desktop;
}

/**
 * Sticky filter row (Swarovski-style, centred) + results band with chips and sort.
 * Desktop: each group opens a small anchored popover. Mobile: a bottom sheet.
 * Filters the already-rendered product tiles via data-* attributes so the page stays static.
 */
export function FilterBar({ intentions, stones, total, gridId }: { intentions: FilterOption[]; stones: FilterOption[]; total: number; gridId: string }) {
  const [open, setOpen] = useState<GroupKey | "sort" | null>(null);
  const [state, setState] = useState<FilterState>(EMPTY);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [visible, setVisible] = useState(total);
  const tiles = useRef<Tile[]>([]);
  const [, setReady] = useState(false);
  const desktop = useDesktop();

  const groups = useMemo(
    () => [
      { key: "intention" as const, label: "Intention", options: intentions },
      { key: "stone" as const, label: "Stone", options: stones },
      { key: "style" as const, label: "Style", options: STYLES },
      { key: "price" as const, label: "Price", options: PRICE_BANDS },
    ],
    [intentions, stones],
  );
  const labelOf = (key: GroupKey, id: string) => groups.find((g) => g.key === key)?.options.find((o) => o.id === id)?.label ?? id;

  useEffect(() => {
    const grid = document.getElementById(gridId);
    if (grid) { tiles.current = readTiles(grid); setReady(true); }
  }, [gridId]);

  useEffect(() => {
    const grid = document.getElementById(gridId);
    if (!grid || tiles.current.length === 0) return;
    let n = 0;
    const shown = tiles.current.map((t) => {
      const ok = matches(t, state);
      t.el.style.display = ok ? "" : "none";
      if (ok) n++;
      return t;
    });
    const order = [...shown].sort((a, b) =>
      sort === "price-asc" ? a.price - b.price || a.index - b.index
        : sort === "price-desc" ? b.price - a.price || a.index - b.index
        : sort === "new" ? Number(b.isNew) - Number(a.isNew) || a.index - b.index
        : a.index - b.index,
    );
    order.forEach((t) => grid.appendChild(t.el));
    setVisible(n);
  }, [state, sort, gridId]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest("[data-filter-root]")) setOpen(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKey); };
  }, [open]);

  // Lock page scroll behind the mobile sheet.
  const sheetOpen = Boolean(open && open !== "sort" && !desktop);
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [sheetOpen]);

  const toggle = useCallback((key: GroupKey, id: string) =>
    setState((s) => ({ ...s, [key]: s[key].includes(id) ? s[key].filter((x) => x !== id) : [...s[key], id] })), []);
  const clear = (key: GroupKey) => setState((s) => ({ ...s, [key]: [] }));
  const countFor = (key: GroupKey, id: string) => tiles.current.filter((t) => matches(t, state, key) && hit(t, key, id)).length;
  const active = (Object.keys(state) as GroupKey[]).flatMap((k) => state[k].map((id) => ({ key: k, id })));

  const panel = (g: (typeof groups)[number]) => {
    const n = state[g.key].length;
    return (
      <div data-filter-root className={cn("bg-white text-cb-ink", desktop ? "absolute left-1/2 top-full z-40 mt-2 w-[290px] -translate-x-1/2 border border-cb-line shadow-xl shadow-black/10" : "fixed inset-x-0 bottom-0 z-[60] max-h-[78vh] flex flex-col rounded-t-2xl shadow-2xl")} role="dialog" aria-label={`Filter by ${g.label.toLowerCase()}`}>
        {!desktop && (
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="label-caps">{g.label}</span>
            <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="p-2 -mr-2"><X className="h-5 w-5" strokeWidth={1.5} /></button>
          </div>
        )}
        <ul data-lenis-prevent className={cn("overflow-y-auto py-1.5", desktop ? "max-h-[360px]" : "flex-1")}>
          {g.options.map((o) => {
            const on = state[g.key].includes(o.id);
            const count = countFor(g.key, o.id);
            const off = count === 0 && !on;
            return (
              <li key={o.id}>
                <label className={cn("flex items-center gap-3 px-5 py-2.5 text-[14px] transition-colors", off ? "text-cb-faint cursor-default" : "cursor-pointer hover:bg-cb-band")}>
                  <input type="checkbox" className="sr-only" checked={on} disabled={off} onChange={() => toggle(g.key, o.id)} />
                  <span aria-hidden className={cn("flex h-[15px] w-[15px] shrink-0 items-center justify-center border transition-colors", on ? "border-cb-ink bg-cb-ink" : off ? "border-cb-line" : "border-cb-faint")}>
                    {on && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                  <span className="flex-1">{o.label}</span>
                  <span className="text-[12px] tabular-nums text-cb-muted">{count}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-cb-line px-5 py-3">
          <button type="button" onClick={() => clear(g.key)} disabled={n === 0} className="text-[12px] text-cb-muted underline underline-offset-4 hover:text-cb-ink disabled:no-underline disabled:opacity-40">Clear</button>
          <button type="button" onClick={() => setOpen(null)} className="h-9 bg-cb-ink px-4 text-[11px] uppercase tracking-[0.14em] text-white hover:bg-black">Show {visible} {visible === 1 ? "piece" : "pieces"}</button>
        </div>
      </div>
    );
  };

  return (
    <div data-filter-root className="sticky top-14 lg:top-[96px] z-30 print-hidden">
      <div className="border-y border-cb-line bg-white/95 backdrop-blur-sm">
        <div className="container-x">
          <div className="flex items-center gap-1 py-2 text-[14px] max-lg:overflow-x-auto max-lg:[scrollbar-width:none] lg:justify-center lg:gap-6">
            {groups.map((g) => {
              const n = state[g.key].length;
              const isOpen = open === g.key;
              return (
                <div key={g.key} className="relative shrink-0">
                  <button type="button" onClick={() => setOpen(isOpen ? null : g.key)} aria-expanded={isOpen} aria-haspopup="dialog" className={cn("inline-flex items-center gap-1.5 px-2.5 py-2 whitespace-nowrap transition-colors hover:text-cb-rose", isOpen && "text-cb-rose", n > 0 && !isOpen && "font-medium")}>
                    {g.label}
                    {n > 0 && <span className="inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-cb-ink px-1 text-[10px] leading-none text-white">{n}</span>}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-180")} strokeWidth={1.75} />
                  </button>
                  {isOpen && desktop && panel(g)}
                  {isOpen && !desktop && typeof document !== "undefined" && createPortal(
                    <>
                      <div className="fixed inset-0 z-[55] bg-black/30" onClick={() => setOpen(null)} />
                      {panel(g)}
                    </>,
                    document.body,
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-b border-cb-line bg-cb-band">
        <div className="container-x flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 text-[13px]">
          <p className="italic shrink-0">{visible} {visible === 1 ? "Result" : "Results"}</p>
          {active.map((a) => (
            <button key={`${a.key}:${a.id}`} type="button" onClick={() => toggle(a.key, a.id)} className="inline-flex items-center gap-1.5 border border-cb-line bg-white px-2.5 py-1 text-[12px] transition-colors hover:border-cb-ink" aria-label={`Remove ${labelOf(a.key, a.id)}`}>
              {labelOf(a.key, a.id)} <X className="h-3 w-3" strokeWidth={1.75} />
            </button>
          ))}
          {active.length > 0 && <button type="button" onClick={() => setState(EMPTY)} className="text-[12px] underline underline-offset-4 text-cb-muted hover:text-cb-ink">Clear all</button>}
          <div className="relative ml-auto">
            <button type="button" onClick={() => setOpen(open === "sort" ? null : "sort")} aria-expanded={open === "sort"} aria-haspopup="listbox" className="inline-flex items-center gap-1.5 py-1 hover:text-cb-rose">
              <span className="text-cb-muted">Sort by:</span>
              <span className="font-medium">{SORTS.find((s) => s.id === sort)?.label}</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open === "sort" && "rotate-180")} strokeWidth={1.75} />
            </button>
            {open === "sort" && (
              <ul role="listbox" aria-label="Sort by" className="absolute right-0 top-full z-40 mt-2 w-[220px] border border-cb-line bg-white py-1.5 shadow-xl shadow-black/10">
                {SORTS.map((s) => {
                  const on = s.id === sort;
                  return (
                    <li key={s.id} role="option" aria-selected={on}>
                      <button type="button" onClick={() => { setSort(s.id); setOpen(null); }} className={cn("flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] hover:bg-cb-band", on && "font-medium")}>
                        {s.label}{on && <Check className="h-3.5 w-3.5" strokeWidth={2} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
