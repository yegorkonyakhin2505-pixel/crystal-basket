import { flags, site } from "./site";
import { buildWhatsAppUrl, whatsappChatUrl, type OrderLine } from "./whatsapp";

/**
 * One place that decides how a shopper reaches us. While WhatsApp is off (N01 placeholder number),
 * every "message us" path becomes an email with the same prefilled text, so no button leads to a dead number.
 */
const mailto = (subject: string, body: string) =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const contactChannel = flags.whatsapp ? "WhatsApp" : "email";
export const contactLabel = flags.whatsapp ? "WhatsApp us" : "Email us";

export function contactUrl(message = "Hi Crystal Basket! I have a question.", subject = "A question for Crystal Basket"): string {
  return flags.whatsapp ? whatsappChatUrl(message) : mailto(subject, message);
}

/** Order-by-message link. Only rendered when WhatsApp is on; the bag and checkout cover ordering otherwise. */
export function orderByMessageUrl(lines: OrderLine[], note?: string, totalAED?: number): string | null {
  return flags.whatsapp ? buildWhatsAppUrl(lines, note, totalAED) : null;
}

/** True when a link opens an external app (WhatsApp) rather than the mail client. */
export const contactOpensNewTab = flags.whatsapp;
