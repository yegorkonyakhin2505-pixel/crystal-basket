import Link from "next/link";
import { getIntentions } from "@crystal-basket/catalog";
import { site } from "@/lib/site";
import { routes } from "@/lib/paths";
import { Wordmark } from "./Wordmark";

export function Footer() {
  const intentions = getIntentions();
  const year = new Date().getFullYear();
  const cols = [
    { title: "Shop", links: [[routes.shop, "All bracelets"], [routes.stacks, "Stacks & sets"], [routes.stones, "Stone library"], [routes.wishlist, "Wishlist"]] },
    { title: "Intentions", links: intentions.map((i) => [routes.intention(i.id), i.data.name] as [string, string]) },
    { title: "Help", links: [[routes.sizeGuide, "Size guide"], [routes.care, "Cleanse & care"], [routes.faq, "FAQ"], [routes.disclaimer, "Wellness disclaimer"]] },
    { title: "Crystal Basket", links: [[routes.about, "Our story"], [`https://instagram.com/${site.instagram}`, "Instagram"], [`https://tiktok.com/@${site.tiktok}`, "TikTok"], [`mailto:${site.email}`, "Email us"]] },
  ];
  return (
    <footer className="bg-cb-band border-t border-cb-line mt-24 pb-24 lg:pb-20">
      <div className="container-x py-14 grid gap-10 md:grid-cols-4">
        {cols.map((c) => (
          <div key={c.title}>
            <p className="label-caps mb-4">{c.title}</p>
            <ul className="space-y-2 text-[13px]">
              {c.links.map(([href, label]) => (
                <li key={href}>{href.startsWith("http") || href.startsWith("mailto") ? <a href={href} target="_blank" rel="noopener" className="hover:text-cb-rose">{label}</a> : <Link href={href} className="hover:text-cb-rose">{label}</Link>}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-x border-t border-cb-line pt-6 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between text-[11px] text-cb-muted">
        <Wordmark className="text-[0.9rem]" />
        <p>© {year} {site.name}, {site.city}. Crystal meanings reflect traditional beliefs and are not medical advice.</p>
      </div>
    </footer>
  );
}
