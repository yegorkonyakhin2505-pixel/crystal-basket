export const WRIST_SIZES = {
  S: { cm: 16, fits: "14–15.5 cm wrist" },
  M: { cm: 18, fits: "15.5–17 cm wrist" },
  L: { cm: 20, fits: "17–18.5 cm wrist" },
} as const;
export type WristSizeKey = keyof typeof WRIST_SIZES;
export const beadCount = (mm: number, cm: number) => Math.round((cm * 10) / mm);
