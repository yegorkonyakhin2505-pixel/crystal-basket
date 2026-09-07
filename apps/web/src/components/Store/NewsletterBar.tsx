"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { site } from "@/lib/site";
import { SUB_EVENT, isSubscribed, markSubscribed } from "@/lib/subscribe";

/**
 * Sticky bottom newsletter bar (Swarovski pattern). Dismissable per browser, hidden once
 * subscribed, and it renders its own spacer so the footer is never covered.
 * TODO[NEEDED:N04] post the email to the newsletter provider; today the welcome code is
 * shown inline and the address is only kept in this browser.
 */
export function NewsletterBar() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const keepOpen = useRef(false);

  useEffect(() => {
    const sync = () => {
      if (keepOpen.current) return;
      try { setShow(!localStorage.getItem("cb-nl-dismissed") && !isSubscribed()); } catch { setShow(true); }
    };
    sync();
    window.addEventListener(SUB_EVENT, sync);
    return () => window.removeEventListener(SUB_EVENT, sync);
  }, []);
  if (!show) return null;

  const dismiss = () => { keepOpen.current = false; setShow(false); try { localStorage.setItem("cb-nl-dismissed", "1"); } catch {} };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    keepOpen.current = true;
    markSubscribed(email);
    setDone(true);
  };

  return (
    <>
      <div aria-hidden className="h-[68px]" />
      <div className="fixed bottom-0 inset-x-0 z-30 bg-cb-ink text-white print-hidden" role="region" aria-label="Newsletter">
        <div className="container-x flex items-center gap-4 py-3">
          {done ? (
            <p className="flex-1 text-[14px]">
              You&apos;re in. Use <span className="font-display text-[1.25rem] tracking-[0.2em] mx-1.5">{site.welcome.code}</span> at checkout for {site.welcome.pct}% off your first bracelet.
            </p>
          ) : (
            <>
              <p className="hidden md:block flex-1 text-[15px]">We&apos;d love to stay in touch. Join for {site.welcome.pct}% off your first bracelet.</p>
              <form onSubmit={submit} className="flex flex-1 md:flex-none md:w-[440px]">
                <label htmlFor="nl-email" className="sr-only">Email</label>
                <input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email*" className="h-11 min-w-0 flex-1 bg-white px-4 text-[14px] text-cb-ink placeholder:text-cb-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cb-rose" />
                <button type="submit" className="h-11 px-6 bg-white text-cb-ink text-[12px] uppercase tracking-[0.14em] border-l border-cb-line hover:bg-cb-band">Subscribe</button>
              </form>
            </>
          )}
          <button onClick={dismiss} aria-label="Close" className="p-2 -mr-2 hover:text-cb-faint"><X className="h-4 w-4" /></button>
        </div>
      </div>
    </>
  );
}
