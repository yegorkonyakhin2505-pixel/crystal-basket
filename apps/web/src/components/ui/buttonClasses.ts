import { cn } from "./cn";

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

/** Shared by Button (client) and ButtonLink (server). Plain module, no "use client". */
export const buttonClasses = (variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) =>
  cn(
    "inline-flex select-none items-center justify-center gap-2 font-medium uppercase tracking-[0.14em] transition-colors duration-200 cursor-pointer",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cb-rose disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
