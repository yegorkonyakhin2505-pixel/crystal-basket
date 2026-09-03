/** AED helpers. Prices in content are whole AED; the API layer (phase 2) will store fils. */
export const aedToFils = (aed: number): number => Math.round(aed * 100);
export const filsToAed = (fils: number): number => fils / 100;
export function formatAED(aed: number): string {
  return `${aed.toLocaleString("en-AE", { maximumFractionDigits: 0 })} AED`;
}
