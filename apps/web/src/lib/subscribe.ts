/** Shared client-side state for email capture (popup + bottom bar). */
export const SUB_KEY = "cb-subscribed";
export const OFFER_DISMISSED_KEY = "cb-offer-dismissed";
export const SUB_EVENT = "cb:subscribed";

export function isSubscribed(): boolean {
  try {
    const v = localStorage.getItem(SUB_KEY);
    if (!v) return false;
    const until = Number(v);
    if (!Number.isFinite(until)) { localStorage.removeItem(SUB_KEY); return false; } // clear legacy "1" values from testing
    return Date.now() < until;
  } catch { return false; }
}
export function markSubscribed(email: string) {
  try { localStorage.setItem(SUB_KEY, String(Date.now() + SUBSCRIBED_MS)); localStorage.setItem("cb-email", email); } catch {}
  window.dispatchEvent(new Event(SUB_EVENT));
}
/**
 * Closing the popup hides it for the rest of this browser tab only, so it
 * returns on the next visit. Subscribing hides it for 30 days.
 */
const SUBSCRIBED_MS = 30 * 24 * 60 * 60 * 1000;
export function isOfferDismissed(): boolean {
  try { return sessionStorage.getItem(OFFER_DISMISSED_KEY) === "1"; } catch { return false; }
}
export function dismissOffer() {
  try { sessionStorage.setItem(OFFER_DISMISSED_KEY, "1"); } catch {}
}
