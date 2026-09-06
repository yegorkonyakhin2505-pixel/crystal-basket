/** Shared client-side state for email capture (popup + bottom bar). */
export const SUB_KEY = "cb-subscribed";
export const OFFER_DISMISSED_KEY = "cb-offer-dismissed";
export const SUB_EVENT = "cb:subscribed";

export function isSubscribed(): boolean {
  try { return localStorage.getItem(SUB_KEY) === "1"; } catch { return false; }
}
export function markSubscribed(email: string) {
  try { localStorage.setItem(SUB_KEY, "1"); localStorage.setItem("cb-email", email); } catch {}
  window.dispatchEvent(new Event(SUB_EVENT));
}
/** Dismissal snoozes the popup for 7 days; subscribing hides it for good. */
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
export function isOfferDismissed(): boolean {
  try {
    const v = localStorage.getItem(OFFER_DISMISSED_KEY);
    if (!v) return false;
    const until = Number(v);
    return Number.isFinite(until) ? Date.now() < until : true;
  } catch { return false; }
}
export function dismissOffer() {
  try { localStorage.setItem(OFFER_DISMISSED_KEY, String(Date.now() + SNOOZE_MS)); } catch {}
}
