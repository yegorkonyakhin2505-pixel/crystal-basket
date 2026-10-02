/** AED helpers (mirror of packages/catalog/src/money.ts, kept dependency-free for the browser bundle). */
export function formatAED(aed: number): string {
  return `${aed.toLocaleString("en-AE", { maximumFractionDigits: 0 })} AED`;
}
