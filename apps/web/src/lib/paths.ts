/** Base-path-aware asset URL (GitHub Pages serves under /crystal-basket). Next's <Link> handles routes itself. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (path: string): string => `${BASE}${path}`;

export const routes = {
  home: "/",
  shop: "/shop/",
  stacks: "/stacks/",
  intentions: "/intentions/",
  intention: (id: string) => `/intentions/${id}/`,
  stones: "/stones/",
  stone: (id: string) => `/stones/${id}/`,
  product: (id: string) => `/products/${id}/`,
  about: "/about/",
  sizeGuide: "/size-guide/",
  care: "/care/",
  faq: "/faq/",
  disclaimer: "/disclaimer/",
  wishlist: "/wishlist/",
} as const;
