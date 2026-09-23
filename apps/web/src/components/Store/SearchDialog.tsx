"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/components/ui";
import { useDialog } from "@/hooks/useDialog";

export interface SearchItem { kind: "product" | "stone" | "intention" | "page"; title: string; sub?: string; href: string; image?: string | null; keywords?: string; priceAED?: number; soldOut?: boolean }

const KIND_LABEL = { product: "Bracelets", stone: "Stones", intention: "Intentions", page: "Pages" } as const;
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’]/g, "");

/** Site search over the static catalog: bracelets, stones, intentions and guide pages, with live results. */
export function SearchDialog({ open, onClose, items }: { open: boolean; onClose: () => void; items: SearchItem[] }) {
  const [q, setQ] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useDialog(open, onClose, panel, input);
  useEffect(() => { if (open) setQ(""); }, [open]);

  const results = useMemo(() => {
    const tokens = norm(q).split(/\s+/).filter(Boolean);
    if (!tokens.length) return null;
    const scored = items.map((it) => {
      const hay = norm(`${it.title} ${it.sub ?? ""} ${it.keywords ?? ""}`); const title = norm(it.title);
      if (!tokens.every((t) => hay.includes(t))) return null;
      const score = (tokens.every((t) => title.includes(t)) ? 2 : 0) + (title.startsWith(tokens[0]) ? 1 : 0) + (it.kind === "product" ? 0.5 : 0) - (it.soldOut ? 0.25 : 0);
      return { it, score };
    }).filter((x): x is { it: SearchItem; score: number } => x !== null).sort((a, b) => b.score - a.score);
    const groups = (["product", "stone", "intention", "page"] as const).map((k) => ({ kind: k, items: scored.filter((s) => s.it.kind === k).slice(0, k === "product" ? 8 : 5).map((s) => s.it) })).filter((g) => g.items.length);
    return { groups, first: scored[0]?.it ?? null, total: scored.length };
  }, [items, q]);
  const suggestions = useMemo(() => items.filter((i) => i.kind === "intention").slice(0, 8), [items]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] print-hidden" data-lenis-prevent>
      <div className="absolute inset-0 bg-black/40 animate-[fadeIn_.25s_ease]" onClick={onClose} />
      <div ref={panel} role="dialog" aria-modal="true" aria-label="Search" className="absolute inset-x-3 top-3 sm:inset-x-auto sm:left-1/2 sm:top-[8vh] sm:w-[640px] sm:-translate-x-1/2 bg-white shadow-2xl animate-[popIn_.3s_cubic-bezier(.22,1,.36,1)] max-h-[86vh] flex flex-col">
        <form className="flex items-center gap-3 border-b border-cb-line px-4 sm:px-5" onSubmit={(e) => { e.preventDefault(); if (results?.first) { onClose(); router.push(results.first.href); } }}>
          <Search className="h-5 w-5 shrink-0 text-cb-muted" strokeWidth={1.5} />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search bracelets, stones, intentions…" aria-label="Search" autoComplete="off" spellCheck={false} className="h-14 flex-1 bg-transparent text-[16px] outline-none placeholder:text-cb-faint" />
          {q && <button type="button" onClick={() => setQ("")} aria-label="Clear" className="p-1 text-cb-muted hover:text-cb-ink"><X className="h-4 w-4" /></button>}
          <button type="button" onClick={onClose} className="ml-1 text-[11px] uppercase tracking-[0.14em] text-cb-muted hover:text-cb-ink">Close</button>
        </form>
        <div className="overflow-y-auto">
          {!results && (
            <div className="px-4 sm:px-5 py-5">
              <p className="label-caps mb-3">Shop by intention</p>
              <div className="flex flex-wrap gap-2">{suggestions.map((s) => <Link key={s.href} href={s.href} onClick={onClose} className="border border-cb-line px-3 py-1.5 text-[13px] hover:border-cb-ink">{s.title}</Link>)}</div>
              <p className="text-[12px] text-cb-muted mt-5">Try a stone (“amethyst”), a feeling (“calm”), or a piece (“The Shield”).</p>
            </div>
          )}
          {results && results.total === 0 && <p className="px-5 py-10 text-center text-cb-muted text-[14px]">Nothing matches “{q}”. Try a stone name or an intention.</p>}
          {results && results.groups.map((g) => (
            <div key={g.kind} className="py-2">
              <p className="label-caps px-4 sm:px-5 pt-3 pb-1">{KIND_LABEL[g.kind]}</p>
              <ul>
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} onClick={onClose} className={cn("flex items-center gap-3 px-4 sm:px-5 py-2 hover:bg-cb-band", it === results.first && "bg-cb-band/60")}>
                      <span className={cn("h-11 w-11 shrink-0 overflow-hidden bg-white", it.kind === "stone" ? "rounded-full" : "")}>{it.image ? <img src={it.image} alt="" className="h-full w-full object-cover" loading="lazy" /> : <span className="block h-full w-full bg-cb-band" />}</span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-[14px] leading-tight", it.kind === "product" && "font-display text-[1.1rem]")}>{it.title}{it.soldOut && <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-cb-muted">Sold out</span>}</span>
                        {it.sub && <span className="block text-[12px] text-cb-muted truncate">{it.sub}</span>}
                      </span>
                      {it.priceAED != null && <span className="price text-[13px]">{it.priceAED} AED</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
