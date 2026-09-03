import { cn } from "./cn";
import type { HTMLAttributes } from "react";

export type BadgeTone = "neutral" | "rose" | "ink";
const TONES: Record<BadgeTone, string> = {
  neutral: "bg-white text-cb-muted border-cb-line",
  rose: "bg-cb-rose-soft text-cb-rose border-transparent",
  ink: "bg-cb-ink text-white border-transparent",
};
export function Badge({ tone = "neutral", className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em]", TONES[tone], className)} {...rest} />;
}
