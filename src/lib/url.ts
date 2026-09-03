/** Base-path-aware URL helper so the site works at "/" and at "/crystal-basket/" (GitHub Pages). */
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const u = (path: string): string => `${base}${path}`;
