"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, X } from "lucide-react";
import { cn } from "@/components/ui";
import { routes } from "@/lib/paths";
import { useWishlist } from "@/hooks/useWishlist";
import { Wordmark } from "./Wordmark";

interface NavItem { href: string; label: string; menu?: "intentions" | "stones" }
interface Props {
  nav: NavItem[];
  intentions: { id: string; name: string; short: string; tagline: string }[];
  stones: { id: string; name: string; palette: [string, string] }[];
  whatsappUrl: string;
  siteName: string;
  city: string;
}

export function HeaderClient({ nav, intentions, stones, whatsappUrl, siteName, city }: Props) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const { count } = useWishlist();

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [path]);

  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href.replace(/\/$/, "")));

  return (
    <div className={cn("sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-cb-line transition-[padding] duration-300")}>
      {/* Utility row */}
      <div className={cn("container-x hidden lg:flex items-center justify-between text-[12px] text-cb-muted transition-all duration-300 overflow-hidden", compact ? "h-0 opacity-0" : "h-9 opacity-100")}>
        <div className="flex items-center gap-4">
          <span>🇦🇪 United Arab Emirates</span>
          <span className="text-cb-line">|</span>
          <span>Hand-strung in {city}</span>
        </div>
        <div className="flex items-center gap-4">
          <a href={whatsappUrl} target="_blank" rel="noopener" className="hover:text-cb-ink">WhatsApp us</a>
          <span className="text-cb-line">|</span>
          <Link href={routes.wishlist} className="inline-flex items-center gap-1.5 hover:text-cb-ink"><Heart className="h-3.5 w-3.5" /> Wishlist {count > 0 && <span className="rounded-full bg-cb-ink text-white text-[9px] px-1.5 py-0.5 leading-none">{count}</span>}</Link>
        </div>
      </div>

      {/* Wordmark row */}
      <div className={cn("container-x relative flex items-center justify-between lg:justify-center transition-all duration-300", compact ? "h-14" : "h-16 lg:h-24")}>
        <button className="lg:hidden p-2 -ml-2" aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
        <Link href={routes.home} aria-label={`${siteName} home`} className="block">
          <Wordmark className={cn("transition-all duration-300", compact ? "text-[1.2rem] lg:text-[1.6rem]" : "text-[1.35rem] lg:text-[2.6rem]")} />
        </Link>
        <div className="flex items-center gap-1 lg:absolute lg:right-8 lg:top-1/2 lg:-translate-y-1/2">
          <Link href={routes.shop} className="p-2 hover:text-cb-rose" aria-label="Search"><Search className="h-5 w-5" strokeWidth={1.5} /></Link>
          <Link href={routes.wishlist} className="relative p-2 hover:text-cb-rose" aria-label="Wishlist">
            <Heart className="h-5 w-5" strokeWidth={1.5} />
            {count > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-cb-ink text-white text-[9px] px-1.5 py-0.5 leading-none">{count}</span>}
          </Link>
        </div>
      </div>

      {/* Nav row */}
      <nav className={cn("hidden lg:flex container-x items-center justify-center gap-10 transition-all duration-300", compact ? "h-10" : "h-12")} aria-label="Primary">
        {nav.map((item) => (
          <div key={item.href} className="group relative h-full flex items-center">
            <Link href={item.href} className={cn("text-[14px] tracking-wide py-2 border-b border-transparent transition-colors hover:border-cb-ink", active(item.href) && "border-cb-ink")}>{item.label}</Link>
            {item.menu && (
              <div className="pointer-events-none absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
                <div className="w-[640px] bg-white border border-cb-line shadow-xl shadow-black/5 p-6">
                  {item.menu === "intentions" ? (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                      {intentions.map((i) => (
                        <Link key={i.id} href={routes.intention(i.id)} className="block py-2 border-b border-cb-line/60 hover:text-cb-rose">
                          <span className="block text-[14px]">{i.name}</span>
                          <span className="block text-[12px] text-cb-muted">{i.tagline}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-x-6 gap-y-0.5">
                      {stones.map((s) => (
                        <Link key={s.id} href={routes.stone(s.id)} className="flex items-center gap-2.5 py-1.5 text-[13px] hover:text-cb-rose">
                          <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: `radial-gradient(circle at 35% 30%, ${s.palette[0]}, ${s.palette[1]})` }} />
                          {s.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Wordmark className="text-[1.2rem]" />
              <button className="p-2 -mr-2" aria-label="Close menu" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col">
              {nav.map((n) => <Link key={n.href} href={n.href} className="py-3 border-b border-cb-line text-[16px]">{n.label}</Link>)}
            </nav>
            <p className="label-caps mt-6 mb-2">By intention</p>
            <div className="grid grid-cols-2 gap-1">{intentions.map((i) => <Link key={i.id} href={routes.intention(i.id)} className="py-1.5 text-[14px] text-cb-muted">{i.short}</Link>)}</div>
            <a href={whatsappUrl} target="_blank" rel="noopener" className="mt-6 block border border-cb-ink py-3 text-center text-[12px] uppercase tracking-[0.14em]">WhatsApp us</a>
          </div>
        </div>
      )}
    </div>
  );
}
