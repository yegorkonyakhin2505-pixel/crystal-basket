import type { ImgHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";
import variants from "@/lib/image-variants.json";

type Variant = { w: number; h: number; webp: number[] };
const MANIFEST = variants as Record<string, Variant>;
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * <img> with base-path handling and, when scripts/responsive-images.py has produced WebP widths for the
 * file, a <picture> with a WebP srcset plus intrinsic width/height. Static export can't use next/image,
 * so the variants are generated ahead of time and listed in lib/image-variants.json.
 * `sizes` describes the rendered width; the default fits grid tiles.
 */
export function Img({ className, alt, src, sizes = "(min-width: 1024px) 25vw, 50vw", ...rest }: ImgHTMLAttributes<HTMLImageElement> & { alt: string; src: string }) {
  const key = src.startsWith(BASE) ? src.slice(BASE.length) : src;
  const v = MANIFEST[key];
  const img = (
    <img alt={alt} src={src} loading="lazy" decoding="async" width={v?.w} height={v?.h} className={cn("block h-full w-full object-cover", className)} {...rest} />
  );
  if (!v) return img;
  const stem = src.replace(/\.(jpe?g|png)$/i, "");
  return (
    <picture className="contents">
      <source type="image/webp" sizes={sizes} srcSet={v.webp.map((w) => `${stem}-${w}.webp ${w}w`).join(", ")} />
      {img}
    </picture>
  );
}
