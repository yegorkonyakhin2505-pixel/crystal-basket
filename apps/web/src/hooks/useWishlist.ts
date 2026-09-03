"use client";
import { useCallback, useEffect, useState } from "react";

const KEY = "cb-wishlist";
const EVENT = "cb:wishlist";

function read(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

/** localStorage-backed wishlist shared across components via a window event. */
export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(read());
    const sync = () => setIds(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  const toggle = useCallback((id: string) => {
    const cur = read();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { ids, has: (id: string) => ids.includes(id), toggle, count: ids.length };
}
