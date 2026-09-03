export type ThemeId = 'ivory' | 'midnight' | 'eucalyptus' | 'rose' | 'obsidian' | 'moonstone';
export type Mode = 'light' | 'dark';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  mood: string;
  fonts: string;
  /** Preview swatches [bg, accent, accent2] for the light variant. */
  swatch: [string, string, string];
  darkSwatch: [string, string, string];
}

export const THEMES: ThemeMeta[] = [
  { id: 'ivory', name: 'Ivory & Champagne', mood: 'Daylight atelier. Warm, quiet, gold-edged.', fonts: 'Fraunces + Inter', swatch: ['#fbf9f5', '#8a6a2b', '#c9a961'], darkSwatch: ['#141210', '#c9a961', '#8a6a2b'] },
  { id: 'midnight', name: 'Midnight Amethyst', mood: 'Night ritual. Deep violet and soft gold.', fonts: 'Cormorant + Manrope', swatch: ['#f6f4fb', '#6a3fb5', '#a88a2e'], darkSwatch: ['#0e0b18', '#b48ce0', '#e3c77a'] },
  { id: 'eucalyptus', name: 'Eucalyptus & Sand', mood: 'Earthy and grounded. Sage, sand, terracotta.', fonts: 'Fraunces + Inter', swatch: ['#f4f1ea', '#a8532f', '#6b7d5d'], darkSwatch: ['#161a14', '#d08a5e', '#8fa37e'] },
  { id: 'rose', name: 'Rose Quartz', mood: 'Soft and feminine. Blush, mauve, cream.', fonts: 'Cormorant + Manrope', swatch: ['#fcf6f4', '#9c4f66', '#c98a88'], darkSwatch: ['#1c1416', '#d98ba1', '#c98a88'] },
  { id: 'obsidian', name: 'Obsidian Mono', mood: 'Gallery neutral. Black, white, one violet.', fonts: 'Instrument Serif + DM Sans', swatch: ['#ffffff', '#0a0a0a', '#5b3bd4'], darkSwatch: ['#0a0a0a', '#f5f5f5', '#8b6ff0'] },
  { id: 'moonstone', name: 'Moonstone', mood: 'Pale iridescent pastels, rounded and airy.', fonts: 'Instrument Serif + DM Sans', swatch: ['#f7f8fc', '#4a5bc4', '#3e8c88'], darkSwatch: ['#12141f', '#8e9bea', '#5fbdb8'] },
];

export const DEFAULT_THEME: ThemeId = 'ivory';
export const THEME_IDS = THEMES.map((t) => t.id);
