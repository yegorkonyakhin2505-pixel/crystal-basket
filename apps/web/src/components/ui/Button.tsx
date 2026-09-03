"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonClasses";

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
