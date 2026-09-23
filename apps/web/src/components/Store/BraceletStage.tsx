"use client";
import { useEffect, useRef } from "react";

/**
 * Canvas engine for the bracelet builder. Draws every frame:
 *  - a loose string that sags under the beads and bounces when one lands;
 *  - beads that fall from the tray, slide along the string and sit touching in a centred row;
 *  - the fold: the string curls from both ends into a bracelet seen from a raised angle, and the
 *    beads ride the string the whole way, growing as the view closes in;
 *  - a glint that sweeps across the finished bracelet, and a soft ground shadow.
 * Props are the source of truth (ordered beads, slots, folded); the engine animates towards them.
 */
export type StageBead = { id: number; stone: string };
type Anim = {
  id: number; stone: string;
  u: number; uv: number;               // arc-length position along the string (0..1) and its velocity
  drop: { t0: number; dur: number; from: { x: number; y: number } } | null;
  pop: { t0: number } | null;
  born: number;
};

const W = 640, H = 360;
const OPEN: [number, number][] = [[28, 92], [320, 306], [612, 92]];       // quadratic bezier: ends, control
const RING = { cx: 320, cy: 160, rw: 180, tilt: 0.6, persp: 4.2 };   // world radius, sin(camera tilt), perspective distance in radii
const N = 600;

function table(fn: (t: number) => [number, number]) {
  const pts: [number, number][] = [], len: number[] = [0];
  for (let i = 0; i <= N; i++) pts.push(fn(i / N));
  for (let i = 1; i <= N; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = len[N];
  return {
    total,
    at(u: number): [number, number] {
      const s = Math.max(0, Math.min(total, u * total));
      let lo = 0, hi = N; while (lo < hi) { const m = (lo + hi) >> 1; if (len[m] < s) lo = m + 1; else hi = m; }
      const i = Math.max(1, lo), f = (s - len[i - 1]) / Math.max(1e-6, len[i] - len[i - 1]);
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
    },
  };
}
const openCurve = (sag: number) => table((t) => { const [a, c, b] = OPEN; const cy = c[1] + sag; const q = 1 - t; return [q * q * a[0] + 2 * q * t * c[0] + t * t * b[0], q * q * a[1] + 2 * q * t * cy + t * t * b[1]]; });
/** Screen position and perspective scale of a point on the tilted bracelet circle. u=0.5 is the front (nearest). */
function ringAt(u: number): { x: number; y: number; s: number } {
  const a = u * Math.PI * 2 - Math.PI / 2;
  const x = Math.cos(a) * RING.rw, z = Math.sin(a) * RING.rw;
  const s = 1 / (1 - z / (RING.persp * RING.rw));
  return { x: RING.cx + x * s, y: RING.cy + z * RING.tilt * s, s };
}
const ringWorldSpacing = (slots: number) => (2 * Math.PI * RING.rw) / slots;
const RING_BOTTOM = ringAt(0.5).y;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeFall = (t: number) => t * t * (1.6 - 0.6 * t);

/** Per-point curl progress: the ends of the string start curling first, the middle follows. */
const curl = (u: number, fold: number) => smooth(clamp(fold * 1.45 - 0.45 * (1 - Math.abs(2 * u - 1)), 0, 1));

export function BraceletStage({ beads, slots, folded, sprites, onRemove, onBusy, onHover, className }: {
  beads: StageBead[]; slots: number; folded: boolean; sprites: Record<string, string>;
  onRemove: (id: number) => void; onBusy: (busy: boolean) => void; onHover: (stone: string | null) => void; className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ beads, slots, folded }); propsRef.current = { beads, slots, folded };
  const cbRef = useRef({ onRemove, onBusy, onHover }); cbRef.current = { onRemove, onBusy, onHover };
  const anims = useRef<Anim[]>([]);
  const imgs = useRef<Record<string, HTMLImageElement>>({});
  const fold = useRef({ v: 0, from: 0, to: 0, t0: 0, dur: 0 });
  const sag = useRef({ v: 0, vel: 0 });
  const glint = useRef<number | null>(null);
  const busy = useRef(false);
  const raf = useRef(0);
  const hoverId = useRef<number | null>(null);
  const reduce = useRef(false);

  // sprites
  useEffect(() => {
    for (const [k, src] of Object.entries(sprites)) { if (!src || imgs.current[k]) continue; const im = new Image(); im.decoding = "async"; im.src = src; imgs.current[k] = im; }
  }, [sprites]);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current!; const ctx = canvas.getContext("2d")!;
    let dpr = 1, cssW = 0, cssH = 0;
    const fit = () => { const r = canvas.getBoundingClientRect(); dpr = Math.min(2.5, window.devicePixelRatio || 1); cssW = r.width; cssH = r.height; canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr); };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(canvas);

    let last = performance.now(); let queueAt = 0;
    const trayPoint = (stone: string): { x: number; y: number } => {
      const el = document.querySelector<HTMLElement>(`[data-tray="${stone}"] img, [data-tray="${stone}"]`); const r = canvas.getBoundingClientRect();
      if (!el) return { x: W / 2, y: -40 };
      const c = el.getBoundingClientRect();
      return { x: ((c.left + c.width / 2 - r.left) / r.width) * W, y: ((c.top + c.height / 2 - r.top) / r.height) * H };
    };

    const sync = (now: number) => {
      const { beads, folded } = propsRef.current;
      const seen = new Set<number>();
      for (const b of beads) {
        seen.add(b.id);
        if (!anims.current.some((a) => a.id === b.id)) {
          const t0 = Math.max(now, queueAt); queueAt = t0 + (reduce.current ? 0 : 120);
          anims.current.push({ id: b.id, stone: b.stone, u: 0.5, uv: 0, drop: { t0, dur: reduce.current ? 0 : 560, from: trayPoint(b.stone) }, pop: null, born: now });
        }
      }
      for (const a of anims.current) if (!seen.has(a.id) && !a.pop) a.pop = { t0: now };
      const target = folded ? 1 : 0;
      if (fold.current.to !== target) { fold.current = { v: fold.current.v, from: fold.current.v, to: target, t0: now, dur: reduce.current ? 0 : 1900 }; if (target === 0) glint.current = null; }
    };

    const layout = (now: number) => {
      const { slots, beads } = propsRef.current;
      const order = beads.map((b) => b.id);
      const live = anims.current.filter((a) => !a.pop);
      const n = live.length;
      const curveOpen = openCurve(sag.current.v);
      const dOpen = Math.min(30, curveOpen.total / Math.max(slots, 1) * 0.98);
      const dRing = ringWorldSpacing(Math.max(slots, 1));
      const f = fold.current.v;
      const fe = easeInOut(f);
      // targets
      for (const a of live) {
        const i = order.indexOf(a.id); if (i < 0) continue;
        const uOpen = 0.5 + (i - (n - 1) / 2) * (dOpen / curveOpen.total);
        const uRing = (i + 0.5) / slots;
        const target = uOpen + (uRing - uOpen) * fe;
        if (a.drop && now < a.drop.t0 + a.drop.dur) { a.u = target; a.uv = 0; continue; }   // still falling: follow the slot
        const k = 170, c = 2 * Math.sqrt(k) * 0.9;                                         // damped spring on u
        const dt = 1 / 60; const acc = (target - a.u) * k - a.uv * c;
        a.uv += acc * dt; a.u += a.uv * dt;
        if (Math.abs(target - a.u) < 1e-5 && Math.abs(a.uv) < 1e-4) { a.u = target; a.uv = 0; }
      }
      return { curveOpen, dOpen, dRing, fe };
    };

    const point = (u: number, f: number, curveOpen: ReturnType<typeof table>): [number, number, number] => {
      const p = curl(u, f); const a = curveOpen.at(u), b = ringAt(u);
      return [a[0] + (b.x - a[0]) * p, a[1] + (b.y - a[1]) * p, 1 + (b.s - 1) * p];
    };

    const draw = (now: number) => {
      const { slots } = propsRef.current;
      const { curveOpen, dOpen, dRing, fe } = layout(now);
      const f = fold.current.v;
      const sx = cssW / W, sy = cssH / H;
      ctx.setTransform(dpr * sx, 0, 0, dpr * sy, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // ground shadow under the bracelet
      if (fe > 0.05) {
        const gy = RING_BOTTOM + 30, gr = RING.rw * 1.05;
        const g = ctx.createRadialGradient(RING.cx, gy, 0, RING.cx, gy, gr);
        g.addColorStop(0, `rgba(40,30,25,${0.17 * fe})`); g.addColorStop(1, "rgba(40,30,25,0)");
        ctx.save(); ctx.translate(RING.cx, gy); ctx.scale(1, 0.16); ctx.translate(-RING.cx, -gy);
        ctx.fillStyle = g; ctx.fillRect(RING.cx - gr, gy - gr, gr * 2, gr * 2); ctx.restore();
      }
      // the string
      ctx.beginPath();
      for (let i = 0; i <= 160; i++) { const [x, y] = point(i / 160, f, curveOpen); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(120,110,105,0.55)"; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 0.7; ctx.save(); ctx.translate(0, -0.9); ctx.stroke(); ctx.restore();
      if (f < 0.98) { ctx.fillStyle = `rgba(120,110,105,${0.5 * (1 - f)})`; for (const e of [OPEN[0], OPEN[2]]) { ctx.beginPath(); ctx.arc(e[0], e[1], 3.4, 0, Math.PI * 2); ctx.fill(); } }

      // beads
      type D = { a: Anim; x: number; y: number; r: number; sqx: number; sqy: number; alpha: number; depth: number };
      const items: D[] = [];
      let anyBusy = false;
      for (const a of anims.current) {
        const base = point(a.u, f, curveOpen);
        const depth = clamp((base[2] - 0.8) / 0.55, 0, 1);
        const rRing = (dRing / 2) * 1.05 * base[2];                          // touching in world space, scaled by perspective
        let r = (dOpen / 2) + (rRing - dOpen / 2) * fe;
        let x = base[0], y = base[1], sqx = 1, sqy = 1, alpha = 1;
        if (a.drop) {
          const k = a.drop.dur ? clamp((now - a.drop.t0) / a.drop.dur, 0, 1) : 1;
          if (now < a.drop.t0) { continue; }                                   // waiting in the queue
          anyBusy = anyBusy || k < 1;
          const e = easeFall(k);
          const cx = a.drop.from.x + (x - a.drop.from.x) * 0.3, cy = Math.min(a.drop.from.y, y) - 70;
          const q = 1 - e;
          x = q * q * a.drop.from.x + 2 * q * e * cx + e * e * x;
          y = q * q * a.drop.from.y + 2 * q * e * cy + e * e * y;
          r *= 0.82 + 0.18 * e;
          if (k >= 1) { a.drop = null; if (!reduce.current) sag.current.vel += 0.9; }
          else if (k > 0.9) { const s = Math.sin(((k - 0.9) / 0.1) * Math.PI) * 0.1; sqx = 1 + s; sqy = 1 - s; }
        }
        if (a.pop) {
          const k = clamp((now - a.pop.t0) / (reduce.current ? 1 : 260), 0, 1);
          alpha = 1 - k; r *= 1 - 0.6 * k; y -= 26 * k;
          if (k >= 1) { a.pop = { t0: -1 }; }
        }
        items.push({ a, x, y, r, sqx, sqy, alpha, depth });
      }
      anims.current = anims.current.filter((a) => !(a.pop && a.pop.t0 === -1));
      items.sort((p, q) => p.y - q.y);
      for (const it of items) {
        const im = imgs.current[it.a.stone];
        const { x, y, r } = it;
        ctx.save(); ctx.globalAlpha = it.alpha;
        // contact shadow
        const sh = ctx.createRadialGradient(x, y + r * 0.92, 0, x, y + r * 0.92, r * 1.05);
        sh.addColorStop(0, `rgba(30,20,15,${0.16 + 0.1 * it.depth})`); sh.addColorStop(1, "rgba(30,20,15,0)");
        ctx.save(); ctx.translate(x, y + r * 0.92); ctx.scale(1, 0.28); ctx.translate(-x, -(y + r * 0.92)); ctx.fillStyle = sh; ctx.fillRect(x - r * 1.1, y + r * 0.92 - r * 1.1, r * 2.2, r * 2.2); ctx.restore();
        const lift = hoverId.current === it.a.id && !it.a.pop ? 1.1 : 1;
        ctx.translate(x, y - (lift - 1) * r * 2); ctx.scale(it.sqx * lift, it.sqy * lift);
        if (im && im.complete && im.naturalWidth) ctx.drawImage(im, -r, -r, r * 2, r * 2);
        else { const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, "#ddd"); g.addColorStop(1, "#777"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); }
        // glint sweep on the finished bracelet
        if (glint.current != null) {
          const gk = (now - glint.current) / 1100; const band = -140 + gk * (W + 280);
          const d = Math.abs(x - band); const a = clamp(1 - d / 90, 0, 1) * 0.55 * clamp(1.4 - gk, 0, 1);
          if (a > 0) { const g = ctx.createRadialGradient(-r * 0.25, -r * 0.3, 0, 0, 0, r); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.7, `rgba(255,255,255,${a * 0.15})`); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); }
        }
        ctx.restore();
      }

      // string physics: a small bounce when a bead lands, more sag as it fills
      const rest = Math.min(28, anims.current.filter((a) => !a.pop && !a.drop).length * 1.2) * (1 - fe);
      const kS = 60, cS = 2 * Math.sqrt(kS) * 0.55, dt = 1 / 60;
      sag.current.vel += ((rest - sag.current.v) * kS - sag.current.vel * cS) * dt; sag.current.v += sag.current.vel * dt * 10;

      // fold tween
      const fo = fold.current;
      if (fo.v !== fo.to) {
        const k = fo.dur ? clamp((now - fo.t0) / fo.dur, 0, 1) : 1;
        fo.v = fo.from + (fo.to - fo.from) * k;
        if (k >= 1) { fo.v = fo.to; if (fo.to === 1 && !reduce.current) glint.current = now + 80; }
        anyBusy = true;
      }
      if (glint.current != null && now - glint.current > 1500) glint.current = null;
      const active = anyBusy || glint.current != null || anims.current.some((a) => a.pop || a.drop || Math.abs(a.uv) > 1e-3) || Math.abs(sag.current.vel) > 0.02 || Math.abs(rest - sag.current.v) > 0.05;
      const nowBusy = anyBusy || anims.current.some((a) => a.drop);
      if (nowBusy !== busy.current) { busy.current = nowBusy; cbRef.current.onBusy(nowBusy); }
      return active;
    };

    let idle = false;
    const loop = (now: number) => {
      last = now; sync(now);
      const active = draw(now);
      if (active) { idle = false; raf.current = requestAnimationFrame(loop); } else { idle = true; }
    };
    const kick = () => { if (idle) { idle = false; raf.current = requestAnimationFrame(loop); } };
    raf.current = requestAnimationFrame(loop);
    (canvas as HTMLCanvasElement & { __kick?: () => void }).__kick = kick;

    const toLocal = (e: PointerEvent | MouseEvent) => { const r = canvas.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
    const hit = (p: { x: number; y: number }) => {
      const { slots } = propsRef.current; const f = fold.current.v; const curveOpen = openCurve(sag.current.v);
      const dOpen = Math.min(30, curveOpen.total / Math.max(slots, 1) * 0.98), dRing = ringWorldSpacing(Math.max(slots, 1));
      let best: Anim | null = null, bd = 1e9;
      for (const a of anims.current) { if (a.pop || a.drop) continue; const [x, y, sc] = point(a.u, f, curveOpen); const r = (dOpen / 2) + (dRing / 2 * 1.05 * sc - dOpen / 2) * easeInOut(f); const d = Math.hypot(p.x - x, p.y - y); if (d < r * 1.15 && d < bd) { bd = d; best = a; } }
      return best;
    };
    const onMove = (e: PointerEvent) => { const b = hit(toLocal(e)); const id = b ? b.id : null; if (id !== hoverId.current) { hoverId.current = id; canvas.style.cursor = id != null ? "pointer" : "default"; cbRef.current.onHover(b ? b.stone : null); kick(); } };
    const onLeave = () => { if (hoverId.current != null) { hoverId.current = null; canvas.style.cursor = "default"; cbRef.current.onHover(null); kick(); } };
    const onClick = (e: MouseEvent) => { const b = hit(toLocal(e)); if (b) cbRef.current.onRemove(b.id); };
    canvas.addEventListener("pointermove", onMove); canvas.addEventListener("pointerleave", onLeave); canvas.addEventListener("click", onClick);
    return () => { cancelAnimationFrame(raf.current); ro.disconnect(); canvas.removeEventListener("pointermove", onMove); canvas.removeEventListener("pointerleave", onLeave); canvas.removeEventListener("click", onClick); };
  }, []);

  // any prop change wakes the loop
  useEffect(() => { (canvasRef.current as (HTMLCanvasElement & { __kick?: () => void }) | null)?.__kick?.(); }, [beads, slots, folded]);

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", aspectRatio: `${W} / ${H}`, display: "block", touchAction: "manipulation" }} aria-label={`${beads.length} of ${slots} beads on the string`} role="img" />;
}
