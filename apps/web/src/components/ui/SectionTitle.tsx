import { cn } from "./cn";
export function SectionTitle({ eyebrow, title, text, align = "center", className }: { eyebrow?: string; title: string; text?: string; align?: "center" | "left"; className?: string }) {
  return (
    <div className={cn("mb-8 md:mb-10", align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-2xl", className)}>
      {eyebrow && <p className="label-caps mb-3">{eyebrow}</p>}
      <h2 className="text-3xl md:text-[2.5rem]">{title}</h2>
      {text && <p className="mt-3 text-cb-muted text-[15px]">{text}</p>}
    </div>
  );
}
