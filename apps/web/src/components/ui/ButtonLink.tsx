import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonClasses";

interface Props extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}
/** Anchor styled as a Button. Server-component safe. */
export function ButtonLink({ variant = "primary", size = "md", className, ...rest }: Props) {
  return <Link className={buttonClasses(variant, size, className)} {...rest} />;
}
