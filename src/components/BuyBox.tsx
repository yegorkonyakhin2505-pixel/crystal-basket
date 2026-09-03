import { useMemo, useState } from 'react';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { WRIST_SIZES } from '../lib/format';

interface Props {
  name: string;
  priceAED: number;
  compareAtAED?: number;
  beadSizes: number[];
  defaultBead: number;
  sizes: ('S' | 'M' | 'L')[];
  inStock: boolean;
  stripePaymentLink?: string;
  freeDeliveryAED: number;
  deliveryCopy: string;
}

export default function BuyBox(p: Props) {
  const [bead, setBead] = useState(p.defaultBead);
  const [size, setSize] = useState<'S' | 'M' | 'L'>(p.sizes.includes('M') ? 'M' : p.sizes[0]);

  const waUrl = useMemo(
    () => buildWhatsAppUrl([{ name: p.name, bead, size, priceAED: p.priceAED }]),
    [p.name, bead, size, p.priceAED],
  );

  const stripeUrl = p.stripePaymentLink
    ? `${p.stripePaymentLink}${p.stripePaymentLink.includes('?') ? '&' : '?'}client_reference_id=${encodeURIComponent(`${bead}mm-${size}`)}`
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <span className="price text-2xl">AED {p.priceAED}</span>
        {p.compareAtAED && <span className="price text-muted line-through">AED {p.compareAtAED}</span>}
        <span className="text-[0.78rem] text-muted">
          {p.priceAED >= p.freeDeliveryAED ? 'Free UAE delivery' : `Free delivery over AED ${p.freeDeliveryAED}`}
        </span>
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="eyebrow">Bead size</span>
          <span className="text-[0.75rem] text-muted">{bead === 6 ? 'Slim, stacks well' : bead === 8 ? 'Classic, most popular' : 'Statement'}</span>
        </div>
        <div className="flex gap-2">
          {p.beadSizes.map((b) => (
            <button
              key={b}
              onClick={() => setBead(b)}
              className={`flex-1 py-2.5 rounded-brand border text-[0.9rem] transition-colors ${bead === b ? 'border-text bg-text text-bg' : 'border-border hover:border-text'}`}
              aria-pressed={bead === b}
            >
              {b} mm
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="eyebrow">Wrist size</span>
          <a href="/size-guide" className="text-[0.75rem] text-accent hover:underline">How to measure</a>
        </div>
        <div className="flex gap-2">
          {p.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`flex-1 py-2.5 rounded-brand border text-left px-3 transition-colors ${size === s ? 'border-text bg-text text-bg' : 'border-border hover:border-text'}`}
              aria-pressed={size === s}
            >
              <span className="block text-[0.9rem]">{s} · {WRIST_SIZES[s].cm} cm</span>
              <span className={`block text-[0.7rem] ${size === s ? 'opacity-80' : 'text-muted'}`}>{WRIST_SIZES[s].fits}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2.5">
        {stripeUrl ? (
          <a href={stripeUrl} className="btn btn-primary w-full !py-3.5" target="_blank" rel="noopener">
            Buy now · AED {p.priceAED}
          </a>
        ) : (
          <button className="btn btn-primary w-full !py-3.5" disabled title="Card checkout link not set yet">
            Card checkout · coming soon
          </button>
        )}
        <a href={waUrl} target="_blank" rel="noopener" className="btn btn-outline w-full !py-3.5">
          <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5C9.9 8.9 9.3 7.4 9 6.7c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.5-.2M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2m0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2"/></svg>
          Order on WhatsApp
        </a>
        {!p.inStock && <p className="text-[0.8rem] text-muted">Currently made to order. Message us for the wait time.</p>}
      </div>

      <ul className="text-[0.82rem] text-muted space-y-1.5">
        <li>· {p.deliveryCopy}</li>
        <li>· Cash on delivery available across the UAE</li>
        <li>· Free re-string if the cord ever gives</li>
      </ul>
    </div>
  );
}
