import { useEffect } from "/vendor/react.js";
export function useCanvas(ref, w, h, setup, deps = []) {
    useEffect(() => {
        const c = ref.current;
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        const input = { keys: new Set(), px: w / 2, py: h / 2, down: false, clicks: [], pressed: new Set() };
        const kd = (e) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key))
                e.preventDefault();
            if (!input.keys.has(e.key))
                input.pressed.add(e.key);
            input.keys.add(e.key);
        };
        const ku = (e) => input.keys.delete(e.key);
        const pos = (e) => {
            const r = c.getBoundingClientRect();
            input.px = ((e.clientX - r.left) / r.width) * w;
            input.py = ((e.clientY - r.top) / r.height) * h;
        };
        const pm = (e) => pos(e);
        const pd = (e) => { pos(e); input.down = true; input.clicks.push({ x: input.px, y: input.py }); };
        const pu = () => (input.down = false);
        window.addEventListener("keydown", kd);
        window.addEventListener("keyup", ku);
        c.addEventListener("pointermove", pm);
        c.addEventListener("pointerdown", pd);
        window.addEventListener("pointerup", pu);
        const step = setup(ctx, input);
        let last = performance.now(), raf = 0;
        const loop = (t) => {
            const dt = Math.min(0.033, (t - last) / 1000);
            last = t;
            step(dt);
            input.clicks = [];
            input.pressed.clear();
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
export function text(ctx, s, x, y, size = 20, color = "#fff", align = "center") {
    ctx.font = `900 ${size}px Inter, system-ui, sans-serif`;
    ctx.textAlign = align;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillText(s, x, y);
    ctx.shadowBlur = 0;
}
export function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
}
export function burst(ps, x, y, c, n = 14) {
    for (let i = 0; i < n; i++) {
        const a = Math.random() * 6.28, v = 60 + Math.random() * 220;
        ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.6 + Math.random() * 0.5, c, s: 2 + Math.random() * 3 });
    }
}
export function drawParticles(ctx, ps, dt, g = 300) {
    for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += g * dt;
        p.life -= dt;
        if (p.life <= 0) {
            ps.splice(i, 1);
            continue;
        }
        ctx.globalAlpha = Math.min(1, p.life * 2);
        ctx.fillStyle = p.c;
        ctx.shadowColor = p.c;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, 6.28);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}
