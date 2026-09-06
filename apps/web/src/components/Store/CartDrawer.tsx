"use client";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { site } from "@/lib/site";

export function CartDrawer() {
  const { enabled, cart, open, show, remove, busy, error } = useCart();
  if (!enabled || !open) return null;
  const lines = cart?.lines ?? [];
  const waUrl = buildWhatsAppUrl(lines.map((l) => ({ name: `${l.title} (${l.variantTitle})`, priceAED: l.priceAED, qty: l.quantity })));
  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Your bag">
      <div className="absolute inset-0 bg-black/40" onClick={() => show(false)} />
      <aside className="absolute right-0 inset-y-0 w-full max-w-md bg-white flex flex-col shadow-2xl animate-[slideIn_.4s_cubic-bezier(.22,1,.36,1)]">
        <div className="flex items-center justify-between px-6 h-16 border-b border-cb-line">
          <p className="font-display text-[1.4rem]">Your bag <span className="text-cb-muted text-[14px] font-body">({cart?.totalQuantity ?? 0})</span></p>
          <button onClick={() => show(false)} aria-label="Close" className="p-2 -mr-2 hover:text-cb-rose"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <div className="py-16 text-center text-cb-muted"><ShoppingBag className="h-8 w-8 mx-auto mb-3" strokeWidth={1.2} /><p>Your bag is empty.</p></div>
          ) : (
            <ul className="divide-y divide-cb-line">
              {lines.map((l) => (
                <li key={l.id} className="flex gap-4 py-4">
                  <div className="h-20 w-20 shrink-0 bg-cb-band overflow-hidden">{l.image && <img src={l.image} alt="" className="h-full w-full object-cover" />}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[1.15rem] leading-tight">{l.title}</p>
                    <p className="text-[12px] text-cb-muted">{l.variantTitle}{l.quantity > 1 && ` × ${l.quantity}`}</p>
                    <button onClick={() => remove(l.id)} disabled={busy} className="text-[11px] uppercase tracking-[0.14em] text-cb-muted underline underline-offset-4 mt-2 hover:text-cb-rose">Remove</button>
                  </div>
                  <p className="price text-[15px]">{(l.priceAED * l.quantity).toLocaleString()} AED</p>
                </li>
              ))}
            </ul>
          )}
          {error && <p className="text-[12px] text-cb-danger mt-3">{error}</p>}
        </div>
        <div className="border-t border-cb-line px-6 py-5 space-y-3">
          <div className="flex justify-between text-[15px]"><span>Subtotal</span><span className="price">{(cart?.subtotalAED ?? 0).toLocaleString()} AED</span></div>
          <p className="text-[11px] text-cb-muted">Delivery and discount codes are applied at checkout. {site.deliveryCopy}</p>
          <a href={cart?.checkoutUrl} aria-disabled={!lines.length} className={`inline-flex h-12 w-full items-center justify-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] hover:bg-black ${!lines.length && "pointer-events-none opacity-50"}`}>Checkout</a>
          <a href={waUrl} target="_blank" rel="noopener" className={`inline-flex h-12 w-full items-center justify-center border border-cb-ink text-[12px] uppercase tracking-[0.14em] hover:bg-cb-ink hover:text-white ${!lines.length && "pointer-events-none opacity-50"}`}>Order on WhatsApp instead</a>
        </div>
      </aside>
    </div>
  );
}
