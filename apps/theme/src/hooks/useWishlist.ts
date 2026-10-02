"use client";
import { useCallback, useEffect, useState } from "react";

export const WISHLIST_KEY = "cb-wishlist";
export const WISHLIST_EVENT = "cb:wishlist";

export function readWishlist(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch { return []; }
}
function write(ids: string[]) {
  try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids)); } catch {}
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

/** localStorage-backed wishlist shared across components via a window event. `ready` is false until the first read. */
export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setIds(readWishlist()); setReady(true);
    const sync = () => setIds(readWishlist());
    window.addEventListener(WISHLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(WISHLIST_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  const toggle = useCallback((id: string) => {
    const cur = readWishlist();
    write(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }, []);
  /** Drop ids of products that no longer exist so the badge count stays honest. */
  const prune = useCallback((valid: string[]) => {
    const cur = readWishlist();
    const next = cur.filter((id) => valid.includes(id));
    if (next.length !== cur.length) write(next);
  }, []);
  return { ids, ready, has: (id: string) => ids.includes(id), toggle, prune, count: ids.length };
}
