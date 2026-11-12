import { useEffect, RefObject } from "react";

export type Input = { keys: Set<string>; px: number; py: number; down: boolean; clicks: { x: number; y: number }[]; pressed: Set<string> };

export function useCanvas(
  ref: RefObject<HTMLCanvasElement | null>,
  w: number,
  h: number,
  setup: (ctx: CanvasRenderingContext2D, input: Input) => (dt: number) => void,
  deps: unknown[] = []
) {
  useEffect(() => {
    const c = ref.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const input: Input = { keys: new Set(), px: w / 2, py: h / 2, down: false, clicks: [], pressed: new Set() };
    const kd = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      if (!input.keys.has(e.key)) input.pressed.add(e.key);
      input.keys.add(e.key);
    };
    const ku = (e: KeyboardEvent) => input.keys.delete(e.key);
    const pos = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      input.px = ((e.clientX - r.left) / r.width) * w;
      input.py = ((e.clientY - r.top) / r.height) * h;
    };
    const pm = (e: PointerEvent) => pos(e);
    const pd = (e: PointerEvent) => { pos(e); input.down = true; input.clicks.push({ x: input.px, y: input.py }); };
    const pu = () => (input.down = false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    c.addEventListener("pointermove", pm);
    c.addEventListener("pointerdown", pd);
    window.addEventListener("pointerup", pu);
    const step = setup(ctx, input);
    let last = performance.now(), raf = 0;
    const loop = (t: number) => {
      const dt = Math.min(0.033, (t - last) / 1000); last = t;
      step(dt);
      input.clicks = []; input.pressed.clear();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      c.removeEventListener("pointermove", pm);
      c.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointerup", pu);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size = 20, color = "#fff", align: CanvasTextAlign = "center") {
  ctx.font = `900 ${size}px Inter, system-ui, sans-serif`;
  ctx.textAlign = align; ctx.fillStyle = color;
  ctx.shadowColor = color; ctx.shadowBlur = 10;
  ctx.fillText(s, x, y); ctx.shadowBlur = 0;
}

export function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}

export type P = { x: number; y: number; vx: number; vy: number; life: number; c: string; s: number };
export function burst(ps: P[], x: number, y: number, c: string, n = 14) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, v = 60 + Math.random() * 220;
    ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.6 + Math.random() * 0.5, c, s: 2 + Math.random() * 3 });
  }
}
export function drawParticles(ctx: CanvasRenderingContext2D, ps: P[], dt: number, g = 300) {
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += g * dt; p.life -= dt;
    if (p.life <= 0) { ps.splice(i, 1); continue; }
    ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.c;
    ctx.shadowColor = p.c; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
}
