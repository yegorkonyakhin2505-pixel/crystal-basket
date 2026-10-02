/**
 * Behaviour for the Liquid-rendered header (sections/cb-header.liquid), mirroring HeaderClient.tsx:
 *  - compact on scroll with hysteresis (shrink past 160px, grow back only above 40px);
 *  - mega-menus open on hover/focus, close on Escape, outside pointer or leaving;
 *  - mobile drawer as a dialog (scroll lock, focus trap, Escape);
 *  - the search buttons dispatch `cb:search` for the SearchDialog island.
 * Markup contract: [data-header], [data-compact-hide], [data-compact] elements carry the two class lists in
 * data-class-open / data-class-compact; [data-menu-root] wraps a nav item with [data-menu-panel] inside;
 * [data-drawer-open], [data-drawer], [data-drawer-close], [data-drawer-backdrop], [data-search-open].
 */
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function initHeader() {
  const header = document.querySelector<HTMLElement>("[data-header]");
  if (!header) return;

  // Compact header: swap the class lists declared on each element.
  const swap = (compact: boolean) => {
    header.querySelectorAll<HTMLElement>("[data-class-compact]").forEach((el) => {
      const open = (el.dataset.classOpen ?? "").split(/\s+/).filter(Boolean);
      const small = (el.dataset.classCompact ?? "").split(/\s+/).filter(Boolean);
      el.classList.remove(...(compact ? open : small));
      el.classList.add(...(compact ? small : open));
    });
  };
  let current = false;
  const onScroll = () => {
    const y = window.scrollY;
    const next = current ? y > 40 : y > 160;
    if (next !== current) { current = next; swap(next); }
  };
  swap(false);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mega menus
  const roots = Array.from(header.querySelectorAll<HTMLElement>("[data-menu-root]"));
  let openRoot: HTMLElement | null = null;
  const SHOWN = ["opacity-100", "translate-y-0", "pointer-events-auto"];
  const HIDDEN = ["opacity-0", "translate-y-1", "pointer-events-none", "invisible"];
  const setMenu = (root: HTMLElement | null) => {
    if (openRoot === root) return;
    for (const r of roots) {
      const panel = r.querySelector<HTMLElement>("[data-menu-panel]");
      const link = r.querySelector<HTMLElement>("[data-menu-link]");
      const on = r === root;
      if (panel) { panel.classList.remove(...(on ? HIDDEN : SHOWN)); panel.classList.add(...(on ? SHOWN : HIDDEN)); }
      link?.setAttribute("aria-expanded", String(on));
    }
    openRoot = root;
  };
  for (const r of roots) {
    r.addEventListener("mouseenter", () => setMenu(r));
    r.addEventListener("mouseleave", () => setMenu(null));
    r.addEventListener("focusin", () => setMenu(r));
    r.addEventListener("focusout", (e) => { if (!r.contains(e.relatedTarget as Node | null)) setMenu(null); });
    r.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(null)));
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(null); });
  document.addEventListener("pointerdown", (e) => { if (!(e.target as HTMLElement).closest("[data-menu-root]")) setMenu(null); }, true);

  // Mobile drawer
  const drawerWrap = header.querySelector<HTMLElement>("[data-drawer-wrap]");
  const drawer = header.querySelector<HTMLElement>("[data-drawer]");
  let previous: HTMLElement | null = null;
  let prevOverflow = "";
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); closeDrawer(); return; }
    if (e.key !== "Tab" || !drawer) return;
    const items = Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const openDrawer = () => {
    if (!drawerWrap || !drawer) return;
    previous = document.activeElement as HTMLElement | null;
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerWrap.hidden = false;
    header.querySelectorAll("[data-drawer-open]").forEach((b) => b.setAttribute("aria-expanded", "true"));
    drawer.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    document.addEventListener("keydown", onKey);
  };
  const closeDrawer = () => {
    if (!drawerWrap || drawerWrap.hidden) return;
    drawerWrap.hidden = true;
    header.querySelectorAll("[data-drawer-open]").forEach((b) => b.setAttribute("aria-expanded", "false"));
    document.body.style.overflow = prevOverflow;
    document.removeEventListener("keydown", onKey);
    previous?.focus?.({ preventScroll: true });
  };
  header.querySelectorAll("[data-drawer-open]").forEach((b) => b.addEventListener("click", openDrawer));
  header.querySelectorAll("[data-drawer-close], [data-drawer-backdrop]").forEach((b) => b.addEventListener("click", closeDrawer));
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeDrawer));

  // Search
  header.querySelectorAll("[data-search-open]").forEach((b) => b.addEventListener("click", () => { closeDrawer(); window.dispatchEvent(new CustomEvent("cb:search")); }));
}
