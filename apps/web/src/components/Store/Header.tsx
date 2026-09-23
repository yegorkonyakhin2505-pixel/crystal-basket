import { getIntentions, getProducts, getStones } from "@crystal-basket/catalog";
import { intentionImage, productImage, stoneImage } from "@/lib/images";
import type { SearchItem } from "./SearchDialog";
import { site } from "@/lib/site";
import { routes } from "@/lib/paths";
import { contactLabel, contactOpensNewTab, contactUrl } from "@/lib/contact";
import { HeaderClient } from "./HeaderClient";

/** Swarovski-style header: utility row, centered wordmark, nav row beneath. Server component; interactive bits in HeaderClient. */
export function Header() {
  const intentions = getIntentions();
  const stones = getStones();
  const search: SearchItem[] = [
    ...getProducts().map((p) => ({ kind: "product" as const, title: p.data.name, sub: `${p.data.seoTitle} · ${p.data.stones.map((id) => stones.find((s) => s.id === id)?.data.name).filter(Boolean).join(", ")}`, href: routes.product(p.id), image: productImage(p), keywords: `${p.data.subtitle} ${p.data.tags.join(" ")} ${p.data.triad.join(" ")} ${intentions.find((i) => i.id === p.data.intention)?.data.name ?? ""} ${p.data.leavingSoon ? "leaving soon limited" : ""} ${p.data.bestseller ? "bestseller" : ""}`, priceAED: p.data.priceAED, soldOut: !p.data.inStock })),
    ...stones.map((s) => ({ kind: "stone" as const, title: s.data.name, sub: s.data.keywords.join(" · "), href: routes.stone(s.id), image: stoneImage(s), keywords: `${s.data.chakra.join(" ")} ${s.data.zodiac.join(" ")} ${s.data.color} crystal stone meaning` })),
    ...intentions.map((i) => ({ kind: "intention" as const, title: i.data.name, sub: i.data.tagline, href: routes.intention(i.id), image: intentionImage(i), keywords: `${i.data.short} ${i.data.triad.join(" ")} ${i.data.chakra.join(" ")}` })),
    { kind: "page" as const, title: "Build your own bracelet", sub: "Design it bead by bead", href: routes.build, keywords: "custom builder design make" },
    { kind: "page" as const, title: "Stacks & sets", sub: "Three bracelets, 15% off", href: routes.stacks, keywords: "stack set bundle discount" },
    { kind: "page" as const, title: "Size guide", sub: "Measure your wrist", href: routes.sizeGuide, keywords: "size wrist cm measure fit" },
    { kind: "page" as const, title: "Cleanse & care", sub: "Moonlight, selenite, smoke", href: routes.care, keywords: "clean cleanse charge water sun care" },
    { kind: "page" as const, title: "Delivery", sub: "UAE, 1–2 working days", href: routes.delivery, keywords: "shipping delivery cod cash uae dubai" },
    { kind: "page" as const, title: "Exchanges & returns", sub: "14-day size exchange", href: routes.returns, keywords: "return refund exchange" },
    { kind: "page" as const, title: "FAQ", sub: "Wearing, cleansing, ordering", href: routes.faq, keywords: "questions help" },
    { kind: "page" as const, title: "Contact", sub: "Email and Instagram", href: routes.contact, keywords: "email whatsapp contact instagram" },
  ];
  const nav = [
    { href: routes.shop, label: "All bracelets" },
    { href: routes.intentions, label: "By intention", menu: "intentions" as const },
    { href: routes.stones, label: "By stone", menu: "stones" as const },
    { href: routes.stacks, label: "Stacks & sets" },
    { href: routes.build, label: "Build your own" },
    { href: routes.about, label: "Our story" },
  ];
  return (
    <>
      <div className="bg-cb-ink text-white text-[11px] tracking-[0.12em] uppercase text-center py-2 px-4">{site.announcement}</div>
      <header className="sticky top-0 z-40 bg-white">
      <HeaderClient
        nav={nav}
        intentions={intentions.map((i) => ({ id: i.id, name: i.data.name, short: i.data.short, tagline: i.data.tagline }))}
        stones={stones.map((s) => ({ id: s.id, name: s.data.name, palette: s.data.palette, image: stoneImage(s) }))}
        search={search}
        contact={{ href: contactUrl(), label: contactLabel, newTab: contactOpensNewTab }}
        siteName={site.name}
        city={site.city}
      />
      </header>
    </>
  );
}
