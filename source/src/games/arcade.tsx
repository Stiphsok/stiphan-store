import { useRef } from "react";
import { useCanvas, text, rr, burst, drawParticles, P, Input } from "./engine";

const W = 400, H = 600;
function Cv({ setup }: { setup: (ctx: CanvasRenderingContext2D, i: Input) => (dt: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useCanvas(ref, W, H, setup, []);
  return <canvas ref={ref} className="rounded-2xl border-2 border-amber-500/40 shadow-[0_0_40px_rgba(255,170,0,.25)] touch-none mx-auto block" style={{ width: "min(400px,92vw)", aspectRatio: "2/3" }} />;
}
const bg = (ctx: CanvasRenderingContext2D, a: string, b: string) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const overlay = (ctx: CanvasRenderingContext2D, t: string, s: string) => { ctx.fillStyle = "#000b"; ctx.fillRect(0, 0, W, H); text(ctx, t, W / 2, H / 2 - 10, 38, "#ffd54f"); text(ctx, s, W / 2, H / 2 + 30, 16, "#fff"); };
const mkStars = (n: number) => Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 20 + Math.random() * 80 }));

/* ---------- GALAXY INVADERS ---------- */
export const Invaders = () => <Cv setup={(ctx, i) => {
  let px = W / 2, bullets: { x: number; y: number }[] = [], eb: { x: number; y: number }[] = [], en: { x: number; y: number; a: boolean }[] = [], dir = 1, cd = 0, score = 0, lives = 3, wave = 0, state = 0;
  const ps: P[] = [], stars = mkStars(90);
  const spawn = () => { wave++; en = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) en.push({ x: 50 + c * 40, y: 70 + r * 36, a: true }); };
  spawn();
  return (dt) => {
    if (state !== 1) { if (i.clicks.length || i.pressed.has(" ")) { if (state === 2) { score = 0; lives = 3; wave = 0; spawn(); } state = 1; } }
    bg(ctx, "#05021a", "#2a0a4a");
    stars.forEach((s) => { s.y = (s.y + s.v * dt) % H; ctx.fillStyle = "#fff"; ctx.fillRect(s.x, s.y, 1.5, 1.5); });
    if (state === 1) {
      if (i.keys.has("ArrowLeft")) px -= 300 * dt; else if (i.keys.has("ArrowRight")) px += 300 * dt; else px += (i.px - px) * dt * 12;
      px = Math.max(20, Math.min(W - 20, px)); cd -= dt;
      if (cd <= 0) { bullets.push({ x: px, y: H - 60 }); cd = 0.28; }
      const alive = en.filter((e) => e.a); let edge = false;
      const spd = 30 + wave * 10 + (40 - alive.length) * 2;
      alive.forEach((e) => { e.x += dir * spd * dt; if (e.x < 20 || e.x > W - 20) edge = true; });
      if (edge) { dir *= -1; alive.forEach((e) => (e.y += 14)); }
      if (Math.random() < dt * (1 + wave * 0.5) && alive.length) { const s = alive[Math.floor(Math.random() * alive.length)]; eb.push({ x: s.x, y: s.y }); }
      bullets.forEach((b) => (b.y -= 520 * dt)); eb.forEach((b) => (b.y += 240 * dt));
      bullets = bullets.filter((b) => { if (b.y < 0) return false; for (const e of alive) if (e.a && Math.abs(e.x - b.x) < 16 && Math.abs(e.y - b.y) < 14) { e.a = false; score += 20; burst(ps, e.x, e.y, "#e040fb"); return false; } return true; });
      eb = eb.filter((b) => { if (b.y > H) return false; if (Math.abs(b.x - px) < 18 && Math.abs(b.y - (H - 50)) < 14) { lives--; burst(ps, px, H - 50, "#00e5ff", 30); if (lives <= 0) state = 2; return false; } return true; });
      if (alive.some((e) => e.y > H - 90)) state = 2;
      if (!alive.length) spawn();
    }
    ctx.font = "26px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    en.forEach((e, k) => e.a && ctx.fillText(["👾", "👽", "🛸"][k % 3], e.x, e.y));
    ctx.fillText("🚀", px, H - 50); ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#00e5ff"; ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 10; bullets.forEach((b) => ctx.fillRect(b.x - 2, b.y - 8, 4, 12));
    ctx.fillStyle = "#ff4081"; ctx.shadowColor = "#ff4081"; eb.forEach((b) => ctx.fillRect(b.x - 2, b.y, 4, 10)); ctx.shadowBlur = 0;
    drawParticles(ctx, ps, dt, 0);
    text(ctx, `SCORE ${score}`, 12, 30, 16, "#fff", "left"); text(ctx, "❤".repeat(Math.max(0, lives)), W - 12, 30, 18, "#ff4081", "right");
    if (state === 0) overlay(ctx, "GALAXY INVADERS", "Tap to start • auto fire"); if (state === 2) overlay(ctx, "GAME OVER", `Score ${score} — tap`);
  };
}} />;

/* ---------- RACING LEGENDS ---------- */
export const Racing = () => <Cv setup={(ctx, i) => {
  let lane = 1, x = W / 2, cars: { lane: number; y: number; color: string }[] = [], road = 0, speed = 300, score = 0, best = 0, state = 0, spawn = 0;
  const lx = (n: number) => 100 + n * 100, ps: P[] = [];
  const drawCar = (cx: number, cy: number, color: string, player = false) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.shadowColor = player ? "#ffb52e" : color;
    ctx.shadowBlur = player ? 18 : 8;
    ctx.fillStyle = "#080b10";
    for (const side of [-1, 1]) {
      rr(ctx, side * 13 - 5, -23, 10, 19, 3); ctx.fill();
      rr(ctx, side * 13 - 5, 6, 10, 19, 3); ctx.fill();
    }
    const body = ctx.createLinearGradient(-18, 0, 18, 0);
    body.addColorStop(0, "#343a46"); body.addColorStop(.24, color); body.addColorStop(.78, color); body.addColorStop(1, "#222936");
    ctx.fillStyle = body;
    rr(ctx, -17, -31, 34, 62, 9); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#101c2a";
    rr(ctx, -12, -20, 24, 16, 5); ctx.fill();
    rr(ctx, -12, 5, 24, 14, 4); ctx.fill();
    ctx.fillStyle = "#ffffffa0"; rr(ctx, -13, -28, 26, 4, 2); ctx.fill();
    ctx.fillStyle = player ? "#ff4838" : "#ffd98a";
    ctx.fillRect(-12, player ? 24 : -30, 7, 3); ctx.fillRect(5, player ? 24 : -30, 7, 3);
    ctx.fillStyle = "#fff8"; ctx.fillRect(-2, -17, 4, 34);
    if (player) {
      ctx.fillStyle = "#141a24"; ctx.fillRect(-22, 21, 44, 4);
      ctx.fillStyle = "#ffd26e"; ctx.fillRect(-7, 27, 14, 2);
    }
    ctx.restore();
  };
  return (dt) => {
    const tap = i.clicks.length > 0 || i.pressed.has(" ");
    if (state !== 1 && tap) {
      if (state === 2) { cars = []; speed = 300; score = 0; spawn = 0; }
      state = 1;
    }
    if (state === 1) {
      if (i.pressed.has("ArrowLeft")) lane = Math.max(0, lane - 1);
      if (i.pressed.has("ArrowRight")) lane = Math.min(2, lane + 1);
      i.clicks.forEach((click) => { lane = click.x < W / 2 ? Math.max(0, lane - 1) : Math.min(2, lane + 1); });
      if (i.down) lane = Math.max(0, Math.min(2, Math.round((i.px - 50) / 100)));
      if (i.keys.has("ArrowUp")) speed += 300 * dt;
      else if (i.keys.has("ArrowDown")) speed -= 430 * dt;
      else speed += 55 * dt;
      speed = Math.max(180, Math.min(560, speed));
      road = (road + speed * dt) % 90;
      score += speed * dt / 10;
      spawn -= dt;
      if (spawn <= 0) {
        cars.push({ lane: Math.floor(Math.random() * 3), y: -90, color: ["#e24b45", "#397ed0", "#d5dbe5", "#efbd46"][Math.floor(Math.random() * 4)] });
        spawn = Math.max(.55, 1.25 - speed / 1500);
      }
      cars.forEach((car) => { car.y += (speed * .72 + 130) * dt; });
      cars = cars.filter((car) => car.y < H + 80);
      if (cars.some((car) => Math.abs(lx(car.lane) - x) < 34 && Math.abs(car.y - (H - 110)) < 54)) {
        state = 2; best = Math.max(best, Math.floor(score)); burst(ps, x, H - 110, "#ff9100", 50);
      }
    }
    x += (lx(lane) - x) * dt * 14;
    bg(ctx, "#14263b", "#07101d");
    ctx.fillStyle = "#23412d";
    for (let y = -20 + road; y < H; y += 100) {
      ctx.beginPath(); ctx.arc(20, y, 20, 0, Math.PI * 2); ctx.arc(W - 20, y + 36, 20, 0, Math.PI * 2); ctx.fill();
    }
    const roadFill = ctx.createLinearGradient(50, 0, 350, 0);
    roadFill.addColorStop(0, "#202735"); roadFill.addColorStop(.5, "#303744"); roadFill.addColorStop(1, "#1c2330");
    ctx.fillStyle = roadFill; ctx.fillRect(50, 0, 300, H);
    ctx.fillStyle = "#e7b958";
    for (let y = -90 + road; y < H; y += 45) { ctx.fillRect(44, y, 6, 24); ctx.fillRect(350, y, 6, 24); }
    ctx.fillStyle = "#d9deea";
    for (let y = -90 + road; y < H; y += 90) { ctx.fillRect(148, y, 4, 44); ctx.fillRect(248, y, 4, 44); }
    cars.forEach((car) => drawCar(lx(car.lane), car.y, car.color));
    drawCar(x, H - 110, "#f7a930", true);
    drawParticles(ctx, ps, dt, 0);
    text(ctx, `${Math.floor(score)} m`, 12, 30, 18, "#fff", "left");
    text(ctx, `${Math.floor(speed / 3)} km/h`, W - 12, 30, 16, "#ffd54f", "right");
    text(ctx, `BEST ${best} m`, W / 2, 30, 14, "#fff", "center");
    if (state === 0) overlay(ctx, "RACING LEGENDS", "Tap to start • steer, accelerate, brake");
    if (state === 2) overlay(ctx, "CRASH!", `${Math.floor(score)} m • tap to restart`);
  };
}} />;

/* ---------- NEON SNAKE ---------- */
export const Snake = () => <Cv setup={(ctx, i) => {
  const N = 20, S = W / N; let sn = [{ x: 10, y: 15 }], d = { x: 1, y: 0 }, nd = d, food = { x: 5, y: 5 }, acc = 0, state = 0, score = 0;
  const ps: P[] = [];
  const place = () => { do food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * 30) }; while (sn.some((s) => s.x === food.x && s.y === food.y)); };
  return (dt) => {
    if (state !== 1 && (i.clicks.length || i.pressed.has(" "))) { if (state === 2) { sn = [{ x: 10, y: 15 }]; d = nd = { x: 1, y: 0 }; score = 0; } state = 1; i.clicks = []; }
    const k = i.pressed;
    if (k.has("ArrowUp") && d.y === 0) nd = { x: 0, y: -1 }; if (k.has("ArrowDown") && d.y === 0) nd = { x: 0, y: 1 };
    if (k.has("ArrowLeft") && d.x === 0) nd = { x: -1, y: 0 }; if (k.has("ArrowRight") && d.x === 0) nd = { x: 1, y: 0 };
    i.clicks.forEach((c) => { const h = sn[0], dx = c.x - (h.x + 0.5) * S, dy = c.y - (h.y + 0.5) * S; if (Math.abs(dx) > Math.abs(dy)) { if (d.x === 0) nd = { x: Math.sign(dx), y: 0 }; } else if (d.y === 0) nd = { x: 0, y: Math.sign(dy) }; });
    if (state === 1) {
      acc += dt; const step = Math.max(0.05, 0.12 - score * 0.001);
      while (acc > step) {
        acc -= step; d = nd; const h = { x: sn[0].x + d.x, y: sn[0].y + d.y };
        if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= 30 || sn.some((s) => s.x === h.x && s.y === h.y)) { state = 2; break; }
        sn.unshift(h); if (h.x === food.x && h.y === food.y) { score += 10; burst(ps, (h.x + .5) * S, (h.y + .5) * S, "#ffea00"); place(); } else sn.pop();
      }
    }
    bg(ctx, "#020812", "#0a0a2a");
    ctx.strokeStyle = "#ffffff08"; for (let x = 0; x < N; x++) for (let y = 0; y < 30; y++) ctx.strokeRect(x * S, y * S, S, S);
    sn.forEach((s, k) => { ctx.fillStyle = `hsl(${150 + k * 4},100%,55%)`; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12; rr(ctx, s.x * S + 1, s.y * S + 1, S - 2, S - 2, 5); ctx.fill(); });
    ctx.shadowBlur = 0; ctx.font = "18px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🍎", (food.x + .5) * S, (food.y + .5) * S); ctx.textBaseline = "alphabetic";
    drawParticles(ctx, ps, dt, 0); text(ctx, `SCORE ${score}`, 12, 26, 16, "#fff", "left");
    if (state === 0) overlay(ctx, "NEON SNAKE", "Arrows or tap direction"); if (state === 2) overlay(ctx, "GAME OVER", `Score ${score} — tap`);
  };
}} />;

/* ---------- BLOCK STACK (Tetris) ---------- */
const SH = [[[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]], [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]], [[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]]];
const COL = ["#00e5ff", "#ffea00", "#d500f9", "#2979ff", "#ff9100", "#00e676", "#ff1744"];
export const Tetris = () => <Cv setup={(ctx, i) => {
  const C = 10, R = 20, S = 26, ox = (W - C * S) / 2, oy = 50;
  let g: number[][] = [], p: { m: number[][]; x: number; y: number; c: number }, acc = 0, score = 0, lines = 0, state = 0;
  const ps: P[] = [];
  const reset = () => { g = Array.from({ length: R }, () => Array(C).fill(-1)); score = 0; lines = 0; };
  const nw = () => { const k = Math.floor(Math.random() * 7); p = { m: SH[k], x: 3, y: 0, c: k }; if (hit(p.m, p.x, p.y)) state = 2; };
  const hit = (m: number[][], x: number, y: number) => m.some((r, j) => r.some((v, k) => v && (x + k < 0 || x + k >= C || y + j >= R || (y + j >= 0 && g[y + j][x + k] >= 0))));
  const rot = (m: number[][]) => m[0].map((_, k) => m.map((r) => r[k]).reverse());
  const lock = () => { p.m.forEach((r, j) => r.forEach((v, k) => v && p.y + j >= 0 && (g[p.y + j][p.x + k] = p.c))); let n = 0; g = g.filter((r, j) => { if (r.every((v) => v >= 0)) { n++; burst(ps, W / 2, oy + j * S, COL[r[0]], 30); return false; } return true; }); while (g.length < R) g.unshift(Array(C).fill(-1)); lines += n; score += [0, 100, 300, 500, 800][n]; nw(); };
  reset(); nw();
  return (dt) => {
    if (state !== 1 && (i.clicks.length || i.pressed.has(" "))) { if (state === 2) { reset(); nw(); } state = 1; i.clicks = []; i.pressed.clear(); }
    if (state === 1) {
      const k = i.pressed;
      if (k.has("ArrowLeft") && !hit(p.m, p.x - 1, p.y)) p.x--; if (k.has("ArrowRight") && !hit(p.m, p.x + 1, p.y)) p.x++;
      if (k.has("ArrowUp")) { const m = rot(p.m); if (!hit(m, p.x, p.y)) p.m = m; }
      if (k.has(" ")) { while (!hit(p.m, p.x, p.y + 1)) p.y++; lock(); }
      i.clicks.forEach((c) => { if (c.y > H - 110) { while (!hit(p.m, p.x, p.y + 1)) p.y++; lock(); } else if (c.x < W / 3) { if (!hit(p.m, p.x - 1, p.y)) p.x--; } else if (c.x > W * 2 / 3) { if (!hit(p.m, p.x + 1, p.y)) p.x++; } else { const m = rot(p.m); if (!hit(m, p.x, p.y)) p.m = m; } });
      acc += dt * (i.keys.has("ArrowDown") ? 12 : 1);
      if (acc > Math.max(0.1, 0.7 - lines * 0.02)) { acc = 0; if (hit(p.m, p.x, p.y + 1)) lock(); else p.y++; }
    }
    bg(ctx, "#0a0420", "#1a0a3a");
    ctx.fillStyle = "#0008"; ctx.fillRect(ox, oy, C * S, R * S);
    const cell = (x: number, y: number, c: number, a = 1) => { ctx.globalAlpha = a; ctx.fillStyle = COL[c]; ctx.shadowColor = COL[c]; ctx.shadowBlur = 8; rr(ctx, ox + x * S + 1, oy + y * S + 1, S - 2, S - 2, 4); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = "#fff4"; ctx.fillRect(ox + x * S + 3, oy + y * S + 3, S - 6, 4); ctx.globalAlpha = 1; };
    g.forEach((r, y) => r.forEach((v, x) => v >= 0 && cell(x, y, v)));
    if (state === 1) { let gy = p.y; while (!hit(p.m, p.x, gy + 1)) gy++; p.m.forEach((r, j) => r.forEach((v, k) => v && cell(p.x + k, gy + j, p.c, 0.2))); p.m.forEach((r, j) => r.forEach((v, k) => v && cell(p.x + k, p.y + j, p.c))); }
    drawParticles(ctx, ps, dt); text(ctx, `SCORE ${score}`, 12, 32, 16, "#fff", "left"); text(ctx, `LINES ${lines}`, W - 12, 32, 16, "#00e5ff", "right");
    if (state === 0) overlay(ctx, "BLOCK STACK", "Arrows/Space • tap L/R/middle/bottom"); if (state === 2) overlay(ctx, "GAME OVER", `Score ${score} — tap`);
  };
}} />;

/* ---------- FLAPPY WINGS ---------- */
export const Flappy = () => <Cv setup={(ctx, i) => {
  let y = H / 2, v = 0, pipes: { x: number; g: number; s: boolean }[] = [], state = 0, score = 0, t = 0, best = 0;
  return (dt) => {
    t += dt; const tap = i.clicks.length || i.pressed.has(" ") || i.pressed.has("ArrowUp");
    if (tap) { if (state === 2) { y = H / 2; v = 0; pipes = []; score = 0; state = 0; } else { state = 1; v = -330; } }
    if (state === 1) {
      v += 900 * dt; y += v * dt;
      if (!pipes.length || pipes[pipes.length - 1].x < W - 200) pipes.push({ x: W + 40, g: 140 + Math.random() * (H - 320), s: false });
      pipes.forEach((p) => { p.x -= 160 * dt; if (!p.s && p.x < 80) { p.s = true; score++; } });
      pipes = pipes.filter((p) => p.x > -80);
      if (y > H - 60 || y < 0 || pipes.some((p) => Math.abs(p.x - 100) < 42 && (y < p.g - 75 + 14 || y > p.g + 75 - 14))) { state = 2; best = Math.max(best, score); }
    } else if (state === 0) y = H / 2 + Math.sin(t * 3) * 10;
    bg(ctx, "#4fc3f7", "#fff3e0");
    ctx.fillStyle = "#fff9"; for (let k = 0; k < 5; k++) { const cx = ((k * 120 - t * 20) % (W + 120) + W + 120) % (W + 120) - 60; ctx.beginPath(); ctx.arc(cx, 80 + k * 40, 30, 0, 6.28); ctx.arc(cx + 30, 80 + k * 40, 24, 0, 6.28); ctx.fill(); }
    pipes.forEach((p) => { const gr = ctx.createLinearGradient(p.x - 30, 0, p.x + 30, 0); gr.addColorStop(0, "#2e7d32"); gr.addColorStop(0.5, "#76ff03"); gr.addColorStop(1, "#1b5e20"); ctx.fillStyle = gr; ctx.fillRect(p.x - 30, 0, 60, p.g - 75); ctx.fillRect(p.x - 30, p.g + 75, 60, H); ctx.fillRect(p.x - 36, p.g - 95, 72, 20); ctx.fillRect(p.x - 36, p.g + 75, 72, 20); });
    ctx.fillStyle = "#8d6e63"; ctx.fillRect(0, H - 60, W, 60); ctx.fillStyle = "#7cb342"; ctx.fillRect(0, H - 60, W, 12);
    ctx.save(); ctx.translate(100, y); ctx.rotate(Math.max(-0.5, Math.min(1, v / 600))); ctx.scale(-1, 1); ctx.font = "38px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🐦", 0, 0); ctx.restore(); ctx.textBaseline = "alphabetic";
    text(ctx, String(score), W / 2, 70, 48, "#fff");
    if (state === 0) text(ctx, "TAP TO FLAP", W / 2, H / 2 + 70, 22, "#ff6d00"); if (state === 2) overlay(ctx, "GAME OVER", `Score ${score} • Best ${best}`);
  };
}} />;

/* ---------- NEON PONG ---------- */
export const Pong = () => <Cv setup={(ctx, i) => {
  let px = W / 2, ax = W / 2, b = { x: W / 2, y: H / 2, vx: 0, vy: 0 }, sp = 0, sa = 0, state = 0, winner = 0; const ps: P[] = [];
  const reset = (d: number) => { b = { x: W / 2, y: H / 2, vx: (Math.random() - .5) * 300, vy: 300 * d }; };
  return (dt) => {
    if (state !== 1 && (i.clicks.length || i.pressed.has(" "))) {
      if (state === 2) { sp = 0; sa = 0; winner = 0; }
      reset(-1); state = 1;
    }
    if (state === 1) {
      if (i.keys.has("ArrowLeft")) px -= 400 * dt; else if (i.keys.has("ArrowRight")) px += 400 * dt; else px += (i.px - px) * dt * 15;
      px = Math.max(50, Math.min(W - 50, px));
      ax += Math.sign(b.x - ax) * Math.min(Math.abs(b.x - ax), 260 * dt);
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < 8 || b.x > W - 8) { b.x = Math.max(8, Math.min(W - 8, b.x)); b.vx *= -1; }
      if (b.vy > 0 && b.y > H - 48 && b.y < H - 30 && Math.abs(b.x - px) < 50) { b.vy = -Math.abs(b.vy) * 1.05; b.vx += (b.x - px) * 5; burst(ps, b.x, b.y, "#00e5ff"); }
      if (b.vy < 0 && b.y < 48 && b.y > 30 && Math.abs(b.x - ax) < 50) { b.vy = Math.abs(b.vy) * 1.05; b.vx += (b.x - ax) * 5; burst(ps, b.x, b.y, "#ff4081"); }
      if (b.y < 0) { sp++; if (sp >= 5) { winner = 1; state = 2; } else reset(1); }
      if (b.y > H) { sa++; if (sa >= 5) { winner = 2; state = 2; } else reset(-1); }
    }
    bg(ctx, "#0a0020", "#200040");
    ctx.setLineDash([10, 10]); ctx.strokeStyle = "#fff3"; ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, `${sa}   •   ${sp}`, W / 2, H / 2 + 8, 46, "#ffffff66");
    ctx.shadowBlur = 20; ctx.fillStyle = ctx.shadowColor = "#ff4081"; rr(ctx, ax - 50, 30, 100, 12, 6); ctx.fill();
    ctx.fillStyle = ctx.shadowColor = "#00e5ff"; rr(ctx, px - 50, H - 42, 100, 12, 6); ctx.fill();
    ctx.fillStyle = ctx.shadowColor = "#fff"; ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
    drawParticles(ctx, ps, dt, 0);
    if (state === 0) overlay(ctx, "NEON PONG", "Move with ← → or pointer • first to 5");
    if (state === 2) overlay(ctx, winner === 1 ? "YOU WIN" : "AI WINS", `${sp} - ${sa} • tap or Space to replay`);
  };
}} />;

/* ---------- ASTEROIDS ---------- */
export const Asteroids = () => <Cv setup={(ctx, i) => {
  let s = { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0 }, bl: { x: number; y: number; vx: number; vy: number; l: number }[] = [], as: { x: number; y: number; vx: number; vy: number; r: number }[] = [], cd = 0, score = 0, state = 0, lives = 3, inv = 0;
  const ps: P[] = [], stars = mkStars(80);
  const wave = (n: number) => { for (let k = 0; k < n; k++) as.push({ x: Math.random() * W, y: Math.random() < .5 ? 0 : H, vx: (Math.random() - .5) * 120, vy: (Math.random() - .5) * 120, r: 40 }); };
  wave(4);
  const wrap = (o: { x: number; y: number }) => { o.x = (o.x + W) % W; o.y = (o.y + H) % H; };
  return (dt) => {
    if (state !== 1 && (i.clicks.length || i.pressed.has(" "))) { if (state === 2) { as = []; wave(4); score = 0; lives = 3; } state = 1; }
    if (state === 1) {
      const touch = i.down;
      if (touch) { const ta = Math.atan2(i.py - s.y, i.px - s.x); let da = ta - s.a; da = Math.atan2(Math.sin(da), Math.cos(da)); s.a += da * dt * 8; if (Math.hypot(i.px - s.x, i.py - s.y) > 60) { s.vx += Math.cos(s.a) * 300 * dt; s.vy += Math.sin(s.a) * 300 * dt; } }
      if (i.keys.has("ArrowLeft")) s.a -= 4 * dt; if (i.keys.has("ArrowRight")) s.a += 4 * dt;
      if (i.keys.has("ArrowUp")) { s.vx += Math.cos(s.a) * 300 * dt; s.vy += Math.sin(s.a) * 300 * dt; }
      s.vx *= 0.99; s.vy *= 0.99; s.x += s.vx * dt; s.y += s.vy * dt; wrap(s); cd -= dt; inv -= dt;
      if ((i.keys.has(" ") || touch) && cd <= 0) { bl.push({ x: s.x, y: s.y, vx: Math.cos(s.a) * 500, vy: Math.sin(s.a) * 500, l: 1 }); cd = 0.2; }
      bl.forEach((b) => { b.x += b.vx * dt; b.y += b.vy * dt; b.l -= dt; wrap(b); }); bl = bl.filter((b) => b.l > 0);
      as.forEach((a) => { a.x += a.vx * dt; a.y += a.vy * dt; wrap(a); });
      const na: typeof as = [];
      as = as.filter((a) => { const h = bl.find((b) => Math.hypot(b.x - a.x, b.y - a.y) < a.r); if (h) { h.l = 0; score += 50; burst(ps, a.x, a.y, "#ffab40", 20); if (a.r > 15) for (let k = 0; k < 2; k++) na.push({ x: a.x, y: a.y, vx: (Math.random() - .5) * 200, vy: (Math.random() - .5) * 200, r: a.r / 2 }); return false; } return true; });
      as.push(...na); if (!as.length) wave(5);
      if (inv <= 0 && as.some((a) => Math.hypot(a.x - s.x, a.y - s.y) < a.r + 10)) { lives--; inv = 2; burst(ps, s.x, s.y, "#00e5ff", 40); if (lives <= 0) state = 2; }
    }
    bg(ctx, "#000010", "#100028"); stars.forEach((st) => { ctx.fillStyle = "#fff8"; ctx.fillRect(st.x, st.y, 1.5, 1.5); });
    ctx.strokeStyle = "#ffab40"; ctx.lineWidth = 2; ctx.shadowColor = "#ffab40"; ctx.shadowBlur = 10;
    as.forEach((a) => { ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = a.r * (0.8 + ((k * 37) % 5) / 20); ctx.lineTo(a.x + Math.cos(k * .628) * r, a.y + Math.sin(k * .628) * r); } ctx.closePath(); ctx.stroke(); });
    ctx.fillStyle = "#00e5ff"; ctx.shadowColor = "#00e5ff"; bl.forEach((b) => { ctx.beginPath(); ctx.arc(b.x, b.y, 2.5, 0, 6.28); ctx.fill(); });
    if (inv <= 0 || Math.floor(inv * 10) % 2) { ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.a); ctx.strokeStyle = "#00e5ff"; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-10, -9); ctx.lineTo(-5, 0); ctx.lineTo(-10, 9); ctx.closePath(); ctx.stroke(); ctx.restore(); }
    ctx.shadowBlur = 0; drawParticles(ctx, ps, dt, 0);
    text(ctx, `SCORE ${score}`, 12, 30, 16, "#fff", "left"); text(ctx, "▲".repeat(Math.max(0, lives)), W - 12, 30, 16, "#00e5ff", "right");
    if (state === 0) overlay(ctx, "ASTEROID STORM", "Hold to aim & fire • arrows+space"); if (state === 2) overlay(ctx, "DESTROYED", `Score ${score} — tap`);
  };
}} />;

/* ---------- SKY JUMPER ---------- */
export const Jumper = () => <Cv setup={(ctx, i) => {
  let pl: { x: number; y: number; m: number }[] = [], p = { x: W / 2, y: H - 100, vy: 0 }, cam = 0, score = 0, state = 0;
  const init = () => { pl = []; for (let k = 0; k < 12; k++) pl.push({ x: Math.random() * (W - 70), y: H - k * 60, m: Math.random() < .2 ? 1 : 0 }); p = { x: W / 2, y: H - 100, vy: -500 }; cam = 0; score = 0; };
  init();
  return (dt) => {
    if (state !== 1 && (i.clicks.length || i.pressed.has(" "))) { if (state === 2) init(); state = 1; }
    if (state === 1) {
      if (i.keys.has("ArrowLeft")) p.x -= 320 * dt; else if (i.keys.has("ArrowRight")) p.x += 320 * dt; else p.x += (i.px - p.x) * dt * 8;
      p.x = (p.x + W) % W; p.vy += 900 * dt; p.y += p.vy * dt;
      pl.forEach((q, k) => { if (q.m) q.x += Math.sin(performance.now() / 500 + k) * 2; if (p.vy > 0 && p.x > q.x - 10 && p.x < q.x + 80 && p.y > q.y - 20 && p.y < q.y + 4) p.vy = -560; });
      if (p.y - cam < H * 0.4) cam = p.y - H * 0.4; score = Math.max(score, Math.floor(-cam / 10));
      pl = pl.filter((q) => q.y - cam < H + 20); while (pl.length < 12) { const top = Math.min(...pl.map((q) => q.y)); pl.push({ x: Math.random() * (W - 70), y: top - 50 - Math.random() * 40, m: Math.random() < .25 ? 1 : 0 }); }
      if (p.y - cam > H + 40) state = 2;
    }
    bg(ctx, "#1a237e", "#ff8a65");
    pl.forEach((q) => { ctx.fillStyle = q.m ? "#40c4ff" : "#76ff03"; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10; rr(ctx, q.x, q.y - cam, 70, 12, 6); ctx.fill(); }); ctx.shadowBlur = 0;
    ctx.font = "36px serif"; ctx.textAlign = "center"; ctx.fillText("🐸", p.x, p.y - cam);
    text(ctx, `${score}`, W / 2, 50, 36, "#fff");
    if (state === 0) overlay(ctx, "SKY JUMPER", "Move pointer / arrows"); if (state === 2) overlay(ctx, "FELL!", `Height ${score} — tap`);
  };
}} />;
