/**
 * Shopify Storefront API client (public token, safe in the browser).
 * Our site stays the storefront; Shopify handles cart, checkout, orders.
 * Switched on when NEXT_PUBLIC_SHOPIFY_DOMAIN + NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
 * are set at build time (deploy.yml reads them from repo vars/secrets).
 * TODO[NEEDED:N11] Storefront API token from the custom app in Shopify admin.
 */
export const SHOPIFY = {
  domain: process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN ?? "",
  token: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? "",
  apiVersion: "2025-07",
} as const;
export const shopifyEnabled = Boolean(SHOPIFY.domain && SHOPIFY.token);

export const FRIENDLY_ERROR = "We couldn't reach the shop just now. Please try again in a moment.";

/** Thrown when Shopify no longer knows the stored cart (expired or checked out). Callers start a fresh one. */
export class CartGoneError extends Error {
  constructor() { super("Your bag had expired, so we started a new one."); this.name = "CartGoneError"; }
}

export interface CartLine { id: string; quantity: number; title: string; variantTitle: string; handle: string; priceAED: number; image?: string }
export interface Cart { id: string; checkoutUrl: string; totalQuantity: number; subtotalAED: number; lines: CartLine[] }

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  let res: Response;
  let json: { data?: T; errors?: { message: string }[] };
  try {
    res = await fetch(`https://${SHOPIFY.domain}/api/${SHOPIFY.apiVersion}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": SHOPIFY.token },
      body: JSON.stringify({ query, variables }),
    });
    json = (await res.json()) as typeof json;
  } catch (e) {
    console.error("Shopify request failed", e);
    throw new Error(FRIENDLY_ERROR);
  }
  if (!res.ok || json.errors?.length) {
    console.error("Shopify error", res.status, json.errors);
    throw new Error(FRIENDLY_ERROR);
  }
  return json.data as T;
}

const CART_FIELDS = `
  id checkoutUrl totalQuantity
  cost { subtotalAmount { amount currencyCode } }
  lines(first: 50) { nodes { id quantity merchandise { ... on ProductVariant { title product { title handle } price { amount } image { url(transform: { maxWidth: 240, maxHeight: 240 }) } } } } }
`;
interface RawCart { id: string; checkoutUrl: string; totalQuantity: number; cost: { subtotalAmount: { amount: string; currencyCode: string } }; lines: { nodes: { id: string; quantity: number; merchandise: { title: string; product: { title: string; handle: string }; price: { amount: string }; image?: { url: string } } }[] } }
interface MutationResult { cart: RawCart | null; userErrors: { message: string }[] }

function shape(c: RawCart): Cart {
  return {
    id: c.id, checkoutUrl: c.checkoutUrl, totalQuantity: c.totalQuantity, subtotalAED: Number(c.cost.subtotalAmount.amount),
    lines: c.lines.nodes.map((l) => ({ id: l.id, quantity: l.quantity, title: l.merchandise.product.title, handle: l.merchandise.product.handle, variantTitle: l.merchandise.title, priceAED: Number(l.merchandise.price.amount), image: l.merchandise.image?.url })),
  };
}
function settle(r: MutationResult, existing: boolean): Cart {
  if (r.cart) return shape(r.cart);
  const msg = r.userErrors.map((e) => e.message).join(" ");
  if (existing && /cart|not found|does not exist/i.test(msg || "cart")) throw new CartGoneError();
  throw new Error(msg || FRIENDLY_ERROR);
}

/** Resolve the Shopify variant for a product handle + wrist size ("Wrist size" option, values "S · 16 cm" etc., as in the CSV import). */
export async function findVariantId(handle: string, size: string): Promise<string> {
  const data = await gql<{ product: { variants: { nodes: { id: string; availableForSale: boolean; selectedOptions: { name: string; value: string }[] }[] } } | null }>(
    `query($handle: String!) { product(handle: $handle) { variants(first: 50) { nodes { id availableForSale selectedOptions { name value } } } } }`,
    { handle },
  );
  const v = data.product?.variants.nodes.find((n) => {
    const wrist = n.selectedOptions.find((o) => o.name.toLowerCase().startsWith("wrist"))?.value ?? "";
    return wrist.trim().toUpperCase().startsWith(size.toUpperCase());
  });
  if (!v) throw new Error(`This size is not available online yet. Order it on WhatsApp and we will string it for you.`);
  return v.id;
}

export async function cartCreate(lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const d = await gql<{ cartCreate: MutationResult }>(`mutation($lines: [CartLineInput!]!) { cartCreate(input: { lines: $lines }) { cart { ${CART_FIELDS} } userErrors { message } } }`, { lines });
  return settle(d.cartCreate, false);
}
export async function cartLinesAdd(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const d = await gql<{ cartLinesAdd: MutationResult }>(`mutation($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } } }`, { cartId, lines });
  return settle(d.cartLinesAdd, true);
}
export async function cartLinesRemove(cartId: string, lineIds: string[]): Promise<Cart> {
  const d = await gql<{ cartLinesRemove: MutationResult }>(`mutation($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ${CART_FIELDS} } userErrors { message } } }`, { cartId, lineIds });
  return settle(d.cartLinesRemove, true);
}
export async function cartFetch(cartId: string): Promise<Cart | null> {
  const d = await gql<{ cart: RawCart | null }>(`query($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`, { id: cartId });
  return d.cart ? shape(d.cart) : null;
}
