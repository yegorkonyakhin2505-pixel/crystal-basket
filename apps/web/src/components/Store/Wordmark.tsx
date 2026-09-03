import { cn } from "@/components/ui/cn";
/** Text wordmark in the display serif, spaced like a jewellery house. Size via text-* classes. */
export function Wordmark({ className }: { className?: string }) {
  return <span className={cn("font-display font-medium uppercase tracking-[0.28em] text-cb-ink leading-none select-none whitespace-nowrap", className)}>Crystal Basket</span>;
}
