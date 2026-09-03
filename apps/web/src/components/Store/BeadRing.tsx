/** Fallback artwork when a product has no photo yet: a ring of beads in the stone colours. */
export function BeadRing({ palettes, gold = false, count = 22 }: { palettes: [string, string][]; gold?: boolean; count?: number }) {
  const size = 400, cx = 200, cy = 200, R = 130;
  const r = (Math.PI * 2 * R) / count / 2 * 0.96;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="block h-full w-full" role="img" aria-label="Bracelet illustration">
      <defs>
        {palettes.map((p, i) => (
          <radialGradient key={i} id={`br-${i}-${p[0].slice(1)}`} cx="35%" cy="32%" r="70%"><stop offset="0%" stopColor={p[0]} /><stop offset="100%" stopColor={p[1]} /></radialGradient>
        ))}
        <radialGradient id="br-gold" cx="35%" cy="32%" r="70%"><stop offset="0%" stopColor="#f6e3a1" /><stop offset="100%" stopColor="#8a6a2b" /></radialGradient>
      </defs>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2;
        const p = palettes[i % palettes.length];
        const fill = gold && i === 3 ? "url(#br-gold)" : `url(#br-${i % palettes.length}-${p[0].slice(1)})`;
        return <circle key={i} cx={cx + Math.cos(a) * R} cy={cy + Math.sin(a) * R * 0.92} r={r} fill={fill} />;
      })}
    </svg>
  );
}
