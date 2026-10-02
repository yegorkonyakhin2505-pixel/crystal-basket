import { createRoot } from "react-dom/client";
import type { ComponentType } from "react";
import { SearchDialogIsland } from "@/components/SearchDialog";
import { CartDrawer } from "@/components/CartDrawer";
import { BagButton } from "@/components/BagButton";
import { WishlistButton } from "@/components/WishlistButton";
import { FilterBar } from "@/components/FilterBar";
import { BuyBox } from "@/components/BuyBox";
import { StackBuilder } from "@/components/StackBuilder";
import { BraceletBuilder } from "@/components/BraceletBuilder";
import { OfferPopup } from "@/components/OfferPopup";
import { NewsletterBar } from "@/components/NewsletterBar";
import { WishlistClient } from "@/components/WishlistClient";
import { initHeader } from "@/vanilla/header";
import { initReveal } from "@/vanilla/reveal";
import { initSmoothScroll } from "@/vanilla/smooth-scroll";
import { initBadges } from "@/vanilla/badges";

/**
 * Island runtime. Each `[data-island]` element carries its props in a JSON script child
 * (see snippets/cb-island.liquid). The component renders in place of the Liquid placeholder.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ISLANDS: Record<string, ComponentType<any>> = {
  SearchDialog: SearchDialogIsland,
  CartDrawer,
  BagButton,
  WishlistButton,
  FilterBar,
  BuyBox,
  StackBuilder,
  BraceletBuilder,
  OfferPopup,
  NewsletterBar,
  WishlistClient,
};

function mount(el: HTMLElement) {
  const name = el.dataset.island ?? "";
  const Component = ISLANDS[name];
  if (!Component) { console.warn(`[cb] unknown island "${name}"`); return; }
  const script = el.querySelector<HTMLScriptElement>(":scope > script[type='application/json']");
  let props: Record<string, unknown> = {};
  if (script) {
    try { props = JSON.parse(script.textContent || "{}"); } catch (e) { console.error(`[cb] bad props for ${name}`, e); }
    script.remove();
  }
  el.dataset.mounted = "1";
  createRoot(el).render(<Component {...props} />);
}

function boot() {
  document.documentElement.classList.add("js");
  initBadges();
  initHeader();
  document.querySelectorAll<HTMLElement>("[data-island]:not([data-mounted])").forEach(mount);
  initReveal();
  initSmoothScroll();
  // Islands added later (theme editor re-renders a section) mount as they appear.
  new MutationObserver(() => document.querySelectorAll<HTMLElement>("[data-island]:not([data-mounted])").forEach(mount)).observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
