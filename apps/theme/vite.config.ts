import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/**
 * Bundles the React islands into one classic script Shopify can serve from the theme's assets folder.
 * Output: theme/assets/cb-islands.js (IIFE, minified). No hashing: Shopify versions theme assets itself.
 */
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "theme/assets",
    emptyOutDir: false,
    minify: "esbuild",
    sourcemap: false,
    lib: { entry: "src/islands/main.tsx", name: "CBIslands", formats: ["iife"], fileName: () => "cb-islands.js" },
    rollupOptions: { output: { inlineDynamicImports: true, assetFileNames: "cb-islands.[ext]" } },
  },
});
