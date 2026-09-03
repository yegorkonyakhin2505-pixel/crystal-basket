import type { ImgHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

/**
 * Plain <img> with base-path handling. Static export can't use next/image
 * optimisation, and our images are pre-sized JPEGs.
 */
export function Img({ className, alt, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { alt: string }) {
  return <img alt={alt} loading="lazy" decoding="async" className={cn("block h-full w-full object-cover", className)} {...rest} />;
}
