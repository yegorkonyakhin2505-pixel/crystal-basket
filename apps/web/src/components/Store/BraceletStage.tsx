"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Canvas engine for the bracelet builder. Draws every frame:
 *  - a loose string that sags under the beads and bounces when one lands;
 *  - beads sitting touching in a centred row, sliding on a spring when the row changes;
 *  - the fold: the string curls from both ends into a bracelet seen from a raised angle in true
 *    perspective, the beads riding the string the whole way and growing as the view closes in;
 *  - a glint that sweeps across the finished bracelet, and a soft ground shadow.
 * Beads that are still flying in from the tray (`hidden`) take part in the layout but are not drawn;
 * the moment they stop being hidden they land with a squash and the string dips.
 * `posOf(id)` reports a bead's current screen position so the flight layer can aim at it.
 */
export type StageBead = { id: number; stone: string };
export type StageHandle = { posOf: (id: number) => { x: number; y: number; r: number } | null };
type Anim = { id: number; stone: string; u: number; uv: number; land: number | null; pop: number | null };

const W = 640, H = 360;
const OPEN: [number, number][] = [[28, 92], [320, 306], [612, 92]];
const RING = { cx: 320, cy: 160, rw: 180, tilt: 0.6, persp: 4.2 };
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
const curl = (u: number, fold: number) => smooth(clamp(fold * 1.45 - 0.45 * (1 - Math.abs(2 * u - 1)), 0, 1));

export const BraceletStage = forwardRef<StageHandle, {
  beads: StageBead[]; slots: number; folded: boolean; hidden: number[]; sprites: Record<string, string>;
  onRemove: (id: number) => void; onBusy: (busy: boolean) => void; onHover: (stone: string | null) => void; className?: string;
}>(function BraceletStage({ beads, slots, folded, hidden, sprites, onRemove, onBusy, onHover, className }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ beads, slots, folded, hidden }); propsRef.current = { beads, slots, folded, hidden };
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
  const geom = useRef<Map<number, { x: number; y: number; r: number }>>(new Map());
  const wasHidden = useRef<Set<number>>(new Set());
  const kickRef = useRef<() => void>(() => {});

  useImperativeHandle(ref, () => ({
    posOf(id) {
      const g = geom.current.get(id); const c = canvasRef.current; if (!g || !c) return null;
      const r = c.getBoundingClientRect(); const k = r.width / W;
      return { x: r.left + g.x * k, y: r.top + g.y * (r.height / H), r: g.r * k };
    },
  }), []);

  useEffect(() => {
    for (const [k, src] of Object.entries(sprites)) { if (!src || imgs.current[k]) continue; const im = new Image(); im.decoding = "async"; im.src = src; im.onload = () => kickRef.current(); imgs.current[k] = im; }
  }, [sprites]);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current!; const ctx = canvas.getContext("2d")!;
    let dpr = 1, cssW = 0, cssH = 0;
    const fit = () => { const r = canvas.getBoundingClientRect(); dpr = Math.min(2.5, window.devicePixelRatio || 1); cssW = r.width; cssH = r.height; canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr); };
    fit();
    const ro = new ResizeObserver(() => { fit(); kick(); }); ro.observe(canvas);

    const sync = (now: number) => {
      const { beads, folded, hidden } = propsRef.current;
      const seen = new Set<number>();
      const hid = new Set(hidden);
      for (const b of beads) {
        seen.add(b.id);
        if (!anims.current.some((a) => a.id === b.id)) anims.current.push({ id: b.id, stone: b.stone, u: NaN, uv: 0, land: null, pop: null });
      }
      for (const a of anims.current) {
        if (!seen.has(a.id) && a.pop == null) a.pop = now;
        if (wasHidden.current.has(a.id) && !hid.has(a.id)) { a.land = now; if (!reduce.current) sag.current.vel += 1.1; }
      }
      wasHidden.current = hid;
      const target = folded ? 1 : 0;
      if (fold.current.to !== target) { fold.current = { v: fold.current.v, from: fold.current.v, to: target, t0: now, dur: reduce.current ? 0 : 1900 }; if (target === 0) glint.current = null; }
    };

    const layout = () => {
      const { slots, beads } = propsRef.current;
      const order = beads.map((b) => b.id);
      const live = anims.current.filter((a) => a.pop == null);
      const n = live.length;
      const curveOpen = openCurve(sag.current.v);
      const dOpen = Math.min(30, (curveOpen.total / Math.max(slots, 1)) * 0.98);
      const dRing = ringWorldSpacing(Math.max(slots, 1));
      const f = fold.current.v, fe = easeInOut(f);
      for (const a of live) {
        const i = order.indexOf(a.id); if (i < 0) continue;
        const uOpen = 0.5 + (i - (n - 1) / 2) * (dOpen / curveOpen.total);
        const uRing = (i + 0.5) / slots;
        const target = uOpen + (uRing - uOpen) * fe;
        if (Number.isNaN(a.u)) { a.u = target; a.uv = 0; continue; }
        const k = 170, c = 2 * Math.sqrt(k) * 0.9, dt = 1 / 60;
        a.uv += ((target - a.u) * k - a.uv * c) * dt; a.u += a.uv * dt;
        if (Math.abs(target - a.u) < 1e-5 && Math.abs(a.uv) < 1e-4) { a.u = target; a.uv = 0; }
      }
      return { curveOpen, dOpen, dRing, fe, f };
    };
    const point = (u: number, f: number, curveOpen: ReturnType<typeof table>): [number, number, number] => {
      const p = curl(u, f); const a = curveOpen.at(u), b = ringAt(u);
      return [a[0] + (b.x - a[0]) * p, a[1] + (b.y - a[1]) * p, 1 + (b.s - 1) * p];
    };

    const draw = (now: number) => {
      const { hidden } = propsRef.current; const hid = new Set(hidden);
      const { curveOpen, dOpen, dRing, fe, f } = layout();
      const sx = cssW / W, sy = cssH / H;
      ctx.setTransform(dpr * sx, 0, 0, dpr * sy, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (fe > 0.05) {
        const gy = RING_BOTTOM + 30, gr = RING.rw * 1.05;
        const g = ctx.createRadialGradient(RING.cx, gy, 0, RING.cx, gy, gr);
        g.addColorStop(0, `rgba(40,30,25,${0.17 * fe})`); g.addColorStop(1, "rgba(40,30,25,0)");
        ctx.save(); ctx.translate(RING.cx, gy); ctx.scale(1, 0.16); ctx.translate(-RING.cx, -gy); ctx.fillStyle = g; ctx.fillRect(RING.cx - gr, gy - gr, gr * 2, gr * 2); ctx.restore();
      }
      ctx.beginPath();
      for (let i = 0; i <= 160; i++) { const [x, y] = point(i / 160, f, curveOpen); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(120,110,105,0.55)"; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 0.7; ctx.save(); ctx.translate(0, -0.9); ctx.stroke(); ctx.restore();
      if (f < 0.98) { ctx.fillStyle = `rgba(120,110,105,${0.5 * (1 - f)})`; for (const e of [OPEN[0], OPEN[2]]) { ctx.beginPath(); ctx.arc(e[0], e[1], 3.4, 0, Math.PI * 2); ctx.fill(); } }

      type D = { a: Anim; x: number; y: number; r: number; sqx: number; sqy: number; alpha: number; depth: number };
      const items: D[] = []; let anyAnim = false;
      geom.current.clear();
      for (const a of anims.current) {
        if (Number.isNaN(a.u)) continue;
        const base = point(a.u, f, curveOpen);
        const depth = clamp((base[2] - 0.8) / 0.55, 0, 1);
        const rRing = (dRing / 2) * 1.05 * base[2];
        let r = dOpen / 2 + (rRing - dOpen / 2) * fe;
        let x = base[0], y = base[1], sqx = 1, sqy = 1, alpha = 1;
        geom.current.set(a.id, { x, y, r });
        if (hid.has(a.id)) continue;                                            // still flying in from the tray
        if (a.land != null) {
          const k = clamp((now - a.land) / (reduce.current ? 1 : 320), 0, 1);
          const s = Math.sin(k * Math.PI) * 0.16; sqx = 1 + s; sqy = 1 - s; y += s * r * 0.5;
          if (k >= 1) a.land = null; else anyAnim = true;
        }
        if (a.pop != null) {
          const k = clamp((now - a.pop) / (reduce.current ? 1 : 260), 0, 1);
          alpha = 1 - k; r *= 1 - 0.6 * k; y -= 26 * k; anyAnim = true;
          if (k >= 1) a.pop = -1;
        }
        items.push({ a, x, y, r, sqx, sqy, alpha, depth });
      }
      anims.current = anims.current.filter((a) => a.pop !== -1);
      items.sort((p, q) => p.y - q.y);
      for (const it of items) {
        const im = imgs.current[it.a.stone]; const { x, y, r } = it;
        ctx.save(); ctx.globalAlpha = it.alpha;
        const sh = ctx.createRadialGradient(x, y + r * 0.92, 0, x, y + r * 0.92, r * 1.05);
        sh.addColorStop(0, `rgba(30,20,15,${0.16 + 0.1 * it.depth})`); sh.addColorStop(1, "rgba(30,20,15,0)");
        ctx.save(); ctx.translate(x, y + r * 0.92); ctx.scale(1, 0.28); ctx.translate(-x, -(y + r * 0.92)); ctx.fillStyle = sh; ctx.fillRect(x - r * 1.1, y + r * 0.92 - r * 1.1, r * 2.2, r * 2.2); ctx.restore();
        const lift = hoverId.current === it.a.id && it.a.pop == null ? 1.1 : 1;
        ctx.translate(x, y - (lift - 1) * r * 2); ctx.scale(it.sqx * lift, it.sqy * lift);
        if (im && im.complete && im.naturalWidth) ctx.drawImage(im, -r, -r, r * 2, r * 2);
        else { const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, "#ddd"); g.addColorStop(1, "#777"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); }
        if (glint.current != null) {
          const gk = (now - glint.current) / 1100; const band = -140 + gk * (W + 280);
          const d = Math.abs(x - band); const ga = clamp(1 - d / 90, 0, 1) * 0.55 * clamp(1.4 - gk, 0, 1);
          if (ga > 0) { const g = ctx.createRadialGradient(-r * 0.25, -r * 0.3, 0, 0, 0, r); g.addColorStop(0, `rgba(255,255,255,${ga})`); g.addColorStop(0.7, `rgba(255,255,255,${ga * 0.15})`); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); }
        }
        ctx.restore();
      }
      const rest = Math.min(28, anims.current.filter((a) => a.pop == null && !hid.has(a.id)).length * 1.2) * (1 - fe);
      const kS = 60, cS = 2 * Math.sqrt(kS) * 0.55, dt = 1 / 60;
      sag.current.vel += ((rest - sag.current.v) * kS - sag.current.vel * cS) * dt; sag.current.v += sag.current.vel * dt * 10;
      const fo = fold.current;
      if (fo.v !== fo.to) {
        const k = fo.dur ? clamp((now - fo.t0) / fo.dur, 0, 1) : 1;
        fo.v = fo.from + (fo.to - fo.from) * k;
        if (k >= 1) { fo.v = fo.to; if (fo.to === 1 && !reduce.current) glint.current = now + 80; }
        anyAnim = true;
      }
      if (glint.current != null && now - glint.current > 1500) glint.current = null;
      const active = anyAnim || glint.current != null || hid.size > 0 || anims.current.some((a) => a.pop != null || Math.abs(a.uv) > 1e-3) || Math.abs(sag.current.vel) > 0.02 || Math.abs(rest - sag.current.v) > 0.05;
      const nowBusy = fo.v !== fo.to || hid.size > 0;
      if (nowBusy !== busy.current) { busy.current = nowBusy; cbRef.current.onBusy(nowBusy); }
      return active;
    };

    let idle = false;
    const loop = (now: number) => { sync(now); if (draw(now)) { idle = false; raf.current = requestAnimationFrame(loop); } else idle = true; };
    const kick = () => { if (idle) { idle = false; raf.current = requestAnimationFrame(loop); } };
    kickRef.current = kick;
    raf.current = requestAnimationFrame(loop);

    const toLocal = (e: PointerEvent | MouseEvent) => { const r = canvas.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
    const hit = (p: { x: number; y: number }) => {
      let best: Anim | null = null, bd = 1e9;
      for (const a of anims.current) { if (a.pop != null || propsRef.current.hidden.includes(a.id)) continue; const g = geom.current.get(a.id); if (!g) continue; const d = Math.hypot(p.x - g.x, p.y - g.y); if (d < g.r * 1.15 && d < bd) { bd = d; best = a; } }
      return best;
    };
    const onMove = (e: PointerEvent) => { const b = hit(toLocal(e)); const id = b ? b.id : null; if (id !== hoverId.current) { hoverId.current = id; canvas.style.cursor = id != null ? "pointer" : "default"; cbRef.current.onHover(b ? b.stone : null); kick(); } };
    const onLeave = () => { if (hoverId.current != null) { hoverId.current = null; canvas.style.cursor = "default"; cbRef.current.onHover(null); kick(); } };
    const onClick = (e: MouseEvent) => { const b = hit(toLocal(e)); if (b) cbRef.current.onRemove(b.id); };
    canvas.addEventListener("pointermove", onMove); canvas.addEventListener("pointerleave", onLeave); canvas.addEventListener("click", onClick);
    return () => { cancelAnimationFrame(raf.current); ro.disconnect(); canvas.removeEventListener("pointermove", onMove); canvas.removeEventListener("pointerleave", onLeave); canvas.removeEventListener("click", onClick); };
  }, []);

  useEffect(() => { kickRef.current(); }, [beads, slots, folded, hidden]);

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", aspectRatio: `${W} / ${H}`, display: "block", touchAction: "manipulation" }} aria-label={`${beads.length} of ${slots} beads on the string`} role="img" />;
});
