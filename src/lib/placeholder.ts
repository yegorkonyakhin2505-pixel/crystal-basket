/**
 * Deterministic "bracelet" artwork used while real photography is pending.
 * Given stone palettes + a seed, returns bead positions/colours for an SVG ring.
 */
export interface Bead { cx: number; cy: number; r: number; from: string; to: string; gold?: boolean }

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function beadRing(opts: {
  seed: string;
  palettes: [string, string][];
  goldAccent?: boolean;
  beadMm?: number;
  width?: number;
  height?: number;
}): Bead[] {
  const { seed, palettes, goldAccent = false, beadMm = 8, width = 400, height = 500 } = opts;
  const h = hash(seed);
  const count = beadMm >= 10 ? 18 : beadMm <= 6 ? 26 : 22;
  const ringR = Math.min(width, height) * 0.33;
  const beadR = (Math.PI * 2 * ringR) / count / 2 * 0.98;
  const cx = width / 2, cy = height / 2 + 6;
  const tilt = ((h % 20) - 10) / 100; // slight elliptical perspective
  const beads: Bead[] = [];
  const goldIndex = goldAccent ? h % count : -1;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2;
    const p = palettes[i % palettes.length] ?? ['#ccc', '#999'];
    beads.push({
      cx: cx + Math.cos(a) * ringR,
      cy: cy + Math.sin(a) * ringR * (0.9 + tilt),
      r: beadR,
      from: p[0], to: p[1],
      gold: i === goldIndex,
    });
  }
  return beads;
}
