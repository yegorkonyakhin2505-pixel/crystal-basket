"use client";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/components/ui";

export interface FilterOption { id: string; label: string }
export interface FilterState { intention: string[]; stone: string[]; bead: string[]; style: string[]; price: string[] }
export type SortKey = "recommended" | "price-asc" | "price-desc" | "new";

const PRICE_BANDS: FilterOption[] = [
  { id: "0-229", label: "Under 230 AED" },
  { id: "230-289", label: "230 – 289 AED" },
  { id: "290-999", label: "290 AED and up" },
];

/**
 * Swarovski-style sticky filter bar (centered dropdowns) + results/sort band.
 * Filters the already-rendered product tiles via data-* attributes so the page
 * stays fully static. Phase 2 swaps this for API-backed filtering.
 */
export function FilterBar({ intentions, stones, total, gridId }: { intentions: FilterOption[]; stones: FilterOption[]; total: number; gridId: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const [state, setState] = useState<FilterState>({ intention: [], stone: [], bead: [], style: [], price: [] });
  const [sort, setSort] = useState<SortKey>("recommended");
  const [visible, setVisible] = useState(total);

  const groups = useMemo(
    () => [
      { key: "intention" as const, label: "Intention", options: intentions },
      { key: "stone" as const, label: "Stone", options: stones },
      { key: "bead" as const, label: "Bead size", options: [{ id: "6", label: "6 mm · slim" }, { id: "8", label: "8 mm · classic" }, { id: "10", label: "10 mm · statement" }] },
      { key: "style" as const, label: "Style", options: [{ id: "women", label: "Slim & feminine" }, { id: "unisex", label: "Unisex" }, { id: "men", label: "Men’s" }, { id: "gold", label: "Gold accent" }] },
      { key: "price" as const, label: "Price", options: PRICE_BANDS },
    ],
    [intentions, stones],
  );

  useEffect(() => {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    const tiles = Array.from(grid.querySelectorAll<HTMLElement>("a[data-price]"));
    let n = 0;
    const scored = tiles.map((t, i) => {
      const price = Number(t.dataset.price);
      const ok =
        (state.intention.length === 0 || state.intention.includes(t.dataset.intention ?? "")) &&
        (state.stone.length === 0 || state.stone.some((s) => (t.dataset.stones ?? "").split(" ").includes(s))) &&
        (state.bead.length === 0 || state.bead.some((b) => (t.dataset.bead ?? "").split(" ").includes(b))) &&
        (state.style.length === 0 || state.style.some((s) => (s === "gold" ? t.dataset.gold === "1" : t.dataset.style === s))) &&
        (state.price.length === 0 || state.price.some((band) => { const [lo, hi] = band.split("-").map(Number); return price >= lo && price <= hi; }));
      t.style.display = ok ? "" : "none";
      if (ok) n++;
      return { t, price, i, isNew: t.querySelector("span")?.textContent === "New" };
    });
    const order = [...scored].sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "new" ? Number(b.isNew) - Number(a.isNew) || a.i - b.i : a.i - b.i,
    );
    order.forEach((o) => grid.appendChild(o.t));
    setVisible(n);
  }, [state, sort, gridId]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest("[data-filter-root]")) setOpen(null); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const toggle = (key: keyof FilterState, id: string) =>
    setState((s) => ({ ...s, [key]: s[key].includes(id) ? s[key].filter((x) => x !== id) : [...s[key], id] }));
  const activeCount = Object.values(state).reduce((n, a) => n + a.length, 0);

  return (
    <div data-filter-root className="sticky top-[56px] lg:top-[88px] z-30">
      <div className="bg-white/95 backdrop-blur-sm border-y border-cb-line">
        <div className="container-x flex items-center justify-start lg:justify-center gap-2 lg:gap-10 overflow-x-auto py-3 text-[14px]">
          {groups.map((g) => {
            const n = state[g.key].length;
            return (
              <div key={g.key} className="relative shrink-0">
                <button type="button" onClick={() => setOpen(open === g.key ? null : g.key)} className={cn("inline-flex items-center gap-1.5 py-1.5 px-2 whitespace-nowrap hover:text-cb-rose", n > 0 && "text-cb-rose")} aria-expanded={open === g.key}>
                  {g.label}{n > 0 && ` (${n})`} <ChevronDown className={cn("h-4 w-4 transition-transform", open === g.key && "rotate-180")} />
                </button>
                {open === g.key && (
                  <div className="absolute left-0 top-full mt-2 min-w-[240px] max-h-[360px] overflow-y-auto bg-white border border-cb-line shadow-xl shadow-black/5 p-3 z-40">
                    {g.options.map((o) => {
                      const on = state[g.key].includes(o.id);
                      return (
                        <label key={o.id} className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-cb-band text-[14px]">
                          <span className={cn("h-4 w-4 border flex items-center justify-center", on ? "bg-cb-ink border-cb-ink text-white" : "border-cb-line")}>{on && "✓"}</span>
                          <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(g.key, o.id)} />
                          {o.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-cb-band border-b border-cb-line">
        <div className="container-x flex items-center justify-between py-3 text-[13px]">
          <p className="italic">{visible} Results{activeCount > 0 && <button type="button" onClick={() => setState({ intention: [], stone: [], bead: [], style: [], price: [] })} className="ml-3 not-italic underline underline-offset-4 hover:text-cb-rose">Clear filters</button>}</p>
          <label className="inline-flex items-center gap-2">
            <span className="text-cb-muted">Sort by:</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="bg-transparent font-medium focus:outline-none cursor-pointer">
              <option value="recommended">Recommended</option>
              <option value="new">New in</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
