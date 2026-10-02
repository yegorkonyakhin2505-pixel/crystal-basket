import Lenis from "lenis";

/** Lenis smooth scrolling, disabled for reduced-motion users (mirror of apps/web SmoothScroll.tsx; every page is a full load here). */
export function initSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (document.documentElement.classList.contains("shopify-design-mode")) return; // theme editor scrolls the preview itself
  const instance = new Lenis({ lerp: 0.1, smoothWheel: true, allowNestedScroll: true });
  const loop = (t: number) => { instance.raf(t); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  (window as unknown as { cbLenis?: Lenis }).cbLenis = instance;
}
