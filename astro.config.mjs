// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://yegorkonyakhin2505-pixel.github.io',
  base: '/crystal-basket',
  output: 'static',
  trailingSlash: 'never',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
