"use client";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "./cn";
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full border border-cb-line bg-white px-4 text-[14px] text-cb-ink placeholder:text-cb-faint",
        "focus:border-cb-ink focus:outline-none transition-colors",
        className,
      )}
      {...rest}
    />
  );
});
