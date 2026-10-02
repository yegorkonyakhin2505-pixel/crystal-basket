import { WISHLIST_EVENT, readWishlist } from "@/hooks/useWishlist";

/**
 * Wishlist count badges rendered by Liquid (`[data-wishlist-count]`): filled from localStorage and kept in sync
 * with the WishlistButton islands through the shared window event. The bag badge lives in the BagButton island.
 */
export function initBadges() {
  const paint = () => {
    const n = readWishlist().length;
    document.querySelectorAll<HTMLElement>("[data-wishlist-count]").forEach((el) => {
      el.textContent = String(n);
      el.hidden = n === 0;
    });
  };
  paint();
  window.addEventListener(WISHLIST_EVENT, paint);
  window.addEventListener("storage", paint);
}
