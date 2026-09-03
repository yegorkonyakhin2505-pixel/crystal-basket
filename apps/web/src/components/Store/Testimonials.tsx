import { site } from "@/lib/site";
/** TODO[NEEDED:N03] replace with real customer reviews. */
const reviews = [
  { q: "I bought The Still Mind for my exams and wore it every day. Whether it is the stone or the reminder, I felt calmer.", n: "Mariam A.", c: "Dubai" },
  { q: "Gifted The Tender Heart to my sister. The card and the pouch made it feel like a real present.", n: "Sara K.", c: "Abu Dhabi" },
  { q: "The sizing was right the first time and the beads are heavier than they look. Real stone.", n: "Layla H.", c: "Sharjah" },
];
export function Testimonials() {
  return (
    <section className="container-x py-16 md:py-24">
      <div className="text-center mb-10 reveal">
        <p className="text-cb-gold tracking-[0.3em] text-sm">★★★★★</p>
        <h2 className="text-3xl md:text-[2.5rem] mt-3">{site.reviews.average} from {site.reviews.count} wrists</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-px bg-cb-line border border-cb-line">
        {reviews.map((r, i) => (
          <figure key={r.n} className="bg-white p-8 reveal" style={{ transitionDelay: `${i * 70}ms` }}>
            <blockquote className="font-display text-[1.35rem] leading-snug italic">“{r.q}”</blockquote>
            <figcaption className="mt-5 text-[12px] text-cb-muted uppercase tracking-[0.12em]">{r.n} · {r.c}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
