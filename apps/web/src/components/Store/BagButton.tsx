"use client";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export function BagButton() {
  const { enabled, count, show } = useCart();
  if (!enabled) return null;
  return (
    <button type="button" onClick={() => show(true)} className="relative p-2 hover:text-cb-rose" aria-label={`Open bag, ${count} items`}>
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {count > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-cb-ink text-white text-[9px] px-1.5 py-0.5 leading-none">{count}</span>}
    </button>
  );
}
