"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { flags, site } from "@/lib/site";
import { SUB_EVENT, isSubscribed } from "@/lib/subscribe";

/** Swarovski-style sticky bottom newsletter bar. Dismissable, remembered per browser. */
export function NewsletterBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const sync = () => { try { setShow(!localStorage.getItem("cb-nl-dismissed") && !isSubscribed()); } catch { setShow(true); } };
    sync();
    window.addEventListener(SUB_EVENT, sync);
    return () => window.removeEventListener(SUB_EVENT, sync);
  }, []);
  if (!show) return null;
  const dismiss = () => { setShow(false); try { localStorage.setItem("cb-nl-dismissed", "1"); } catch {} };
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-cb-ink text-white">
      <div className="container-x flex items-center gap-4 py-3">
        <p className="hidden md:block flex-1 text-[15px]">We&apos;d love to stay in touch. Join for {site.welcome.pct}% off your first bracelet.</p>
        <form
          className="flex flex-1 md:flex-none md:w-[440px]"
          action={flags.newsletter ? undefined : `mailto:${site.email}?subject=Newsletter`}
          method="post"
          encType="text/plain"
        >
          <input type="email" name="email" required placeholder="Email*" className="h-11 flex-1 bg-white px-4 text-[14px] text-cb-ink placeholder:text-cb-faint focus:outline-none" />
          <button type="submit" className="h-11 px-6 bg-white text-cb-ink text-[12px] uppercase tracking-[0.14em] border-l border-cb-line hover:bg-cb-band">Subscribe</button>
        </form>
        <button onClick={dismiss} aria-label="Close" className="p-2 -mr-2 hover:text-cb-faint"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
