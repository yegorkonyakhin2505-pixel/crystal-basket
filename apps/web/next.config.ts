import type { NextConfig } from "next";

/**
 * Phase 1 = fully static export (GitHub Pages). NEXT_PUBLIC_BASE_PATH is set
 * to "/crystal-basket" by the deploy workflow and left empty for local dev.
 *
 * Phase 2 (API + admin): drop `output: "export"`, add the same-origin
 * `rewrites()` proxy so the browser only ever talks to this host and Next
 * forwards /api/* to the backend server-side. Keep NEXT_PUBLIC_API_URL empty
 * so no host is baked into client bundles.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  transpilePackages: ["@crystal-basket/catalog"],
  eslint: { ignoreDuringBuilds: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
