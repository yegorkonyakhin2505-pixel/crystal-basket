export function formatAED(amount: number): string {
  return `AED ${amount.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`;
}

export const WRIST_SIZES: Record<'S' | 'M' | 'L', { cm: number; fits: string }> = {
  S: { cm: 16, fits: '14–15.5 cm wrist' },
  M: { cm: 18, fits: '15.5–17 cm wrist' },
  L: { cm: 20, fits: '17–18.5 cm wrist' },
};
