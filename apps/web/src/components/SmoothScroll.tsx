"use client";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Lenis smooth scrolling, disabled for reduced-motion users.
 * On every client-side navigation the new page is pinned to the top immediately,
 * otherwise Lenis keeps easing toward the previous page's scroll position and a
 * product page opens part-way down. Back/forward keeps the browser's restored position.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenis = useRef<Lenis | null>(null);
  const popped = useRef(false);
  const path = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({ lerp: 0.1, smoothWheel: true, allowNestedScroll: true });
    lenis.current = instance;
    let raf = 0;
    const loop = (t: number) => { instance.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const onPop = () => { popped.current = true; };
    window.addEventListener("popstate", onPop);
    return () => { cancelAnimationFrame(raf); instance.destroy(); lenis.current = null; window.removeEventListener("popstate", onPop); };
  }, []);

  useEffect(() => {
    if (popped.current) { popped.current = false; return; }
    if (window.location.hash) return;
    lenis.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [path]);

  return <>{children}</>;
}
