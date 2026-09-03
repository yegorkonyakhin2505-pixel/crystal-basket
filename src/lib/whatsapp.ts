import site from '../data/site.json';

export interface OrderLine {
  name: string;
  bead?: number;
  size?: string;
  priceAED: number;
  qty?: number;
}

/** Build a wa.me deep link with a pre-filled, human-readable order message. */
export function buildWhatsAppUrl(lines: OrderLine[], note?: string): string {
  const body = lines
    .map((l) => {
      const spec = [l.bead ? `${l.bead}mm` : null, l.size ? `size ${l.size}` : null].filter(Boolean).join(', ');
      return `• ${l.name}${spec ? ` (${spec})` : ''} × ${l.qty ?? 1} — AED ${l.priceAED}`;
    })
    .join('\n');
  const total = lines.reduce((s, l) => s + l.priceAED * (l.qty ?? 1), 0);
  const text = [site.whatsappGreeting, body, `Total: AED ${total}`, note ?? '', 'Delivery address:'].filter(Boolean).join('\n');
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function whatsappChatUrl(message = 'Hi Crystal Basket! I have a question.'): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
