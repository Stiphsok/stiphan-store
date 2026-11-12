import { useEffect, useRef, useState, useCallback } from "react";

const Box = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => (
  <div className="mx-auto w-full max-w-[420px] rounded-2xl p-4 bg-gradient-to-b from-[#1a1030] to-[#0a0612] border-2 border-amber-500/40 shadow-[0_0_40px_rgba(255,170,0,.2)]">
    <div className="flex justify-between items-center mb-3"><h3 className="text-xl font-black bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">{title}</h3><span className="text-sm text-white/80 font-bold">{sub}</span></div>
    {children}
  </div>
);
const Btn = (p: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...p} className={"px-4 py-2 rounded-xl bg-gradient-to-b from-amber-400 to-orange-600 text-black font-black " + (p.className || "")} />;

/* ---------- 2048 ---------- */
export function G2048() {
  const fresh = () => add(add(Array(16).fill(0)));
  function add(b: number[]) { const e = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0); if (e.length) b[e[Math.floor(Math.random() * e.length)]] = Math.random() < .9 ? 2 : 4; return b; }
  const canMove = (tiles: number[]) => tiles.includes(0) || tiles.some((value, i) => (i % 4 < 3 && value === tiles[i + 1]) || (i < 12 && value === tiles[i + 4]));
  const [b, setB] = useState<number[]>(fresh); const [score, setScore] = useState(0); const [won, setWon] = useState(false); const [gameOver, setGameOver] = useState(false);
  const move = useCallback((dir: number) => {
    if (gameOver) return;
    const n = [...b]; let moved = false, gain = 0;
    for (let k = 0; k < 4; k++) {
      const idx = [0, 1, 2, 3].map((j) => dir === 0 ? j * 4 + k : dir === 1 ? (3 - j) * 4 + k : dir === 2 ? k * 4 + j : k * 4 + 3 - j);
      const vals = idx.map((i) => n[i]).filter(Boolean), out: number[] = [];
      for (let j = 0; j < vals.length; j++) { if (vals[j] === vals[j + 1]) { out.push(vals[j] * 2); gain += vals[j] * 2; j++; } else out.push(vals[j]); }
      while (out.length < 4) out.push(0);
      idx.forEach((i, j) => { if (n[i] !== out[j]) moved = true; n[i] = out[j]; });
    }
    if (!moved) return;
    const next = add(n);
    setB(next); setScore((current) => current + gain);
    if (!won && next.includes(2048)) setWon(true);
    if (!canMove(next)) setGameOver(true);
  }, [b, gameOver, won]);
  useEffect(() => { const h = (e: KeyboardEvent) => { const m: Record<string, number> = { ArrowUp: 0, ArrowDown: 1, ArrowLeft: 2, ArrowRight: 3 }; if (e.key in m) { e.preventDefault(); move(m[e.key]); } }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [move]);
  const st = useRef({ x: 0, y: 0 });
  const col = (v: number) => ({ 0: "#ffffff0d", 2: "#3b82f6", 4: "#06b6d4", 8: "#10b981", 16: "#84cc16", 32: "#eab308", 64: "#f97316", 128: "#ef4444", 256: "#ec4899", 512: "#a855f7", 1024: "#8b5cf6", 2048: "#fbbf24" } as Record<number, string>)[v] || "#fff";
  return <Box title="2048 FUSION" sub={gameOver ? `Game over · ${score}` : won ? `2048 reached · ${score}` : `Score ${score}`}>
    <div className="grid grid-cols-4 gap-2 p-2 bg-black/50 rounded-xl touch-none" onPointerDown={(e) => (st.current = { x: e.clientX, y: e.clientY })} onPointerUp={(e) => { const dx = e.clientX - st.current.x, dy = e.clientY - st.current.y; if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return; move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 2) : dy > 0 ? 1 : 0); }}>
      {b.map((v, i) => <div key={i} className="aspect-square rounded-lg flex items-center justify-center font-black text-white text-2xl transition-all" style={{ background: col(v), boxShadow: v ? `0 0 16px ${col(v)}` : "" }}>{v || ""}</div>)}
    </div>
    {won && <p className="mt-3 text-center text-sm font-bold text-amber-300">You reached 2048. Keep playing or start a new board.</p>}
    {gameOver && <p className="mt-3 text-center text-sm font-bold text-rose-300">No more moves are available.</p>}
    <div className="flex justify-between mt-3 items-center"><span className="text-white/60 text-xs">Swipe or arrows</span><Btn onClick={() => { setB(fresh()); setScore(0); setWon(false); setGameOver(false); }}>New game</Btn></div>
  </Box>;
}

/* ---------- MEMORY ---------- */
export function Memory() {
  const E = ["🍓", "⚽", "🚀", "👑", "🔥", "💎", "🎮", "🌙"];
  const deal = () => [...E, ...E].sort(() => Math.random() - .5).map((e, i) => ({ e, id: i, open: false, done: false }));
  const [c, setC] = useState(deal); const [sel, setSel] = useState<number[]>([]); const [moves, setMoves] = useState(0);
  const flip = (i: number) => {
    if (sel.length === 2 || c[i].open || c[i].done) return;
    const n = c.map((x, k) => (k === i ? { ...x, open: true } : x)); setC(n); const s = [...sel, i]; setSel(s);
    if (s.length === 2) { setMoves((m) => m + 1); setTimeout(() => { setC((cc) => cc.map((x, k) => s.includes(k) ? (cc[s[0]].e === cc[s[1]].e ? { ...x, done: true } : { ...x, open: false }) : x)); setSel([]); }, 650); }
  };
  const win = c.every((x) => x.done);
  return <Box title="MEMORY MATCH" sub={`Moves ${moves}`}>
    <div className="grid grid-cols-4 gap-2">{c.map((x, i) => <button key={x.id} onClick={() => flip(i)} className={`aspect-square rounded-xl text-3xl transition-all duration-300 ${x.open || x.done ? "bg-gradient-to-br from-indigo-500 to-fuchsia-600 rotate-0" : "bg-gradient-to-br from-amber-500 to-orange-700 hover:scale-105"} ${x.done ? "opacity-60" : ""}`}>{x.open || x.done ? x.e : "S"}</button>)}</div>
    {win && <div className="text-center mt-3 text-amber-300 font-black">🏆 Solved in {moves} moves!</div>}
    <div className="text-right mt-3"><Btn onClick={() => { setC(deal()); setMoves(0); setSel([]); }}>Shuffle</Btn></div>
  </Box>;
}

/* ---------- MINESWEEPER ---------- */
export function Mines() {
  const N = 9, M = 10;
  const gen = () => { const m = Array(N * N).fill(false); let k = 0; while (k < M) { const r = Math.floor(Math.random() * N * N); if (!m[r]) { m[r] = true; k++; } } return m; };
  const [mines, setMines] = useState(gen); const [open, setOpen] = useState<boolean[]>(Array(N * N).fill(false)); const [flag, setFlag] = useState<boolean[]>(Array(N * N).fill(false)); const [st, setSt] = useState(0); const [flagMode, setFM] = useState(false); const [started, setStarted] = useState(false);
  const nb = (i: number) => { const x = i % N, y = Math.floor(i / N), r: number[] = []; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const a = x + dx, b = y + dy; if ((dx || dy) && a >= 0 && b >= 0 && a < N && b < N) r.push(b * N + a); } return r; };
  const cnt = (i: number, field = mines) => nb(i).filter((j) => field[j]).length;
  const click = (i: number, f = false) => {
    if (st) return;
    if (f || flagMode) { const n = [...flag]; n[i] = !n[i]; setFlag(n); return; }
    if (flag[i]) return;
    const field = [...mines];
    if (!started && field[i]) { field[i] = false; const replacement = field.findIndex((mine, index) => !mine && index !== i); field[replacement] = true; setMines(field); }
    setStarted(true);
    const o = [...open], q = [i]; while (q.length) { const j = q.pop()!; if (o[j]) continue; o[j] = true; if (!cnt(j, field)) q.push(...nb(j)); }
    setOpen(o); if (o.filter((v, k) => !v && !field[k]).length === 0) setSt(1);
  };
  const colors = ["", "#40c4ff", "#76ff03", "#ff5252", "#e040fb", "#ffab40", "#18ffff", "#fff", "#fff"];
  return <Box title="MINE SWEEP" sub={st === 1 ? "You win" : st === 2 ? "Mine hit" : `${M - flag.filter(Boolean).length} mines left`}>
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${N},1fr)` }}>
      {mines.map((m, i) => <button key={i} onClick={() => click(i)} onContextMenu={(e) => { e.preventDefault(); click(i, true); }} className={`aspect-square rounded-md font-black text-lg ${open[i] ? (m ? "bg-red-600" : "bg-black/60") : "bg-gradient-to-br from-slate-500 to-slate-700 hover:brightness-125"}`} style={{ color: colors[cnt(i)] }}>
        {open[i] ? (m ? "✹" : cnt(i) || "") : flag[i] ? "F" : ""}</button>)}
    </div>
    {st === 1 && <p className="mt-3 text-center font-bold text-emerald-300">Every safe cell is clear.</p>}
    <div className="flex justify-between mt-3"><Btn className={flagMode ? "" : "opacity-50"} onClick={() => setFM(!flagMode)}>Flag {flagMode ? "ON" : "OFF"}</Btn><Btn onClick={() => { setMines(gen()); setOpen(Array(N * N).fill(false)); setFlag(Array(N * N).fill(false)); setSt(0); setFM(false); setStarted(false); }}>New game</Btn></div>
  </Box>;
}

/* ---------- CONNECT FOUR ---------- */
export function Connect4() {
  const R = 6, C = 7; const [b, setB] = useState<number[]>(Array(R * C).fill(0)); const [win, setWin] = useState(0);
  const check = (g: number[]) => { const d = [[1, 0], [0, 1], [1, 1], [1, -1]]; for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) { const p = g[y * C + x]; if (!p) continue; for (const [dx, dy] of d) { let k = 1; while (k < 4) { const a = x + dx * k, c = y + dy * k; if (a < 0 || c < 0 || a >= C || c >= R || g[c * C + a] !== p) break; k++; } if (k === 4) return p; } } return 0; };
  const drop = (g: number[], x: number, p: number) => { for (let y = R - 1; y >= 0; y--) if (!g[y * C + x]) { const n = [...g]; n[y * C + x] = p; return n; } return null; };
  const ai = (g: number[]) => { const cols = [3, 2, 4, 1, 5, 0, 6].filter((x) => !g[x]); for (const p of [2, 1]) for (const x of cols) { const n = drop(g, x, p); if (n && check(n) === p) return x; } const safe = cols.filter((x) => { const n = drop(g, x, 2)!; return !cols.some((y) => { const m = drop(n, y, 1); return m && check(m) === 1; }); }); const pool = safe.length ? safe : cols; return pool[Math.random() < .6 ? 0 : Math.floor(Math.random() * pool.length)]; };
  const play = (x: number) => {
    if (win) return;
    const n = drop(b, x, 1); if (!n) return;
    const playerResult = check(n);
    if (playerResult) { setB(n); setWin(playerResult); return; }
    const column = ai(n);
    if (column === undefined) { setB(n); setWin(3); return; }
    const next = drop(n, column, 2);
    if (!next) { setB(n); setWin(3); return; }
    setB(next);
    setWin(check(next) || (next.every(Boolean) ? 3 : 0));
  };
  return <Box title="CONNECT FOUR" sub={win === 1 ? "You win" : win === 2 ? "AI wins" : win === 3 ? "Draw" : "Your turn"}>
    <div className="grid gap-1.5 p-2 bg-blue-800 rounded-xl" style={{ gridTemplateColumns: `repeat(${C},1fr)` }}>
      {b.map((v, i) => <button key={i} aria-label={`Drop in column ${i % C + 1}`} disabled={Boolean(win)} onClick={() => play(i % C)} className="aspect-square rounded-full disabled:cursor-default" style={{ background: v === 1 ? "radial-gradient(#ff8a80,#d50000)" : v === 2 ? "radial-gradient(#fff59d,#fbc02d)" : "#0a0f2a", boxShadow: "inset 0 3px 6px #0008" }} />)}
    </div>
    <div className="text-right mt-3"><Btn onClick={() => { setB(Array(R * C).fill(0)); setWin(0); }}>New</Btn></div>
  </Box>;
}

/* ---------- TIC TAC TOE (unbeatable) ---------- */
export function TicTac() {
  const L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const w = (b: string[]) => { for (const [a, c, d] of L) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]; return b.every(Boolean) ? "D" : ""; };
  const mm = (b: string[], p: string): [number, number] => { const r = w(b); if (r === "O") return [1, -1]; if (r === "X") return [-1, -1]; if (r === "D") return [0, -1]; let best: [number, number] = [p === "O" ? -2 : 2, -1]; b.forEach((v, i) => { if (v) return; const n = [...b]; n[i] = p; const [s] = mm(n, p === "O" ? "X" : "O"); if (p === "O" ? s > best[0] : s < best[0]) best = [s, i]; }); return best; };
  const [b, setB] = useState<string[]>(Array(9).fill("")); const r = w(b);
  const play = (i: number) => { if (b[i] || r) return; const n = [...b]; n[i] = "X"; if (!w(n)) { const [, m] = mm(n, "O"); if (m >= 0) n[m] = "O"; } setB(n); };
  return <Box title="TIC TAC PRO" sub={r === "X" ? "🏆 You win" : r === "O" ? "🤖 AI wins" : r === "D" ? "🤝 Draw" : "You: X"}>
    <div className="grid grid-cols-3 gap-2">{b.map((v, i) => <button key={i} onClick={() => play(i)} className="aspect-square rounded-xl bg-black/50 border border-white/10 text-6xl font-black" style={{ color: v === "X" ? "#00e5ff" : "#ff4081", textShadow: `0 0 20px currentColor` }}>{v}</button>)}</div>
    <div className="text-right mt-3"><Btn onClick={() => setB(Array(9).fill(""))}>New</Btn></div>
  </Box>;
}

/* ---------- SIMON ---------- */
export function Simon() {
  const cols = ["#ff1744", "#00e676", "#2979ff", "#ffea00"];
  const [seq, setSeq] = useState<number[]>([]); const [lit, setLit] = useState(-1); const [pos, setPos] = useState(0); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("Press Start");
  const ac = useRef<AudioContext | null>(null);
  const beep = (k: number) => { try { ac.current ||= new AudioContext(); const o = ac.current.createOscillator(), g = ac.current.createGain(); o.frequency.value = [330, 392, 494, 587][k]; g.gain.value = .1; o.connect(g).connect(ac.current.destination); o.start(); o.stop(ac.current.currentTime + .25); } catch { /* */ } };
  const show = async (s: number[]) => { setBusy(true); for (const k of s) { await new Promise((r) => setTimeout(r, 250)); setLit(k); beep(k); await new Promise((r) => setTimeout(r, 450)); setLit(-1); } setBusy(false); setPos(0); };
  const next = (s: number[]) => { const n = [...s, Math.floor(Math.random() * 4)]; setSeq(n); setMsg(`Level ${n.length}`); show(n); };
  const press = (k: number) => { if (busy || !seq.length) return; beep(k); setLit(k); setTimeout(() => setLit(-1), 180); if (seq[pos] !== k) { setMsg(`❌ Game over — level ${seq.length}`); setSeq([]); return; } if (pos + 1 === seq.length) setTimeout(() => next(seq), 500); else setPos(pos + 1); };
  return <Box title="SIMON GLOW" sub={msg}>
    <div className="grid grid-cols-2 gap-3 aspect-square">{cols.map((c, k) => <button key={k} onClick={() => press(k)} className="rounded-3xl transition-all" style={{ background: c, opacity: lit === k ? 1 : .35, boxShadow: lit === k ? `0 0 50px ${c}` : "none", transform: lit === k ? "scale(1.03)" : "" }} />)}</div>
    <div className="text-right mt-3"><Btn onClick={() => next([])}>Start</Btn></div>
  </Box>;
}

/* ---------- WHACK-A-MOLE ---------- */
export function Whack() {
  const [holes, setHoles] = useState<number[]>(Array(9).fill(0)); const [score, setScore] = useState(0); const [time, setTime] = useState(0); const [hit, setHit] = useState(-1);
  useEffect(() => { if (time <= 0) return; const t = setInterval(() => setTime((x) => x - 1), 1000); const m = setInterval(() => setHoles(() => { const h = Array(9).fill(0); h[Math.floor(Math.random() * 9)] = Math.random() < .15 ? 2 : 1; if (Math.random() < .4) h[Math.floor(Math.random() * 9)] = 1; return h; }), Math.max(450, 900 - score * 8)); return () => { clearInterval(t); clearInterval(m); }; }, [time > 0, score]);
  const whack = (i: number) => { if (!holes[i] || time <= 0) return; setScore((s) => s + (holes[i] === 2 ? -20 : 10)); setHit(i); setTimeout(() => setHit(-1), 150); const h = [...holes]; h[i] = 0; setHoles(h); };
  return <Box title="WHACK ATTACK" sub={`⏱ ${time}s • ${score}`}>
    <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-gradient-to-b from-green-700 to-green-900">
      {holes.map((h, i) => <button key={i} onClick={() => whack(i)} className="aspect-square rounded-full bg-[radial-gradient(#3e2723,#1b0f0a)] text-5xl flex items-center justify-center overflow-hidden" style={{ boxShadow: "inset 0 8px 12px #000" }}>
        <span className={`transition-transform duration-150 ${h ? "translate-y-0" : "translate-y-16"} ${hit === i ? "scale-75" : ""}`}>{h === 2 ? "💣" : "🐹"}</span></button>)}
    </div>
    <div className="flex justify-between mt-3 items-center"><span className="text-white/60 text-xs">Avoid bombs!</span><Btn onClick={() => { setScore(0); setTime(30); }}>{time > 0 ? "Playing…" : "Start 30s"}</Btn></div>
  </Box>;
}
