"use client";
import { Heart } from "lucide-react";
import { cn } from "@/components/ui";
import { useWishlist } from "@/hooks/useWishlist";

export function WishlistButton({ id, className, label = false }: { id: string; className?: string; label?: boolean }) {
  const { has, toggle } = useWishlist();
  const on = has(id);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}
      aria-pressed={on}
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      className={cn("inline-flex items-center gap-2 p-2 transition-colors", on ? "text-cb-rose" : "text-cb-ink hover:text-cb-rose", className)}
    >
      <Heart className="h-5 w-5 transition-transform duration-300 active:scale-90" strokeWidth={1.4} fill={on ? "currentColor" : "none"} />
      {label && <span className="text-[12px] uppercase tracking-[0.14em]">{on ? "Saved" : "Save"}</span>}
    </button>
  );
}
