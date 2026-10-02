import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/* Design-system primitives (mirror of apps/web/src/components/ui): same class lists, plain <a> instead of next/link. */

export type ButtonVariant = "primary" | "outline" | "ghost" | "rose" | "white";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-cb-ink text-white hover:bg-black",
  outline: "border border-cb-ink bg-transparent text-cb-ink hover:bg-cb-ink hover:text-white",
  ghost: "bg-transparent text-cb-ink hover:bg-cb-band",
  rose: "bg-cb-rose text-white hover:bg-cb-rose-hover",
  white: "bg-white text-cb-ink border border-white hover:bg-cb-band",
};
const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[11px]",
  md: "h-11 px-6 text-[12px]",
  lg: "h-13 px-8 text-[13px]",
};

/** Shared by Button and ButtonLink. */
export const buttonClasses = (variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) =>
  cn(
    "inline-flex select-none items-center justify-center gap-2 font-medium uppercase tracking-[0.14em] transition-colors duration-200 cursor-pointer",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cb-rose disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, className, children, disabled, type, ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type ?? "button"} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonClasses(variant, size, className)} {...rest}>
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
});

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}
/** Anchor styled as a Button. */
export function ButtonLink({ variant = "primary", size = "md", className, ...rest }: ButtonLinkProps) {
  return <a className={buttonClasses(variant, size, className)} {...rest} />;
}

export type BadgeTone = "neutral" | "rose" | "ink";
const TONES: Record<BadgeTone, string> = {
  neutral: "bg-white text-cb-muted border-cb-line",
  rose: "bg-cb-rose-soft text-cb-rose border-transparent",
  ink: "bg-cb-ink text-white border-transparent",
};
export function Badge({ tone = "neutral", className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em]", TONES[tone], className)} {...rest} />;
}

export { cn };
