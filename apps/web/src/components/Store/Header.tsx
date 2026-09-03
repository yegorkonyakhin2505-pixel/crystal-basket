import Link from "next/link";
import { getIntentions, getStones } from "@crystal-basket/catalog";
import { site } from "@/lib/site";
import { routes } from "@/lib/paths";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { HeaderClient } from "./HeaderClient";

/** Swarovski-style header: utility row, centered wordmark, nav row beneath. Server component; interactive bits in HeaderClient. */
export function Header() {
  const intentions = getIntentions();
  const stones = getStones();
  const nav = [
    { href: routes.shop, label: "All bracelets" },
    { href: routes.intentions, label: "By intention", menu: "intentions" as const },
    { href: routes.stones, label: "By stone", menu: "stones" as const },
    { href: routes.stacks, label: "Stacks & sets" },
    { href: routes.about, label: "Our story" },
  ];
  return (
    <header className="relative z-40 bg-white">
      <div className="bg-cb-ink text-white text-[11px] tracking-[0.12em] uppercase text-center py-2 px-4">{site.announcement}</div>
      <HeaderClient
        nav={nav}
        intentions={intentions.map((i) => ({ id: i.id, name: i.data.name, short: i.data.short, tagline: i.data.tagline }))}
        stones={stones.map((s) => ({ id: s.id, name: s.data.name, palette: s.data.palette }))}
        whatsappUrl={whatsappChatUrl()}
        siteName={site.name}
        city={site.city}
      />
    </header>
  );
}
