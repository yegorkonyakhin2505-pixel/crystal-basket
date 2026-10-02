/**
 * Adds .is-visible to .reveal elements as they enter the viewport. Above-the-fold items are shown synchronously.
 * Re-attaches whenever new .reveal nodes are added (theme editor, islands). Mirror of apps/web ScrollReveal.tsx.
 */
export function initReveal() {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }),
    { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
  );
  const attach = () => {
    const vh = window.innerHeight;
    document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add("is-visible");
      else io.observe(el);
    });
  };
  attach();
  let raf = 0;
  new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(attach); }).observe(document.body, { childList: true, subtree: true });
}
