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
export function isOfferDismissed(): boolean {
  try { return localStorage.getItem(OFFER_DISMISSED_KEY) === "1"; } catch { return false; }
}
export function dismissOffer() {
  try { localStorage.setItem(OFFER_DISMISSED_KEY, "1"); } catch {}
}
