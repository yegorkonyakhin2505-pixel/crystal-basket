"use client";
import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { flags, site } from "@/lib/site";
import { asset } from "@/lib/paths";
import { dismissOffer, isOfferDismissed, isSubscribed, markSubscribed } from "@/lib/subscribe";
import { LogoBadge } from "./LogoBadge";

/**
 * Welcome-offer modal. Opens once per browser after the visitor's first
 * interaction (scroll or click) plus a short delay, or after 12s idle.
 * TODO[NEEDED:N04] post the email to the newsletter provider; today it is
 * stored locally and the code is revealed immediately.
 */
export function OfferPopup() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!flags.offerPopup) return;
    const force = new URLSearchParams(window.location.search).get("offer") === "1";
    if (!force && (isSubscribed() || isOfferDismissed())) return;
    if (force) { setOpen(true); return; }
    let timer: number | undefined;
    let armed = false;
    const show = () => { if (!armed) { armed = true; timer = window.setTimeout(() => setOpen(true), 1500); cleanup(); } };
    const idle = window.setTimeout(show, 4000);
    const cleanup = () => { window.removeEventListener("scroll", show); };
    window.addEventListener("scroll", show, { passive: true, once: true });
    return () => { cleanup(); window.clearTimeout(idle); if (timer) window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  function close() { dismissOffer(); setOpen(false); }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    markSubscribed(email);
    setDone(true);
  }
  function copy() { navigator.clipboard?.writeText(site.welcome.code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="offer-title">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-[fadeIn_.3s_ease]" onClick={close} />
      <div className="relative w-full max-w-[860px] bg-white shadow-2xl grid md:grid-cols-2 overflow-hidden animate-[popIn_.45s_cubic-bezier(.22,1,.36,1)]">
        <div className="hidden md:block relative bg-cb-band">
          <img src={asset("/images/intentions/love.jpg")} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="p-8 md:p-12 flex flex-col justify-center min-h-[420px]">
          <button type="button" onClick={close} aria-label="Close" className="absolute right-3 top-3 p-2 text-cb-muted hover:text-cb-ink"><X className="h-5 w-5" /></button>
          {!done ? (
            <>
              <LogoBadge className="h-14 w-14 mb-4 text-cb-ink" />
              <p className="label-caps mb-3">Welcome to {site.name}</p>
              <h2 id="offer-title" className="text-[2.2rem] md:text-[2.6rem] leading-[1.05]">{site.welcome.pct}% off your first bracelet.</h2>
              <p className="text-cb-muted text-[14px] mt-4">Leave your email and we&apos;ll send your code, plus one note a month: when to cleanse your stones, and new pieces before Instagram sees them.</p>
              <form onSubmit={submit} className="mt-6 flex flex-col gap-2">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email*" className="h-12 w-full border border-cb-line px-4 text-[14px] text-cb-ink placeholder:text-cb-faint focus:border-cb-ink focus:outline-none" />
                <button type="submit" className="h-12 bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] hover:bg-black transition-colors">Get my {site.welcome.pct}% code</button>
              </form>
              <button type="button" onClick={close} className="mt-4 self-start text-[12px] text-cb-muted underline underline-offset-4 hover:text-cb-ink">No thanks, full price is fine</button>
              <p className="text-[10px] text-cb-faint mt-4">Unsubscribe any time. We never share your email.</p>
            </>
          ) : (
            <>
              <p className="label-caps mb-3">You&apos;re in</p>
              <h2 className="text-[2.2rem] leading-[1.05]">Your code is ready.</h2>
              <p className="text-cb-muted text-[14px] mt-3">Use it at checkout or mention it in your WhatsApp order.</p>
              <button type="button" onClick={copy} className="mt-6 flex items-center justify-between border border-dashed border-cb-ink px-5 py-4 hover:bg-cb-band transition-colors">
                <span className="font-display text-[1.6rem] tracking-[0.2em]">{site.welcome.code}</span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-cb-muted">{copied ? "Copied" : "Copy"}</span>
              </button>
              <button type="button" onClick={() => setOpen(false)} className="mt-6 h-12 bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] hover:bg-black">Start shopping</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
