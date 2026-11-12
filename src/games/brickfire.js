import { jsx as _jsx, jsxs as _jsxs } from "/vendor/react-jsx-runtime.js";
import { useRef, useState } from "/vendor/react.js";
import { useCanvas, text, rr, burst, drawParticles } from "./engine.js";
export const THEMES = [
    { id: "fruit", name: "Fruit Night", icon: "🍓", sky: ["#0b1240", "#3a1f6b", "#e0703a"], ground: "#0c3a5c", accent: "#ffb300", bricks: ["#e53935", "#43a047", "#fdd835", "#8e24aa", "#fb8c00", "#29b6f6"], em: ["🍓", "🍉", "🍋", "🍇", "🍊", "🥝", "🍍", "🍎"] },
    { id: "stadium", name: "Stadium", icon: "🏟️", sky: ["#020b24", "#0d2a5a", "#1b4a8a"], ground: "#1f7a2e", accent: "#4fc3f7", bricks: ["#e53935", "#1e88e5", "#43a047", "#fdd835", "#8e24aa"], em: ["⚽", "🏆", "👑", "⭐"] },
    { id: "jungle", name: "Jungle", icon: "🌿", sky: ["#04160b", "#0c3a1c", "#1f6b2e"], ground: "#0a2a12", accent: "#76ff03", bricks: ["#c62828", "#2e7d32", "#f9a825", "#6d4c41"], em: ["🌶️", "🍌", "🥭", "🌿"] },
    { id: "space", name: "Space", icon: "🪐", sky: ["#05021a", "#1a0b4a", "#3b1a7a"], ground: "#120636", accent: "#e040fb", bricks: ["#d500f9", "#2979ff", "#00e5ff", "#651fff", "#f50057"], em: ["💎", "🪐", "✨", "🌟"] },
    { id: "winter", name: "Winter", icon: "❄️", sky: ["#0a2a4a", "#2f6ea0", "#9fd3f0"], ground: "#dfeffa", accent: "#80d8ff", bricks: ["#4fc3f7", "#81d4fa", "#0288d1", "#b3e5fc"], em: ["❄️", "⛄", "🧊"] },
    { id: "lava", name: "Lava", icon: "🔥", sky: ["#1a0400", "#4a0e00", "#a82800"], ground: "#ff5a00", accent: "#ff6d00", bricks: ["#d50000", "#ff6d00", "#ffd600", "#3e2723"], em: ["🔥", "🌋", "💥"] },
    { id: "ocean", name: "Ocean", icon: "🌊", sky: ["#002a3a", "#005a7a", "#00a0b0"], ground: "#00303f", accent: "#18ffff", bricks: ["#00b8d4", "#00c853", "#2962ff", "#00e5ff"], em: ["🐚", "🐠", "⭐", "🌊"] },
    { id: "neon", name: "Neon", icon: "🌃", sky: ["#0a0020", "#2a0050", "#5a0080"], ground: "#150030", accent: "#ff4081", bricks: ["#ff4081", "#e040fb", "#00e5ff", "#ffea00", "#7c4dff"], em: ["💜", "⚡", "🎵"] },
    { id: "desert", name: "Desert", icon: "🏜️", sky: ["#3a1a00", "#a0521a", "#f0b050"], ground: "#c8862a", accent: "#ffc400", bricks: ["#ffb74d", "#4fc3f7", "#e57373", "#ffd54f"], em: ["🐪", "🏺", "☀️", "🔱"] },
    { id: "night", name: "Sakura Night", icon: "⛩️", sky: ["#0a0628", "#2a1050", "#6a2a7a"], ground: "#1a0a30", accent: "#ff80ab", bricks: ["#ff4081", "#ab47bc", "#7c4dff", "#40c4ff"], em: ["🌸", "⛩️", "🏮"] },
];
const W = 420, H = 680;
function makeLevel(lv, th) {
    const cols = 10, bw = 38, bh = 30, ox = (W - cols * bw) / 2, bs = [];
    const rows = Math.min(5 + lv, 10);
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            const pattern = (lv % 3 === 1) ? !(r > 2 && c > 2 && c < 7) : (lv % 3 === 2) ? (r + c) % 2 === 0 || r < 2 : Math.abs(c - 4.5) < r + 1.5;
            if (!pattern)
                continue;
            bs.push({ x: ox + c * bw, y: 120 + r * bh, c: th.bricks[(r + c * 3) % th.bricks.length], e: th.em[(r * 7 + c) % th.em.length], crown: Math.random() < 0.06, alive: true });
        }
    return bs;
}
export default function BrickFire() {
    const ref = useRef(null);
    const [theme, setTheme] = useState(0);
    const [speed, setSpeed] = useState(1);
    const sp = useRef(1);
    sp.current = speed;
    const th = THEMES[theme];
    useCanvas(ref, W, H, (ctx, inp) => {
        let level = 1, score = 0, lives = 3, stuck = true, over = false, t = 0;
        let bricks = makeLevel(level, th);
        const pad = { x: W / 2, w: 110 };
        const ball = { x: W / 2, y: 0, vx: 0, vy: 0, r: 10 };
        const ps = [], trail = [];
        const stars = Array.from({ length: 80 }, () => ({ x: Math.random() * W, y: Math.random() * H * 0.6, s: Math.random() * 1.8, p: Math.random() * 6 }));
        const launch = () => { if (over) {
            level = 1;
            score = 0;
            lives = 3;
            bricks = makeLevel(1, th);
            over = false;
        } if (stuck) {
            stuck = false;
            const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
            ball.vx = Math.cos(a) * 340;
            ball.vy = Math.sin(a) * 340;
        } };
        const drawBall = (x, y, r) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(t * 6);
            ctx.fillStyle = "#fff";
            ctx.shadowColor = th.accent;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, 6.28);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#111";
            for (let i = 0; i < 5; i++) {
                const a = i * 1.2566;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, r * 0.22, 0, 6.28);
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.3, 0, 6.28);
            ctx.fill();
            ctx.restore();
        };
        return (dt) => {
            t += dt;
            if (inp.clicks.length || inp.pressed.has(" "))
                launch();
            // input
            if (inp.keys.has("ArrowLeft"))
                pad.x -= 520 * dt;
            else if (inp.keys.has("ArrowRight"))
                pad.x += 520 * dt;
            else
                pad.x += (inp.px - pad.x) * Math.min(1, dt * 18);
            pad.x = Math.max(pad.w / 2, Math.min(W - pad.w / 2, pad.x));
            const py = H - 120;
            // physics
            const steps = 4, s = sp.current * (1 + (level - 1) * 0.05);
            if (stuck) {
                ball.x = pad.x;
                ball.y = py - ball.r - 8;
            }
            else
                for (let k = 0; k < steps; k++) {
                    ball.x += (ball.vx * s * dt) / steps;
                    ball.y += (ball.vy * s * dt) / steps;
                    if (ball.x < ball.r) {
                        ball.x = ball.r;
                        ball.vx = Math.abs(ball.vx);
                    }
                    if (ball.x > W - ball.r) {
                        ball.x = W - ball.r;
                        ball.vx = -Math.abs(ball.vx);
                    }
                    if (ball.y < 90 + ball.r) {
                        ball.y = 90 + ball.r;
                        ball.vy = Math.abs(ball.vy);
                    }
                    if (ball.vy > 0 && ball.y + ball.r > py - 8 && ball.y < py + 8 && Math.abs(ball.x - pad.x) < pad.w / 2 + ball.r) {
                        const off = (ball.x - pad.x) / (pad.w / 2), a = -Math.PI / 2 + off * 1.05, v = Math.hypot(ball.vx, ball.vy);
                        ball.vx = Math.cos(a) * v;
                        ball.vy = Math.sin(a) * v;
                        burst(ps, ball.x, py - 8, th.accent, 6);
                    }
                    for (const b of bricks) {
                        if (!b.alive)
                            continue;
                        const nx = Math.max(b.x, Math.min(ball.x, b.x + 36)), ny = Math.max(b.y, Math.min(ball.y, b.y + 28));
                        if ((ball.x - nx) ** 2 + (ball.y - ny) ** 2 < ball.r ** 2) {
                            b.alive = false;
                            score += b.crown ? 100 : 10;
                            burst(ps, b.x + 18, b.y + 14, b.c, 18);
                            burst(ps, b.x + 18, b.y + 14, "#ffd54f", 8);
                            if (Math.abs(ball.x - nx) > Math.abs(ball.y - ny))
                                ball.vx *= -1;
                            else
                                ball.vy *= -1;
                            break;
                        }
                    }
                    if (ball.y > H + 20) {
                        lives--;
                        stuck = true;
                        if (lives <= 0)
                            over = true;
                        break;
                    }
                }
            if (!bricks.some((b) => b.alive)) {
                level++;
                bricks = makeLevel(level, th);
                stuck = true;
            }
            trail.push({ x: ball.x, y: ball.y });
            if (trail.length > 18)
                trail.shift();
            // ---- draw background
            const g = ctx.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, th.sky[0]);
            g.addColorStop(0.55, th.sky[1]);
            g.addColorStop(0.75, th.sky[2]);
            g.addColorStop(1, th.ground);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
            for (const st of stars) {
                ctx.globalAlpha = 0.4 + Math.sin(t * 2 + st.p) * 0.4;
                ctx.fillStyle = "#fff";
                ctx.fillRect(st.x, st.y, st.s, st.s);
            }
            ctx.globalAlpha = 1;
            // moon
            ctx.fillStyle = "#fff8d0";
            ctx.shadowColor = "#fff8d0";
            ctx.shadowBlur = 40;
            ctx.beginPath();
            ctx.arc(W * 0.8, 470, 22, 0, 6.28);
            ctx.fill();
            ctx.shadowBlur = 0;
            // mountains
            ctx.fillStyle = "rgba(0,0,0,0.35)";
            ctx.beginPath();
            ctx.moveTo(0, 520);
            for (let x = 0; x <= W; x += 30)
                ctx.lineTo(x, 480 - Math.abs(Math.sin(x * 0.02 + 1)) * 60);
            ctx.lineTo(W, 540);
            ctx.lineTo(0, 540);
            ctx.fill();
            // water reflection
            const wg = ctx.createLinearGradient(0, 530, 0, H);
            wg.addColorStop(0, th.sky[2] + "aa");
            wg.addColorStop(1, th.ground);
            ctx.fillStyle = wg;
            ctx.fillRect(0, 530, W, H - 530);
            for (let i = 0; i < 14; i++) {
                ctx.fillStyle = th.accent + "55";
                ctx.fillRect((i * 67 + t * 20) % W, 545 + (i * 13) % 90, 30, 2);
            }
            // bricks
            for (const b of bricks) {
                if (!b.alive)
                    continue;
                const bg = ctx.createLinearGradient(b.x, b.y, b.x, b.y + 28);
                const c = b.crown ? "#ffb300" : b.c;
                bg.addColorStop(0, "#ffffff88");
                bg.addColorStop(0.25, c);
                bg.addColorStop(1, "#00000088");
                ctx.fillStyle = c;
                rr(ctx, b.x + 1, b.y + 1, 34, 26, 5);
                ctx.fill();
                ctx.fillStyle = bg;
                ctx.fill();
                ctx.strokeStyle = b.crown ? "#fff3" : "#0006";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                if (b.crown) {
                    ctx.shadowColor = "#ffd54f";
                    ctx.shadowBlur = 14 + Math.sin(t * 5) * 6;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
                ctx.font = "16px serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(b.crown ? "👑" : b.e, b.x + 18, b.y + 15);
                ctx.textBaseline = "alphabetic";
            }
            // trail
            trail.forEach((p, i) => { ctx.globalAlpha = i / trail.length * 0.6; ctx.fillStyle = th.accent; ctx.beginPath(); ctx.arc(p.x, p.y, ball.r * (i / trail.length), 0, 6.28); ctx.fill(); });
            ctx.globalAlpha = 1;
            drawParticles(ctx, ps, dt);
            drawBall(ball.x, ball.y, ball.r);
            // paddle
            const pg = ctx.createLinearGradient(0, py - 10, 0, py + 12);
            pg.addColorStop(0, "#c9a14a");
            pg.addColorStop(0.5, "#2a2230");
            pg.addColorStop(1, "#8a6a2a");
            ctx.fillStyle = pg;
            rr(ctx, pad.x - pad.w / 2, py - 9, pad.w, 20, 10);
            ctx.fill();
            ctx.strokeStyle = "#ffd54f";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = th.accent;
            ctx.shadowColor = th.accent;
            ctx.shadowBlur = 16;
            ctx.fillRect(pad.x - pad.w / 2 + 12, py - 2, 26, 4);
            ctx.fillRect(pad.x + pad.w / 2 - 38, py - 2, 26, 4);
            ctx.shadowBlur = 0;
            // HUD
            ctx.fillStyle = "#1a120ccc";
            rr(ctx, 8, 10, 100, 60, 10);
            ctx.fill();
            ctx.strokeStyle = "#c9a14a";
            ctx.stroke();
            rr(ctx, W - 108, 10, 100, 60, 10);
            ctx.fill();
            ctx.stroke();
            text(ctx, "LEVEL", 58, 33, 13, "#ffd54f");
            text(ctx, String(level), 58, 60, 24, "#fff");
            text(ctx, "SCORE", W - 58, 33, 13, "#ffd54f");
            text(ctx, String(score), W - 58, 60, 22, "#fff");
            ctx.save();
            ctx.translate(W / 2, 48);
            ctx.rotate(-0.06);
            text(ctx, "STIPHAN", 0, -4, 30, "#6ec6ff");
            text(ctx, "BRICK FIRE", 0, 26, 24, "#ff9800");
            ctx.restore();
            for (let i = 0; i < 3; i++) {
                ctx.globalAlpha = i < lives ? 1 : 0.2;
                ctx.font = "22px serif";
                ctx.textAlign = "left";
                ctx.fillText("❤️", 12 + i * 28, H - 20);
            }
            ctx.globalAlpha = 1;
            if (stuck && !over)
                text(ctx, "TAP / SPACE TO LAUNCH", W / 2, H / 2 + 60, 18, "#fff");
            if (over) {
                ctx.fillStyle = "#000a";
                ctx.fillRect(0, 0, W, H);
                text(ctx, "GAME OVER", W / 2, H / 2, 44, "#ff5252");
                text(ctx, `Score ${score} — tap to retry`, W / 2, H / 2 + 40, 18, "#fff");
            }
        };
    }, [theme]);
    return (_jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx("canvas", { ref: ref, className: "rounded-2xl border-4 border-amber-700/70 shadow-[0_0_40px_rgba(255,170,0,.3)] touch-none", style: { width: "min(420px, 92vw)", aspectRatio: `${W}/${H}` } }), _jsxs("div", { className: "flex items-center gap-3 bg-gradient-to-b from-amber-900/60 to-black/80 border-2 border-amber-600/60 rounded-2xl px-4 py-2", children: [_jsx("button", { onClick: () => setSpeed((s) => Math.max(0.5, +(s - 0.25).toFixed(2))), className: "w-10 h-10 rounded-lg bg-black border border-amber-500 text-2xl font-black text-white", children: "\u2212" }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-amber-400 text-xs font-black italic", children: "SPEED" }), _jsx("div", { className: "flex gap-0.5", children: Array.from({ length: 11 }, (_, i) => _jsx("div", { className: `w-3 h-3 rounded-sm ${0.5 + i * 0.25 <= speed ? "bg-gradient-to-t from-orange-600 to-yellow-300" : "bg-gray-700"}` }, i)) })] }), _jsxs("div", { className: "text-white font-black italic w-12", children: [speed.toFixed(1), "x"] }), _jsx("button", { onClick: () => setSpeed((s) => Math.min(3, +(s + 0.25).toFixed(2))), className: "w-10 h-10 rounded-lg bg-black border border-amber-500 text-2xl font-black text-white", children: "+" })] }), _jsx("div", { className: "flex flex-wrap justify-center gap-2 max-w-[440px]", children: THEMES.map((t, i) => (_jsxs("button", { onClick: () => setTheme(i), className: `px-3 py-1.5 rounded-xl text-xs font-black uppercase border-2 transition ${i === theme ? "scale-105 text-white" : "text-white/70 border-white/10"}`, style: i === theme ? { borderColor: t.accent, boxShadow: `0 0 14px ${t.accent}`, background: `linear-gradient(${t.sky[1]},${t.sky[0]})` } : { background: "#111" }, children: [t.icon, " ", t.name] }, t.id))) })] }));
}
