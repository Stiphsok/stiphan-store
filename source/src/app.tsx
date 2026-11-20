import { ComponentType, FormEvent, useEffect, useMemo, useState } from "react";
import BrickFire from "./games/brickfire";
import OriginalBrickFire from "./games/original-brick-fire";
import { Invaders, Racing, Snake, Tetris, Flappy, Pong, Asteroids, Jumper } from "./games/arcade";
import { G2048, Memory, Mines, Connect4, TicTac, Simon, Whack } from "./games/puzzle";
import EmbeddedStoreGame, { isEmbeddedGameId } from "./games/embedded-store-game";
import {
  arenaBucketName,
  getSupabaseSession,
  getSupabaseStatusText,
  isCurrentUserStoreAdmin,
  signInToAdmin,
  signOutAdmin,
  supabaseConfigured,
  uploadArenaPackage,
  validateArenaUpload,
} from "./lib/supabase";
import {
  deleteCatalogApp,
  deleteCatalogGame,
  deleteCatalogStorageFile,
  deleteCatalogTheme,
  fetchStoreCatalog,
  hideCatalogItem,
  saveCatalogApp,
  saveCatalogGame,
  saveCatalogTheme,
  showCatalogItem,
  type CatalogKind,
} from "./lib/supabase-catalog";

type BuiltinGame = { id: string; name: string; cat: string; icon: string; grad: string; rating: number; C?: ComponentType; desc: string; instructions?: string; image?: string; gameUrl?: string; featured?: boolean };
type StoreGame = Omit<BuiltinGame, "C"> & { C?: ComponentType; externalUrl?: string; sourceHtml?: string; sourceNote?: string };
type StoreApp = { id: string; name: string; cat: string; icon: string; grad: string; rating: number; image?: string; externalUrl?: string; downloadUrl?: string; description: string; featured?: boolean; fileName?: string; fileType?: string; fileSize?: number; storageBucket?: string; storagePath?: string };
type StoreTheme = { id: string; name: string; icon: string; bg: string; price: number; description: string; image?: string; featured?: boolean };
type AdConfig = { enabled: boolean; provider: "demo" | "adsense"; publisherId: string; slotId: string; bannerText: string };

const BUILTIN_GAMES: BuiltinGame[] = [
  { id: "brick", name: "STIPHAN Brick Fire", cat: "Arcade • Action", icon: "BF", grad: "from-orange-500 via-amber-600 to-slate-950", rating: 0, C: BrickFire, featured: true, image: "/game-covers/brick.jpg", desc: "Play the original STIPHAN Brick Fire: break themed brick formations, advance through levels, and earn virtual in-game coins.", instructions: "Choose a language and start. Drag or touch anywhere on the game area to move the paddle. Use the on-screen speed, pause, and shop controls." },
  { id: "troll-platformer", name: "STIPHAN: Die Again", cat: "Arcade • Platformer", icon: "DA", grad: "from-orange-500 via-amber-400 to-red-900", rating: 0, gameUrl: "/games/stiphan-troll-platformer/index.html", image: "/game-covers/troll-platformer.jpg", desc: "Take on 200 tricky platform levels with hidden traps, touch controls, and Moroccan Darija humor.", instructions: "Use the on-screen left, right, and jump controls. Watch for hidden spikes, collapsing floors, and other surprises." },
  { id: "puzzle", name: "STIPHAN Puzzle", cat: "Puzzle • Classic", icon: "SP", grad: "from-cyan-500 via-blue-600 to-indigo-900", rating: 0, gameUrl: "/games/stiphan-puzzle/index.html", image: "/game-covers/puzzle.jpg", desc: "Solve a customizable sliding-tile puzzle with Moroccan art, themes, hints, and multiple board sizes.", instructions: "Move a tile next to the empty space to rebuild the picture. Use hints and the game controls to customize your puzzle." },
  { id: "millionaire", name: "Millionaire Challenge", cat: "Quiz • Trivia", icon: "MC", grad: "from-indigo-600 via-violet-700 to-amber-500", rating: 0, gameUrl: "/games/millionaire-challenge/index.html", image: "/game-covers/millionaire.jpg", desc: "Answer progressively harder trivia questions, use lifelines, and see how far up the prize ladder you can climb.", instructions: "Choose the correct answer to advance. Use lifelines when you need help, or walk away to keep your current prize." },
  { id: "racing", name: "Racing Legends", cat: "Racing • Sports", icon: "RL", grad: "from-red-600 via-orange-500 to-slate-950", rating: 0, C: Racing, image: "/game-covers/racing.jpg", desc: "Drive a top-down 2D endless highway, weave between traffic, manage your speed, and build a distance score.", instructions: "Steer with left/right arrows or tap either side of the road. Hold a touch to steer. Hold Up to accelerate and Down to brake. Avoid traffic; tap or press Space to start or restart." },
  { id: "invaders", name: "Galaxy Invaders", cat: "Action • Shooter", icon: "GI", grad: "from-fuchsia-600 via-purple-700 to-indigo-900", rating: 0, C: Invaders, image: "/game-covers/invaders.jpg", desc: "Move across the screen while automatic fire clears alien formations. Each new wave moves faster and presses closer.", instructions: "Move with left/right arrows or drag across the screen. Your ship fires automatically. Tap or press Space to start or restart." },
  { id: "asteroids", name: "Asteroid Storm", cat: "Action • Space", icon: "AS", grad: "from-amber-500 via-rose-700 to-slate-900", rating: 0, C: Asteroids, image: "/game-covers/asteroids.jpg", desc: "Pilot through an asteroid field, fire at incoming rocks, and survive as the field grows more dangerous.", instructions: "Use the arrow keys to steer. Hold the mouse or touch the screen to aim and fire. Tap or press Space to start or restart." },
  { id: "tetris", name: "Tetris", cat: "Puzzle • Classic", icon: "TS", grad: "from-cyan-500 via-blue-600 to-violet-800", rating: 0, C: Tetris, image: "/game-covers/tetris.jpg", desc: "Fit falling shapes together, clear complete rows, and keep the stack below the top of the board.", instructions: "Use left/right arrows to move, Up to rotate, Down to fall faster, and Space for a hard drop. On touch, tap the sides to move, the middle to rotate, and the bottom to drop." },
  { id: "snake", name: "Snake", cat: "Arcade • Classic", icon: "SN", grad: "from-emerald-400 via-teal-600 to-slate-900", rating: 0, C: Snake, image: "/game-covers/snake.jpg", desc: "Guide a growing neon snake to collect food. Each pickup adds points and makes tight turns more challenging.", instructions: "Use the arrow keys or tap in the direction you want to turn. Avoid the edges and your own tail. Tap or press Space to start or restart." },
  { id: "flappy", name: "Flappy Wings", cat: "Casual • Arcade", icon: "FW", grad: "from-sky-400 via-cyan-500 to-lime-400", rating: 0, C: Flappy, image: "/game-covers/flappy.jpg", desc: "Time each flap to pass through the gaps between moving pipes. A collision ends the run.", instructions: "Tap, click, press Space, or press Up to flap. Tap after a crash to start another run." },
  { id: "jumper", name: "Sky Jumper", cat: "Casual • Platform", icon: "SJ", grad: "from-indigo-700 via-purple-500 to-orange-400", rating: 0, C: Jumper, image: "/game-covers/jumper.jpg", desc: "Bounce from platform to platform, steer in mid-air, and climb for a longer run.", instructions: "Use left/right arrows or move the pointer to steer. Land on platforms to keep climbing. Tap or press Space to begin or restart." },
  { id: "pong", name: "Neon Pong", cat: "Sports • Arcade", icon: "NP", grad: "from-pink-500 via-purple-700 to-cyan-500", rating: 0, C: Pong, image: "/game-covers/pong.jpg", desc: "Keep the ball in play against a computer-controlled paddle and score points in a neon arena.", instructions: "Move your paddle with the pointer or left/right arrows. Tap or press Space to start or restart." },
  { id: "2048", name: "2048", cat: "Puzzle • Brain", icon: "2048", grad: "from-yellow-400 via-orange-500 to-pink-600", rating: 0, C: G2048, image: "/game-covers/2048.jpg", desc: "Slide equal-numbered tiles together to combine them. Plan each move carefully as the board fills.", instructions: "Swipe in any direction or use the arrow keys. Combine tiles to reach 2048; use New to reset the board." },
  { id: "memory", name: "Memory Match", cat: "Puzzle • Brain", icon: "MM", grad: "from-violet-500 via-fuchsia-600 to-rose-500", rating: 0, C: Memory, image: "/game-covers/memory.jpg", desc: "Turn over two cards at a time and remember their positions to clear every matching pair.", instructions: "Tap two cards to reveal them. Matching pairs stay open; mismatches turn back over. Use Shuffle for a new board." },
  { id: "mines", name: "Mine Sweep", cat: "Puzzle • Strategy", icon: "MS", grad: "from-slate-500 via-slate-700 to-red-900", rating: 0, C: Mines, image: "/game-covers/mines.jpg", desc: "Reveal safe cells, use adjacent-number clues to locate hidden mines, and flag suspected hazards.", instructions: "Tap a cell to reveal it. Use Flag mode or right-click to mark a mine. Your first revealed cell is safe; use New to reset." },
  { id: "connect", name: "Connect Four", cat: "Board • Strategy", icon: "C4", grad: "from-blue-600 via-blue-800 to-yellow-500", rating: 0, C: Connect4, image: "/game-covers/connect.jpg", desc: "Take turns dropping discs into a vertical board. Connect four in a row before the computer opponent.", instructions: "Tap a column to drop a disc. The computer responds after your move. Use New to start again." },
  { id: "tictac", name: "Tic Tac Pro", cat: "Board • Strategy", icon: "TT", grad: "from-cyan-400 via-slate-800 to-pink-500", rating: 0, C: TicTac, image: "/game-covers/tictac.jpg", desc: "Play noughts and crosses against an opponent that searches for the strongest available move.", instructions: "Tap an empty square to place X. The computer plays O. Use New to reset the board." },
  { id: "simon", name: "Simon Glow", cat: "Casual • Memory", icon: "SG", grad: "from-red-500 via-green-500 to-blue-600", rating: 0, C: Simon, image: "/game-covers/simon.jpg", desc: "Watch a growing sequence of colored lights and repeat it in the same order.", instructions: "Press Start, watch the lights, then tap them in the same order. A wrong tap ends the sequence." },
  { id: "whack", name: "Whack Attack", cat: "Casual • Reflex", icon: "WA", grad: "from-green-500 via-lime-600 to-amber-700", rating: 0, C: Whack, desc: "React quickly to targets before they disappear. Avoid bombs and build your score before time runs out.", instructions: "Press Start 30s and tap the targets. Avoid bombs, which subtract points." },
];

const DEFAULT_APPS: StoreApp[] = [
  { id: "brick-fire-android", name: "STIPHAN Brick Fire", cat: "Android • APK", icon: "BF", grad: "from-orange-500 to-amber-700", rating: 0, downloadUrl: "/downloads/stiphan-brick-fire-1.0.apk", description: "Android package for STIPHAN Brick Fire. The web edition can also be played directly in this store.", featured: true },
  { id: "stiphantube", name: "Stiphantube", cat: "Android • APK", icon: "ST", grad: "from-red-500 to-orange-600", rating: 0, downloadUrl: "/downloads/stiphantube.apk", description: "Android package provided with this project. Check device compatibility before installing.", featured: true },
];

const THEME_SEEDS = [
  ["Neon Cyber", "▣", "#00e5ff,#7c4dff,#0a0020"], ["Ocean Dream", "≈", "#18ffff,#0277bd,#001a33"], ["Dark Knight", "◆", "#455a64,#1a1a2e,#000"], ["Anime World", "✦", "#ff80ab,#7c4dff,#1a0033"],
  ["Nature Forest", "♣", "#76ff03,#1b5e20,#0a1a0a"], ["Galaxy Space", "✧", "#e040fb,#311b92,#000010"], ["Sunset Valley", "◒", "#ffab40,#d81b60,#1a0033"], ["Winter Snow", "❄", "#e1f5fe,#4fc3f7,#01579b"],
  ["Golden Royal", "S", "#ffd54f,#ff8f00,#3e2723"], ["Cherry Blossom", "✿", "#fce4ec,#f06292,#4a0024"], ["Volcano Rage", "△", "#ffea00,#dd2c00,#1a0000"], ["Aurora Borealis", "✧", "#69f0ae,#00b0ff,#0a0a2a"],
  ["Matrix Code", "01", "#00e676,#1b5e20,#000"], ["Candy Land", "●", "#ff80ab,#ea80fc,#80d8ff"], ["Samurai Dusk", "╱", "#ff5252,#4a148c,#0a0010"], ["Retro Arcade", "▦", "#ff4081,#ffea00,#1a0033"],
  ["Desert Mirage", "◇", "#ffe0b2,#ff9800,#4e2600"], ["Crystal Cave", "◇", "#b388ff,#18ffff,#0a0033"], ["Thunder Storm", "ϟ", "#fff176,#455a64,#0a0a14"], ["Emerald City", "S", "#b9f6ca,#00c853,#002010"],
  ["Cyber Tokyo", "⌁", "#ff1744,#00e5ff,#050014"], ["Lunar Eclipse", "●", "#ff7043,#311b92,#030009"], ["Steel Factory", "▦", "#cfd8dc,#607d8b,#101418"], ["Firestorm", "ϟ", "#ff8f00,#e53935,#160000"],
  ["Deep Space", "✦", "#2979ff,#651fff,#02040f"], ["Electric Blue", "ϟ", "#00b0ff,#2962ff,#020b24"], ["Ruby Night", "◆", "#ff1744,#880e4f,#080008"], ["Jade Temple", "◇", "#69f0ae,#00695c,#001510"],
  ["Cloud City", "☁", "#ffffff,#90caf9,#17233d"], ["Midnight Gold", "S", "#ffd740,#5d4037,#050505"], ["Neon Grid", "▦", "#00e676,#00b8d4,#02040b"], ["Cosmic Purple", "✧", "#d500f9,#7c4dff,#090014"],
];
const DEFAULT_THEMES: StoreTheme[] = THEME_SEEDS.map(([name, icon, colors], index) => ({ id: `theme-${index + 1}`, name, icon, bg: `linear-gradient(145deg,${colors})`, price: index < 4 ? 0 : 150 + (index % 5) * 100, description: `Cinematic ${name} theme for the STIPHAN ecosystem.`, featured: index < 8 }));

const NAV = [["home", "⌂", "Home"], ["games", "▣", "Games"], ["apps", "▤", "Apps"], ["themes", "✦", "Themes (30+)"], ["shop", "◈", "Shop"], ["coins", "S", "STIPHAN Coins"], ["favs", "♥", "Favorites"], ["profile", "●", "Profile"], ["admin", "⚙", "Admin"]] as const;
const MOBILE_NAV = NAV.filter(([id]) => ["home", "games", "apps", "themes", "shop"].includes(id));
const MOBILE_MORE_NAV = NAV.filter(([id]) => ["coins", "favs", "profile"].includes(id));

function StoreBrand() {
  return (
    <div className="store-brand-lockup" aria-label="STIPHAN STORE">
      <span className="store-brand-mark" aria-hidden="true">
        <img src="/stiphan-store-logo.jpg" alt="" />
      </span>
      <span className="store-brand-type">
        <span>STIPHAN</span>
        <span className="store-brand-subtitle">STORE</span>
      </span>
    </div>
  );
}

function CategoryGlyph({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    games: <><path d="M15 19h18c4 0 6 3 7 7l2 9c.7 3-2.7 5-5 3l-6-5H17l-6 5c-2.5 2-5.7 0-5-3l2-9c1-4 3-7 7-7Z" /><path d="M16 24v8m-4-4h8m12-2h.1m4 5h.1" /></>,
    apps: <><rect x="7" y="7" width="13" height="13" rx="3" /><rect x="28" y="7" width="13" height="13" rx="3" /><rect x="7" y="28" width="13" height="13" rx="3" /><rect x="28" y="28" width="13" height="13" rx="3" /></>,
    themes: <><path d="M24 5C13.5 5 5 12.5 5 22c0 8 6.5 14 14 14h3c2.4 0 3.7-2.4 2.4-4.4l-1.5-2.2c-.9-1.4.1-3.4 1.8-3.4h3.8c5.1 0 8.5-3.7 8.5-8.3C37 10.7 31.3 5 24 5Z" /><circle cx="14" cy="19" r="1.5" /><circle cx="21" cy="13" r="1.5" /><circle cx="29" cy="16" r="1.5" /></>,
    shop: <><path d="M7 9h4l3.5 21h19l4-15H12" /><circle cx="18" cy="37" r="2.5" /><circle cx="32" cy="37" r="2.5" /></>,
    favs: <path d="M24 40 8.7 25.2C.7 16.7 13 5 24 16c11-11 23.3.7 15.3 9.2L24 40Z" />,
  };
  return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">{paths[name] || paths.games}</svg>;
}

const STIPHAN_GAMES = [
  { id: "dama", name: "Stiphan Dama", action: "Coming Soon", note: "Board classic", image: "/category-dama.png" },
  { id: "xo", name: "STIPHAN X&O", action: "Coming Soon", note: "Think & win", image: "/category-xo.png" },
  { id: "mafia", name: "STIPHAN MAFIA", action: "Coming Soon", note: "Mystery & strategy", image: "/category-mafia.png" },
  { id: "mystery", name: "STIPHAN MYSTERY", action: "Coming Soon", note: "Discover the truth", image: "/category-mystery.png" },
] as const;

const EXTRA_STIPHAN_GAME_IDS = ["brick", "troll-platformer", "puzzle", "millionaire"] as const;


function fileSizeLabel(size = 0) {
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
function assetCategory(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext === "apk" ? "Android • APK" : ext === "zip" ? "Archive • ZIP" : "Upload • File";
}
function assetIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext === "apk" ? "APK" : ext === "zip" ? "ZIP" : "FILE";
}

type LegacyUploadedAsset = { id: string; name: string; type: string; size: number; blob: Blob; createdAt: number };
type LegacyUploadedApp = StoreApp & { fileId: string };
const LEGACY_FILE_DB = "stiph-store-assets";
const LEGACY_FILE_STORE = "files";

function isLegacyUploadedApp(value: unknown): value is LegacyUploadedApp {
  return Boolean(
    value &&
    typeof value === "object" &&
    "fileId" in value && typeof value.fileId === "string" && value.fileId.length > 0 &&
    "id" in value && typeof value.id === "string" &&
    "name" in value && typeof value.name === "string" &&
    "cat" in value && typeof value.cat === "string" &&
    "icon" in value && typeof value.icon === "string" &&
    "grad" in value && typeof value.grad === "string" &&
    "rating" in value && typeof value.rating === "number" &&
    "description" in value && typeof value.description === "string",
  );
}

function isLegacyUploadedAsset(value: unknown): value is LegacyUploadedAsset {
  return Boolean(
    value &&
    typeof value === "object" &&
    "id" in value && typeof value.id === "string" &&
    "name" in value && typeof value.name === "string" &&
    "type" in value && typeof value.type === "string" &&
    "size" in value && typeof value.size === "number" &&
    "blob" in value && value.blob instanceof Blob,
  );
}

function getLegacyUploadMetadata(): LegacyUploadedApp[] {
  const raw = localStorage.getItem("stiph_uploaded_apps");
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Previous local upload metadata is invalid.");
  if (!parsed.every(isLegacyUploadedApp)) {
    throw new Error("Previous local upload metadata contains an invalid entry.");
  }
  return parsed;
}

async function getLegacyUploadAsset(id: string): Promise<LegacyUploadedAsset | undefined> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(LEGACY_FILE_DB, 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  if (!db.objectStoreNames.contains(LEGACY_FILE_STORE)) {
    db.close();
    return undefined;
  }
  const asset = await new Promise<LegacyUploadedAsset | undefined>((resolve, reject) => {
    const request = db.transaction(LEGACY_FILE_STORE, "readonly").objectStore(LEGACY_FILE_STORE).get(id);
    request.onsuccess = () => resolve(isLegacyUploadedAsset(request.result) ? request.result : undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return asset;
}

async function deleteLegacyUploadAsset(id: string) {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(LEGACY_FILE_DB, 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  if (!db.objectStoreNames.contains(LEGACY_FILE_STORE)) {
    db.close();
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(LEGACY_FILE_STORE, "readwrite");
    transaction.objectStore(LEGACY_FILE_STORE).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

function useLS<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }, [key, value]);
  return [value, setValue] as const;
}

const H2 = ({ title, more, onMore }: { title: string; more?: string; onMore?: () => void }) => <div className="flex justify-between items-center mb-3 mt-7"><h2 className="text-lg md:text-xl font-black text-white border-l-4 border-amber-400 pl-3">{title}</h2>{more && <button onClick={onMore} className="text-sm text-white/60 hover:text-amber-300">{more} →</button>}</div>;

function imageOrFallback(image?: string, className = "") {
  return image ? <img src={image} alt="" className={`absolute inset-0 w-full h-full object-cover ${className}`} onError={(e) => { e.currentTarget.style.display = "none"; }} /> : null;
}

function GameArtwork({ game }: { game: StoreGame }) {
  const palettes: Record<string, [string, string, string]> = {
    brick: ["#170c15", "#ff542e", "#ffd166"],
    "troll-platformer": ["#17142c", "#ff7867", "#ffe17b"],
    puzzle: ["#082b3a", "#31d6c1", "#ffc857"],
    millionaire: ["#100d34", "#a855f7", "#ffd45c"],
    racing: ["#101923", "#ff654e", "#ffc857"],
    invaders: ["#100a2c", "#df7aff", "#5cf4ff"],
    asteroids: ["#180f22", "#ff8c56", "#ffd166"],
    tetris: ["#071b3a", "#35d9ed", "#b16bff"],
    snake: ["#06251f", "#48e69a", "#ff657d"],
    flappy: ["#12364b", "#6bd5ed", "#d9f36a"],
    jumper: ["#20104b", "#b86bff", "#ffd166"],
    pong: ["#160d38", "#ff61b8", "#50eaff"],
    "2048": ["#33200b", "#ff9d35", "#ffe17b"],
    memory: ["#26113b", "#e05cce", "#ffe19c"],
    mines: ["#111b2d", "#8ba6ca", "#ff6475"],
    connect: ["#102b58", "#69b9ff", "#ffd166"],
    tictac: ["#0b2538", "#55d9ff", "#ff85b4"],
    simon: ["#101326", "#4b8aff", "#ffdc4a"],
    whack: ["#16301f", "#91e26e", "#ffc36c"],
  };
  const [background, accent, highlight] = palettes[game.id] || ["#101827", "#8ab4ff", "#ffd166"];
  const art: Record<string, React.ReactNode> = {
    brick: <><g stroke="#fff" strokeOpacity=".65" strokeWidth="2"><path fill="#f45336" d="M25 25h34v20H25zM62 25h34v20H62zM99 25h34v20H99z" /><path fill="#ffb02e" d="M43 48h34v20H43zM80 48h34v20H80z" /><path fill="#d23f52" d="M25 71h34v20H25zM99 71h34v20H99z" /></g><circle cx="80" cy="79" r="9" fill="#fff0a7" stroke="#ff6c27" strokeWidth="5" /><path d="M50 104h60" stroke="#ffd166" strokeWidth="7" strokeLinecap="round" /><path d="m80 68 4-9" stroke="#fff8d2" strokeWidth="3" strokeLinecap="round" /></>,
    "troll-platformer": <><path d="M13 96h43l10-17h20l10 17h51" fill="#29243e" stroke="#a9a0c9" strokeWidth="3" strokeLinejoin="round" /><path d="m67 79 9-16 9 16m8 17 9-16 9 16" fill="#ff6b70" stroke="#ffd4aa" strokeWidth="2" strokeLinejoin="round" /><g stroke="#111" strokeWidth="3" strokeLinejoin="round"><path d="M53 45h28v29H53z" fill="#f7be55" /><path d="M56 42V31l8 7 6-7 8 8v7" fill="#e24f63" /><path d="M58 54h6v6h-6zm13 0h6v6h-6z" fill="#fff" /><path d="M60 74v12m15-12v12m-22-8h-8m37 0h8" strokeLinecap="round" /></g><path d="M116 36v40m0-39 17 7-17 8" stroke="#ffe17b" strokeWidth="3" strokeLinejoin="round" /></>,
    puzzle: <><g stroke="#fff" strokeOpacity=".65" strokeWidth="2"><rect x="28" y="20" width="36" height="36" rx="5" fill="#e5b553" /><rect x="67" y="20" width="36" height="36" rx="5" fill="#2b9c9b" /><rect x="106" y="20" width="27" height="36" rx="5" fill="#cf7556" /><rect x="28" y="59" width="36" height="36" rx="5" fill="#256983" /><rect x="67" y="59" width="36" height="36" rx="5" fill="#d9a64d" /><rect x="106" y="59" width="27" height="36" rx="5" fill="#233b5a" /></g><path d="M37 29h18v18H37zm39 0h18v18H76zm-39 39h18v18H37zm39 0h18v18H76z" fill="none" stroke="#fff4d1" strokeOpacity=".6" strokeWidth="2" /><circle cx="115" cy="77" r="8" fill="#f7d789" /><path d="m115 68 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#fff1bc" /></>,
    millionaire: <><path d="M18 96h124" stroke="#ffd45c" strokeOpacity=".65" strokeWidth="3" /><path d="M29 95V77h20v18m7 0V64h20v31m7 0V49h20v46m7 0V33h20v62" fill="#261b63" stroke="#a887ff" strokeWidth="2" /><g fill="#ffd45c" stroke="#fff0ac" strokeWidth="2"><path d="M68 26h25v8c0 11-5 17-12 17s-13-6-13-17z" /><path d="M68 31H57c0 10 5 15 13 15m23-15h11c0 10-5 15-13 15M81 51v9m-10 2h20" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></g><path d="M32 20 48 10m80 10-16-10" stroke="#fff0ac" strokeOpacity=".65" strokeWidth="3" /></>,
    racing: <><path d="M44 8 24 112m92-104 20 104" stroke="#ffdf91" strokeOpacity=".55" strokeWidth="4" /><path d="M80 8v17m0 14v17m0 14v17m0 14v17" stroke="#fff" strokeOpacity=".8" strokeWidth="4" /><g transform="translate(80 68) rotate(-13)" stroke="#fff" strokeWidth="2"><path d="M-19-24h38l7 17v34h-52V-7z" fill="#f08a2b" /><path d="M-13-18h26l5 13h-36z" fill="#182737" /><path d="M-13 5h26v12h-26z" fill="#ffd166" /><path d="M-24-11h7v13h-7zm41 0h7v13h-7z" fill="#0b1019" /></g><path d="m47 86 13-8m39 8 14-8" stroke="#ff674e" strokeWidth="4" strokeLinecap="round" /></>,
    invaders: <><g fill="#e1a7ff"><path d="M37 27h18v7h-5v7h-8v-7h-5zM71 20h18v7h-5v7h-8v-7h-5zM105 27h18v7h-5v7h-8v-7h-5z" /><circle cx="46" cy="31" r="2" fill="#130d2d" /><circle cx="80" cy="24" r="2" fill="#130d2d" /><circle cx="114" cy="31" r="2" fill="#130d2d" /></g><path d="m80 61 12 18H68z" fill="#5cf4ff" /><path d="M80 61v-15M64 89h32" stroke="#5cf4ff" strokeWidth="3" strokeLinecap="round" /></>,
    asteroids: <><path d="m42 21 15-8 12 8 4 14-10 12-18-2-8-12zM103 20l12 6 6 15-9 10-17-4-4-13zM79 63l17 4 8 14-9 14-18 2-10-12 3-15z" fill="#a9b5cb" stroke="#fff" strokeWidth="3" strokeLinejoin="round" /><path d="m47 23 10 5 4 8M104 25l9 8M80 69l7 7-2 12" stroke="#53627b" strokeWidth="3" strokeLinecap="round" /><path d="M27 67 34 61M126 68l7-7M78 14V8" stroke="#ffd166" strokeWidth="3" strokeLinecap="round" /></>,
    tetris: <><g stroke="#fff" strokeOpacity=".7" strokeWidth="2"><path fill="#31d8ec" d="M31 19h27v20H31zM58 19h27v20H58zM85 19h27v20H85zM112 19h27v20h-27z" /><path fill="#ffb83d" d="M58 40h27v20H58zM85 40h27v20H85zM112 40h27v20h-27z" /><path fill="#be68ff" d="M31 61h27v20H31zM58 61h27v20H58zM85 61h27v20H85z" /><path fill="#5ef09c" d="M112 61h27v20h-27zM112 82h27v20h-27z" /></g></>,
    snake: <><path d="M35 79c0-20 15-20 30-20h29c13 0 17-11 17-23" stroke="#65f1a2" strokeWidth="15" strokeLinecap="round" /><path d="M35 79c0-20 15-20 30-20h29c13 0 17-11 17-23" stroke="#d7ffe8" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" /><circle cx="111" cy="30" r="13" fill="#ff5c73" stroke="#ffe2a0" strokeWidth="3" /><circle cx="107" cy="27" r="3" fill="#fff" /><circle cx="46" cy="79" r="2.5" fill="#082119" /><circle cx="54" cy="79" r="2.5" fill="#082119" /></>,
    flappy: <><path d="M112 18h25v34h-25zM112 69h25v36h-25z" fill="#59d17f" stroke="#d5ff9f" strokeWidth="3" /><path d="M45 51c9-16 31-18 43-7l13 1-10 11c-8 15-27 21-43 11z" fill="#ffd15c" stroke="#fff2b0" strokeWidth="3" /><path d="m92 47 17 5-15 6z" fill="#ff794d" /><circle cx="77" cy="48" r="3" fill="#172334" /><path d="M57 56c10-9 19-9 27-4-8 1-14 6-17 13" fill="#ff9d49" /></>,
    jumper: <><path d="M23 91h50M77 67h55M38 43h55" stroke="#7cf6b2" strokeWidth="8" strokeLinecap="round" /><path d="m81 20 13 20H68z" fill="#ffd166" stroke="#fff0b0" strokeWidth="3" /><circle cx="81" cy="25" r="3" fill="#172334" /><path d="M76 40v10m10-10v10" stroke="#fff" strokeWidth="4" strokeLinecap="round" /></>,
    pong: <><path d="M37 22v31m86 17v31" stroke="#62f5ff" strokeWidth="10" strokeLinecap="round" /><path d="M80 17v86" stroke="#fff" strokeOpacity=".35" strokeWidth="2" strokeDasharray="5 7" /><circle cx="82" cy="58" r="10" fill="#fff" stroke="#8df9ff" strokeWidth="4" /><path d="M28 66h18m77-34h18" stroke="#ff6fae" strokeWidth="3" strokeLinecap="round" /></>,
    "2048": <><g stroke="#fff" strokeOpacity=".65" strokeWidth="2"><rect x="34" y="22" width="38" height="32" rx="6" fill="#2369ad" /><rect x="78" y="22" width="38" height="32" rx="6" fill="#0caa9c" /><rect x="56" y="60" width="38" height="32" rx="6" fill="#e68128" /><rect x="100" y="60" width="38" height="32" rx="6" fill="#f3bd3a" /></g><g fill="#fff" fontFamily="system-ui,sans-serif" fontWeight="900" fontSize="16" textAnchor="middle"><text x="53" y="44">2</text><text x="97" y="44">4</text><text x="75" y="82">8</text><text x="119" y="82">16</text></g></>,
    memory: <><rect x="35" y="22" width="36" height="53" rx="6" fill="#313c6f" stroke="#dcbcff" strokeWidth="3" /><rect x="85" y="29" width="38" height="54" rx="6" fill="#bb5aa8" stroke="#ffe0a6" strokeWidth="3" transform="rotate(9 85 29)" /><path d="m53 42 5 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1zM103 48h14m-7-7v14" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></>,
    mines: <><g fill="#32415d" stroke="#b9c9e6" strokeWidth="2"><rect x="33" y="22" width="28" height="25" rx="4" /><rect x="65" y="22" width="28" height="25" rx="4" /><rect x="97" y="22" width="28" height="25" rx="4" /><rect x="33" y="51" width="28" height="25" rx="4" /><rect x="65" y="51" width="28" height="25" rx="4" /><rect x="97" y="51" width="28" height="25" rx="4" /></g><circle cx="79" cy="88" r="9" fill="#ff5364" /><path d="M79 73v-9m-12 3 6 5m18-5-6 5m-6 25v8m-10-8-6 6m26-6 6 6" stroke="#ffe2a0" strokeWidth="3" strokeLinecap="round" /></>,
    connect: <><rect x="40" y="15" width="80" height="91" rx="12" fill="#174778" stroke="#9dd4ff" strokeWidth="4" /><g fill="#10182a"><circle cx="57" cy="35" r="9" /><circle cx="80" cy="35" r="9" /><circle cx="103" cy="35" r="9" /><circle cx="57" cy="60" r="9" /><circle cx="80" cy="60" r="9" /><circle cx="103" cy="60" r="9" /><circle cx="57" cy="85" r="9" /><circle cx="80" cy="85" r="9" /><circle cx="103" cy="85" r="9" /></g><circle cx="80" cy="60" r="8" fill="#f4474b" /><circle cx="103" cy="85" r="8" fill="#ffd166" /></>,
    tictac: <><path d="M53 22v68m29-68v68M34 44h67M34 68h67" stroke="#d2e8ff" strokeWidth="5" strokeLinecap="round" /><path d="m45 29 16 16m0-16L45 45m40 30 16 16m0-16L85 91" stroke="#70edff" strokeWidth="5" strokeLinecap="round" /><circle cx="71" cy="57" r="9" stroke="#ff86b8" strokeWidth="5" /></>,
    simon: <><path d="M80 56V17a38 38 0 0 0-38 39h38Z" fill="#ff4564" stroke="#fff" strokeOpacity=".5" strokeWidth="3" /><path d="M84 56h39a39 39 0 0 0-39-39v39Z" fill="#39d997" stroke="#fff" strokeOpacity=".5" strokeWidth="3" /><path d="M80 60H42a38 38 0 0 0 38 39V60Z" fill="#3576fa" stroke="#fff" strokeOpacity=".5" strokeWidth="3" /><path d="M84 60v39a39 39 0 0 0 39-39H84Z" fill="#ffd33d" stroke="#fff" strokeOpacity=".5" strokeWidth="3" /><circle cx="82" cy="58" r="9" fill="#101827" stroke="#fff" strokeWidth="3" /></>,
    whack: <><g fill="#161b26" stroke="#8ad879" strokeWidth="3"><ellipse cx="46" cy="79" rx="20" ry="12" /><ellipse cx="80" cy="79" rx="20" ry="12" /><ellipse cx="114" cy="79" rx="20" ry="12" /></g><path d="M67 71c0-17 6-27 14-27s14 10 14 27" fill="#b8794e" stroke="#ffd3a1" strokeWidth="3" /><circle cx="76" cy="56" r="2.5" fill="#111" /><circle cx="86" cy="56" r="2.5" fill="#111" /><path d="m78 64 5 3 5-3" stroke="#40251d" strokeWidth="2" strokeLinecap="round" /></>,
  };
  return <svg viewBox="0 0 160 120" className="relative h-full w-full drop-shadow-[0_8px_16px_rgba(0,0,0,.4)]" aria-hidden="true">
    <defs>
      <linearGradient id={`cover-bg-${game.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={background} /><stop offset="1" stopColor="#080b16" /></linearGradient>
      <radialGradient id={`cover-light-${game.id}`}><stop stopColor={accent} stopOpacity=".5" /><stop offset="1" stopColor={accent} stopOpacity="0" /></radialGradient>
      <pattern id={`cover-grid-${game.id}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke={highlight} strokeOpacity=".09" strokeWidth=".8" /></pattern>
      <filter id={`art-glow-${game.id}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <rect width="160" height="120" fill={`url(#cover-bg-${game.id})`} />
    <rect width="160" height="120" fill={`url(#cover-grid-${game.id})`} />
    <ellipse cx="80" cy="51" rx="70" ry="58" fill={`url(#cover-light-${game.id})`} />
    <path d="M0 94 46 77l38 12 35-25 41 16v40H0z" fill="#050810" fillOpacity=".42" />
    <path d="M0 100 48 84m64 1 48 17" stroke={accent} strokeOpacity=".24" strokeWidth="1.5" />
    <g fill={highlight} opacity=".68"><circle cx="21" cy="28" r="1.3" /><circle cx="139" cy="25" r="1.5" /><circle cx="125" cy="51" r="1" /><circle cx="37" cy="68" r="1" /></g>
    <g filter={`url(#art-glow-${game.id})`} transform="translate(80 52) scale(1.22) translate(-80 -52)">{art[game.id] || <text x="80" y="73" textAnchor="middle" fill="#fff" fontFamily="system-ui,sans-serif" fontWeight="900" fontSize="38">{game.icon}</text>}</g>
  </svg>;
}

function AdminLogin({ onAuthenticated, flash }: { onAuthenticated: () => void; flash: (message: string) => void }) {
  const [supabaseEmail, setSupabaseEmail] = useState("");
  const [supabasePassword, setSupabasePassword] = useState("");
  const [supabaseLoading, setSupabaseLoading] = useState(false);

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabaseConfigured) {
      flash("Supabase is required for admin access. Add your project URL and anon key in source/.env.local.");
      return;
    }

    try {
      setSupabaseLoading(true);
      await signInToAdmin(supabaseEmail.trim(), supabasePassword);
      onAuthenticated();
      setSupabaseEmail("");
      setSupabasePassword("");
      flash("Secure admin session started");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Supabase sign-in failed";
      flash(message);
    } finally {
      setSupabaseLoading(false);
    }
  };

  if (!supabaseConfigured) {
    return <div className="max-w-md mx-auto mt-10 rounded-3xl border border-amber-500/30 bg-[#141019] p-7"><div className="text-2xl font-black">Admin Panel</div><p className="text-white/50 text-sm mt-1">Supabase is required for secure admin access.</p><p className="mt-3 text-[11px] text-white/45">Add your project URL and anon key in source/.env.local, then sign in with an authorized admin account.</p></div>;
  }

  return <div className="max-w-md mx-auto mt-10 rounded-3xl border border-amber-500/30 bg-[#141019] p-7"><div className="text-2xl font-black">Admin Panel</div><p className="text-white/50 text-sm mt-1">{getSupabaseStatusText()}</p><form onSubmit={handleSignIn} className="mt-5 space-y-3"><input type="email" value={supabaseEmail} onChange={(event) => setSupabaseEmail(event.target.value)} placeholder="Admin email" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-400" /><input type="password" value={supabasePassword} onChange={(event) => setSupabasePassword(event.target.value)} placeholder="Password" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-400" /><button type="submit" disabled={supabaseLoading} className="w-full mt-3 py-3 rounded-xl bg-amber-400 text-black font-black disabled:opacity-60">{supabaseLoading ? "Signing in..." : "Secure admin sign in"}</button></form></div>;
}

export default function App() {
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("admin") === "1" ? "admin" : "home");
  const [coins, setCoins] = useLS("stc", 1250);
  const [favs, setFavs] = useLS<string[]>("favs", ["brick"]);
  const [owned, setOwned] = useLS<string[]>("themes", []);
  const [appliedThemeId, setAppliedThemeId] = useLS("active_theme", "");
  const [claimed, setClaimed] = useLS("claim", "");
  const [customGames, setCustomGames] = useLS<StoreGame[]>("admin_games", []);
  const [gameOverrides, setGameOverrides] = useLS<Partial<Record<string, StoreGame>>>("game_overrides", {});
  const [hiddenGames, setHiddenGames] = useLS<string[]>("hidden_games", []);
  const [adminApps, setAdminApps] = useLS<StoreApp[]>("admin_apps", []);
  const [uploadedApps, setUploadedApps] = useLS<StoreApp[]>("uploaded_apps_cache", []);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [appOverrides, setAppOverrides] = useLS<Partial<Record<string, StoreApp>>>("app_overrides", {});
  const [hiddenApps, setHiddenApps] = useLS<string[]>("hidden_apps", []);
  const [themes, setThemes] = useLS<StoreTheme[]>("store_themes", DEFAULT_THEMES);
  const [ads, setAds] = useLS<AdConfig>("ads_config", { enabled: false, provider: "demo", publisherId: "", slotId: "", bannerText: "" });
  const [detail, setDetail] = useState<StoreGame | null>(null);
  const [playing, setPlaying] = useState<StoreGame | null>(null);
  const [externalApp, setExternalApp] = useState<StoreApp | null>(null);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState("");
  const [gameCategory, setGameCategory] = useState("All games");
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminAuthReady, setAdminAuthReady] = useState(false);
  const [catalogOnline, setCatalogOnline] = useState(true);
  const [hiddenThemeIds, setHiddenThemeIds] = useState<string[]>([]);

  useEffect(() => {
    if (!supabaseConfigured) {
      setAdminAuthReady(true);
      return;
    }
    let active = true;
    void (async () => {
      try {
        const session = await getSupabaseSession();
        const authorized = Boolean(session && await isCurrentUserStoreAdmin());
        if (active) setAdminAuthed(authorized);
        if (session && !authorized) await signOutAdmin();
      } catch {
        if (active) setAdminAuthed(false);
      } finally {
        if (active) setAdminAuthReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!adminAuthReady || !supabaseConfigured) return;
    let active = true;
    const loadCatalog = async () => {
      try {
        let catalog = await fetchStoreCatalog();

        if (adminAuthed) {
          const legacyGames = [...new Map(
            [...BUILTIN_GAMES, ...customGames, ...Object.values(gameOverrides)]
              .filter((game): game is StoreGame => Boolean(game))
              .map((game) => [game.id, game]),
          ).values()];
          const legacyApps = [...new Map(
            [...DEFAULT_APPS, ...adminApps, ...Object.values(appOverrides)]
              .filter((app): app is StoreApp => Boolean(app))
              .map((app) => [app.id, app]),
          ).values()];
          let migrated = false;
          const missingGames = legacyGames.filter((game) => !catalog.games.some((remote) => remote.id === game.id));
          const missingApps = legacyApps.filter((app) => !catalog.apps.some((remote) => remote.id === app.id));
          const missingThemes = themes.filter((theme) => !catalog.themes.some((remote) => remote.id === theme.id));
          if (missingGames.length) {
            await Promise.all(missingGames.map(saveCatalogGame));
            migrated = true;
          }
          if (missingApps.length) {
            await Promise.all(missingApps.map(saveCatalogApp));
            migrated = true;
          }
          if (missingThemes.length) {
            await Promise.all(missingThemes.map((theme) => saveCatalogTheme(theme)));
            migrated = true;
          }
          {
            const legacyHidden: Array<{ kind: CatalogKind; ids: string[] }> = [
              { kind: "game", ids: hiddenGames },
              { kind: "app", ids: hiddenApps },
            ];
            for (const group of legacyHidden) {
              const missingIds = group.ids.filter((id) =>
                !catalog.hiddenItems.some((item) => item.catalogKind === group.kind && item.itemId === id),
              );
              await Promise.all(missingIds.map((id) => hideCatalogItem(group.kind, id)));
              if (missingIds.length) migrated = true;
            }
          }
          let legacyUploads: LegacyUploadedApp[] = [];
          try {
            legacyUploads = getLegacyUploadMetadata();
          } catch (error) {
            console.error("Could not read previous local upload metadata:", error);
            setToast("Previous local uploads could not be migrated. Their browser-only copies were kept.");
          }
          let allLegacyUploadsMigrated = true;
          for (const legacyApp of legacyUploads) {
            const existing = catalog.apps.find((app) => app.id === legacyApp.id && app.storagePath);
            if (existing) {
              try {
                await deleteLegacyUploadAsset(legacyApp.fileId);
              } catch (error) {
                allLegacyUploadsMigrated = false;
                console.error(`Could not remove migrated local upload ${legacyApp.id}:`, error);
              }
              continue;
            }

            let uploadedFile: { bucket: string; filePath: string } | undefined;
            try {
              const asset = await getLegacyUploadAsset(legacyApp.fileId);
              if (!asset) {
                allLegacyUploadsMigrated = false;
                console.error(`Previous local upload ${legacyApp.id} has no IndexedDB file.`);
                continue;
              }

              const file = new File([asset.blob], asset.name, { type: asset.type });
              const validation = validateArenaUpload(file);
              if (!validation.ok) throw new Error(validation.reason || "Unsupported previous upload.");
              const result = await uploadArenaPackage(file, legacyApp.name, legacyApp.description);
              uploadedFile = { bucket: result.bucket, filePath: result.filePath };
              const isImage = file.type.startsWith("image/");
              const imageUrl = isImage
                ? result.publicUrl
                : /^https?:\/\//i.test(legacyApp.image || "") ? legacyApp.image : undefined;
              const { fileId: _fileId, ...appMetadata } = legacyApp;
              const migratedApp: StoreApp = {
                ...appMetadata,
                image: imageUrl,
                externalUrl: result.publicUrl,
                downloadUrl: result.publicUrl,
                fileName: file.name,
                fileType: file.type || file.name.split(".").pop() || "file",
                fileSize: file.size,
                storageBucket: result.bucket,
                storagePath: result.filePath,
              };
              await saveCatalogApp(migratedApp);
              catalog.apps = [...catalog.apps.filter((app) => app.id !== migratedApp.id), migratedApp];
              migrated = true;
              uploadedFile = undefined;
              await deleteLegacyUploadAsset(legacyApp.fileId);
            } catch (error) {
              allLegacyUploadsMigrated = false;
              if (uploadedFile) {
                await deleteCatalogStorageFile(uploadedFile.bucket, uploadedFile.filePath).catch((cleanupError) => {
                  console.error(`Could not clean up failed legacy upload ${legacyApp.id}:`, cleanupError);
                });
              }
              console.error(`Could not migrate previous local upload ${legacyApp.id}:`, error);
            }
          }
          if (allLegacyUploadsMigrated && legacyUploads.length) {
            try {
              localStorage.removeItem("stiph_uploaded_apps");
            } catch (error) {
              console.error("Could not clear previous local upload metadata:", error);
            }
          }
          if (migrated) {
            catalog = await fetchStoreCatalog();
          }
        }

        if (!active) return;
        const builtinGameIds = new Set(BUILTIN_GAMES.map((game) => game.id));
        const builtinAppIds = new Set(DEFAULT_APPS.map((app) => app.id));
        const cloudCustomGames = catalog.games.filter((game) => !builtinGameIds.has(game.id) && !game.isHidden);
        const cloudGameOverrides = catalog.games.filter((game) => builtinGameIds.has(game.id));
        const cloudApps = catalog.apps.filter((app) => !app.isHidden);
        const hiddenGameIds = catalog.hiddenItems.filter((item) => item.catalogKind === "game").map((item) => item.itemId);
        const hiddenAppIds = catalog.hiddenItems.filter((item) => item.catalogKind === "app").map((item) => item.itemId);
        const hiddenThemeIds = catalog.hiddenItems.filter((item) => item.catalogKind === "theme").map((item) => item.itemId);

        const cloudAdminApps = cloudApps.filter((app) => !builtinAppIds.has(app.id) && !app.storagePath);
        const cloudAppOverrides = cloudApps.filter((app) => builtinAppIds.has(app.id));
        const cloudUploadedApps = cloudApps.filter((app) => Boolean(app.storagePath));
        setCustomGames((current) => {
          if (adminAuthed) return cloudCustomGames;
          const merged = new Map(current.map((game) => [game.id, game]));
          cloudCustomGames.forEach((game) => merged.set(game.id, game));
          return [...merged.values()];
        });
        setGameOverrides((current) => adminAuthed
          ? Object.fromEntries(cloudGameOverrides.map((game) => [game.id, game]))
          : { ...current, ...Object.fromEntries(cloudGameOverrides.map((game) => [game.id, game])) });
        setAdminApps((current) => {
          if (adminAuthed) return cloudAdminApps;
          const merged = new Map(current.map((app) => [app.id, app]));
          cloudAdminApps.forEach((app) => merged.set(app.id, app));
          return [...merged.values()];
        });
        setAppOverrides((current) => adminAuthed
          ? Object.fromEntries(cloudAppOverrides.map((app) => [app.id, app]))
          : { ...current, ...Object.fromEntries(cloudAppOverrides.map((app) => [app.id, app])) });
        setUploadedApps((current) => {
          if (adminAuthed) return cloudUploadedApps;
          const merged = new Map(current.map((app) => [app.id, app]));
          cloudUploadedApps.forEach((app) => merged.set(app.id, app));
          return [...merged.values()];
        });
        setThemes((current) => {
          const cloudById = new Map(catalog.themes.map((theme) => [theme.id, theme]));
          const sourceThemes = adminAuthed ? DEFAULT_THEMES : current;
          const mergedDefaults = sourceThemes.map((theme) => cloudById.get(theme.id) || theme);
          const customThemes = catalog.themes.filter((theme) => !DEFAULT_THEMES.some((seed) => seed.id === theme.id));
          const mergedThemes = new Map([...mergedDefaults, ...customThemes].map((theme) => [theme.id, theme]));
          if (!adminAuthed) current.forEach((theme) => {
            if (!cloudById.has(theme.id)) mergedThemes.set(theme.id, theme);
          });
          return [...mergedThemes.values()];
        });
        setHiddenGames((current) => adminAuthed ? hiddenGameIds : [...new Set([...current, ...hiddenGameIds])]);
        setHiddenApps((current) => adminAuthed ? hiddenAppIds : [...new Set([...current, ...hiddenAppIds])]);
        setHiddenThemeIds((current) => adminAuthed ? hiddenThemeIds : [...new Set([...current, ...hiddenThemeIds])]);
        setCatalogOnline(true);
      } catch (error) {
        if (!active) return;
        setCatalogOnline(false);
        const message = error instanceof Error ? error.message : "Could not load the shared catalog.";
        console.error("Could not load Supabase store catalog:", error);
        setToast(`Using this browser's saved catalog: ${message}`);
        window.setTimeout(() => setToast(""), 5000);
      }
    };
    void loadCatalog();
    return () => {
      active = false;
    };
  }, [adminAuthReady, adminAuthed]);

  const uploadStoreFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    if (!supabaseConfigured) {
      flash("Supabase must be configured before uploading files.");
      return;
    }
    if (!adminAuthed) {
      flash("Sign in as an approved admin before uploading files.");
      return;
    }
    setUploadBusy(true);
    try {
      const added: StoreApp[] = [];
      for (const file of Array.from(files)) {
        const validation = validateArenaUpload(file);
        if (!validation.ok) {
          flash(validation.reason || "Unsupported file type");
          continue;
        }

        const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const title = file.name.replace(/\.[^.]+$/, "");
        const result = await uploadArenaPackage(file, title, `Store upload • ${file.name}`);
        const isImage = file.type.startsWith("image/");
        const app: StoreApp = {
          id, name: file.name.replace(/\.[^.]+$/, ""), cat: assetCategory(file.name), icon: assetIcon(file.name),
          grad: "from-amber-300 via-yellow-500 to-orange-700", rating: 0, description: `Direct upload • ${file.name} • ${fileSizeLabel(file.size)}`,
          featured: true, fileName: file.name, fileType: file.type || file.name.split(".").pop() || "file", fileSize: file.size,
          externalUrl: result.publicUrl, downloadUrl: result.publicUrl,
          image: isImage ? result.publicUrl : undefined,
          storageBucket: result.bucket, storagePath: result.filePath,
        };
        try {
          await saveCatalogApp(app);
        } catch (error) {
          await deleteCatalogStorageFile(result.bucket, result.filePath).catch((cleanupError) => {
            console.error("Could not remove unlisted uploaded file:", cleanupError);
          });
          throw error;
        }
        added.push(app);
      }
      if (added.length) {
        setUploadedApps((current) => [...added, ...current]);
        flash(`${added.length} file${added.length > 1 ? "s" : ""} uploaded`);
      } else {
        flash("Choose APK, ZIP, or image files");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed on this browser";
      flash(message);
    } finally {
      setUploadBusy(false);
    }
  };

  const removeUploadedApp = async (id: string) => {
    const item = uploadedApps.find((x) => x.id === id);
    try {
      if (item?.storageBucket && item.storagePath) {
        await deleteCatalogStorageFile(item.storageBucket, item.storagePath);
      }
      await deleteCatalogApp(id);
      setUploadedApps((current) => current.filter((x) => x.id !== id));
      flash("Upload removed");
    } catch (error) {
      flash(error instanceof Error ? error.message : "Could not remove the upload.");
    }
  };

  const allGames = useMemo<StoreGame[]>(() => [...BUILTIN_GAMES.map((g) => ({ ...g, ...(gameOverrides[g.id] || {}), image: gameOverrides[g.id]?.image || g.image })), ...customGames].filter((g) => !hiddenGames.includes(g.id)), [customGames, gameOverrides, hiddenGames]);
  const allApps = useMemo(() => [...DEFAULT_APPS.map((a) => ({ ...a, ...(appOverrides[a.id] || {}) })), ...adminApps, ...uploadedApps].filter((a) => !hiddenApps.includes(a.id)), [adminApps, appOverrides, hiddenApps, uploadedApps]);
  const today = new Date().toDateString();
  const flash = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 1800); };
  const persistCatalogChange = async (persistRemote: () => Promise<void>, updateLocal: () => void) => {
    if (supabaseConfigured && navigator.onLine) {
      try {
        await persistRemote();
        setCatalogOnline(true);
        updateLocal();
        flash("Saved to the shared store");
        return true;
      } catch (error) {
        setCatalogOnline(false);
        const message = error instanceof Error ? error.message : "Supabase save failed.";
        if (error instanceof TypeError || !navigator.onLine) {
          updateLocal();
          flash(`Offline: saved only in this browser. Supabase error: ${message}`);
          return true;
        }
        flash(`Supabase save failed: ${message}`);
        return false;
      }
    }

    updateLocal();
    setCatalogOnline(false);
    flash("Saved only in this browser; it is not shared.");
    return true;
  };
  const claim = () => { if (claimed === today) return flash("Already claimed today"); setCoins((c) => c + 150); setClaimed(today); flash("+150 STC claimed"); };
  const toggleFav = (id: string) => setFavs((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id]);
  const launchGame = (g: StoreGame) => { setDetail(null); setPlaying(g); setCoins((c) => c + 5); };
  const launchExternalApp = (a: StoreApp) => { if (!a.externalUrl) return flash("Add an external URL from Admin first"); setExternalApp(a); };

  const categories = ["All games", ...Array.from(new Set(allGames.map((g) => g.cat.split(" • ")[0])))];
  const filteredGames = allGames.filter((g) => (gameCategory === "All games" || g.cat.split(" • ")[0] === gameCategory) && `${g.name} ${g.cat} ${g.desc}`.toLowerCase().includes(q.toLowerCase()));
  const filteredApps = allApps.filter((a) => `${a.name} ${a.cat} ${a.description}`.toLowerCase().includes(q.toLowerCase()));
  const visibleThemes = themes.filter((theme) => !hiddenThemeIds.includes(theme.id));
  const filteredThemes = visibleThemes.filter((t) => `${t.name} ${t.description}`.toLowerCase().includes(q.toLowerCase()));
  const brickFire = allGames.find((g) => g.id === "brick") || BUILTIN_GAMES[0];
  const activeTheme = visibleThemes.find((theme) => theme.id === appliedThemeId);

  const GameCard = ({ game }: { game: StoreGame }) => (
    <article onClick={() => setDetail(game)} className="group cursor-pointer overflow-hidden rounded-[22px] border border-white/10 bg-[#0d1220]/90 shadow-[0_12px_28px_rgba(5,8,18,.45)] transition duration-200 hover:-translate-y-1 hover:border-amber-400/50">
      <div className={`relative aspect-video bg-gradient-to-br ${game.grad} flex items-center justify-center overflow-hidden`}>
        {imageOrFallback(game.image, "!object-contain")}
        {!game.image && <GameArtwork game={game} />}
      </div>
      <div className="space-y-3 p-3">
        <div className="min-w-0 text-left">
          <h3 className="truncate text-base font-black leading-tight text-white sm:text-lg">{game.name}</h3>
          <span className="mt-1 block truncate text-[11px] text-white/55">{game.cat}</span>
        </div>
        <button aria-label={`Play ${game.name}`} onClick={(e) => { e.stopPropagation(); launchGame(game); }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-200 to-amber-500 py-2.5 text-sm font-black text-[#110d08] shadow-[0_4px_18px_rgba(251,191,36,.25)] transition hover:brightness-110">▶ <span>Play</span></button>
        <div className="flex items-center justify-between border-t border-white/10 pt-2">
          <button aria-label={`${favs.includes(game.id) ? "Remove" : "Add"} ${game.name} ${favs.includes(game.id) ? "from" : "to"} favorites`} onClick={(e) => { e.stopPropagation(); toggleFav(game.id); }} className="text-sm text-white/70 hover:text-rose-300">{favs.includes(game.id) ? "♥ Favorited" : "♡ Favorite"}</button>
          <button onClick={(e) => { e.stopPropagation(); setDetail(game); }} className="text-[10px] font-bold uppercase tracking-wide text-amber-300 hover:text-amber-200">Details ↗</button>
        </div>
      </div>
    </article>
  );

  const AppCard = ({ app }: { app: StoreApp }) => {
    return <article className="rounded-2xl bg-[#141019] border border-white/10 p-3 flex gap-3 items-center hover:border-amber-400/60 transition">
      <div className={`relative w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br ${app.grad} flex items-center justify-center overflow-hidden text-2xl font-black`}>{imageOrFallback(app.image)}<span className="relative">{app.icon}</span></div>
      <div className="flex-1 min-w-0"><div className="text-sm font-bold text-white truncate">{app.name}</div><div className="text-xs text-white/50 truncate">{app.cat}</div><div className="mt-1 text-[10px] text-white/40">Android package</div></div>
      {app.downloadUrl ? <a href={app.downloadUrl} download={app.fileName || app.name} className="shrink-0 rounded-lg border border-amber-400/60 px-3 py-1.5 text-xs font-bold text-amber-300">{app.fileName?.toLowerCase().endsWith(".zip") || app.fileType?.includes("zip") ? "Download ZIP" : app.fileName?.toLowerCase().endsWith(".apk") || app.cat.includes("APK") ? "Download APK" : "Download"}</a> : app.externalUrl ? <button onClick={() => launchExternalApp(app)} className="shrink-0 rounded-lg border border-amber-400/60 px-3 py-1.5 text-xs font-bold text-amber-300">Open app</button> : <span aria-disabled="true" className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40">Unavailable</span>}
    </article>;
  };

  const ThemeCard = ({ theme }: { theme: StoreTheme }) => {
    const own = theme.price === 0 || owned.includes(theme.id);
    return <article className="rounded-2xl overflow-hidden border border-white/10 hover:border-amber-400/70 transition group bg-[#141019]">
      <div className="aspect-[4/3] relative flex items-center justify-center overflow-hidden" style={{ background: theme.bg }}>
        {imageOrFallback(theme.image)}<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#fff5,transparent_45%),linear-gradient(to_top,#0009,transparent)]" />
        <div className="absolute inset-x-5 top-5 grid grid-cols-6 gap-1 opacity-60">{Array.from({ length: 18 }, (_, i) => <div key={i} className="h-2 rounded bg-white/60" />)}</div>
        <span className="relative text-5xl font-black text-white drop-shadow-lg group-hover:scale-125 transition">{theme.icon}</span>
      </div>
      <div className="p-3"><div className="flex items-start justify-between gap-2"><div><div className="text-sm font-bold text-white">{theme.name}</div><div className="text-[10px] text-white/50 mt-0.5">{theme.description}</div></div><span className="text-[10px] border border-amber-400/60 text-amber-300 px-1.5 rounded">{theme.price ? "Unlockable" : "Free"}</span></div>
        <button onClick={() => { if (own) { setAppliedThemeId(theme.id); return flash(`${theme.name} applied`); } if (coins < theme.price) return flash("Not enough STC"); setCoins((c) => c - theme.price); setOwned((x) => [...x, theme.id]); setAppliedThemeId(theme.id); flash(`${theme.name} unlocked and applied`); }} className="w-full mt-3 text-xs font-black px-2 py-2 rounded bg-amber-400 text-black">{appliedThemeId === theme.id ? "Applied" : own ? "Apply Theme" : `Unlock • ${theme.price} STC`}</button>
      </div>
    </article>;
  };

  const resetAll = () => { ["stc", "favs", "themes", "active_theme", "apps", "claim", "admin_games", "admin_apps", "uploaded_apps_cache", "stiph_uploaded_apps", "store_themes", "ads_config", "ad_free", "admin_auth"].forEach((k) => localStorage.removeItem(k)); window.location.reload(); };

  const Home = () => (
    <div className="home-layout grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="home-content space-y-6">
        <section className="hero-panel store-hero relative overflow-hidden rounded-[28px] border border-amber-500/30 bg-[#090e1b] shadow-[0_0_50px_rgba(255,174,0,.1)]">
        <img src="/stiphan-store-logo.jpg" alt="" aria-hidden="true" className="store-hero-art absolute inset-0 h-full w-full object-cover" />
        <div className="store-hero-shade absolute inset-0" />
        <div className="hero-copy relative flex min-h-[360px] flex-col justify-center p-6 md:min-h-[410px] md:p-10">
          <div className="hero-eyebrow store-hero-eyebrow mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/40 bg-[#171007]/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-amber-100"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 8 4 3 5-7 5 7 4-3-2 9H5L3 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M5 20h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg> The STIPHAN universe</div>
          <div className="hero-copy-text store-hero-copy max-w-2xl">
            <p className="store-hero-kicker">Your digital playground</p>
            <h1 className="text-4xl font-black uppercase leading-[0.92] tracking-tight text-white md:text-6xl"><span>STIPHAN</span> <span className="store-hero-gold">STORE</span></h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 md:text-base">Step into a brighter world of play. Discover your next favorite and start the adventure right here.</p>
          </div>
          <div className="hero-actions store-hero-actions mt-6 flex flex-wrap gap-3">
            <button onClick={() => launchGame(brickFire)} className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-600 px-7 py-3.5 text-sm font-black uppercase tracking-[0.08em] text-black shadow-[0_0_30px_rgba(255,180,0,.4)]">Play now</button>
            <button onClick={() => setTab("games")} className="store-hero-secondary rounded-xl border border-white/40 bg-white/5 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-white/10">Explore store</button>
          </div>
        </div>
        </section>

        <section className="featured-categories" aria-label="STIPHAN games">
          <H2 title="STIPHAN Games" more="View All" onMore={() => setTab("games")} />
          <div className="category-grid">
            {STIPHAN_GAMES.map((game) => (
              <button key={game.id} type="button" className={`category-card category-${game.id}`} onClick={() => setTab("games")} aria-label={`${game.name}: ${game.action}`}>
                <img className="category-card-art" src={game.image} alt="" />
                <span className="category-card-shade" />
                <span className="category-name">{game.name}</span>
                <span className="category-note">{game.note}</span>
                <span className="category-action">{game.action}<span aria-hidden="true">→</span></span>
              </button>
            ))}
          </div>

          <H2 title="More STIPHAN Adventures" more="All Games" onMore={() => setTab("games")} />
          <div className="category-grid extra-game-grid">
            {EXTRA_STIPHAN_GAME_IDS.map((gameId) => {
              const game = allGames.find((item) => item.id === gameId);
              if (!game) return null;
              return (
                <button key={game.id} type="button" className="category-card category-extra" onClick={() => launchGame(game)} aria-label={`Play ${game.name}`}>
                  {game.image && <img className="category-card-art" src={game.image} alt="" />}
                  <span className="category-card-shade" />
                  <span className="category-name">{game.name}</span>
                  <span className="category-note">{game.cat}</span>
                  <span className="category-action">Play game<span aria-hidden="true">→</span></span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="space-y-5">
          <H2 title="Featured Games" more="View All" onMore={() => setTab("games")} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{allGames.slice(0, 10).map((g) => <GameCard key={g.id} game={g} />)}</div>
        </div>

        <div className="space-y-5">
          <H2 title="Featured Apps" more="View All" onMore={() => setTab("apps")} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{allApps.filter((a) => a.featured).slice(0, 6).map((a) => <AppCard key={a.id} app={a} />)}</div>
        </div>

        <div className="space-y-5">
          <H2 title={`Cinematic Themes (${visibleThemes.length}+)`} more="View All" onMore={() => setTab("themes")} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{visibleThemes.filter((t) => t.featured).slice(0, 5).map((t) => <ThemeCard key={t.id} theme={t} />)}</div>
        </div>
      </div>

      <aside className="hidden xl:block">
        <div className="sticky top-20 overflow-hidden rounded-[28px] border border-amber-500/25 bg-[#0d1220]/90 shadow-[0_16px_50px_rgba(0,0,0,.45)]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-amber-300"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-[10px] text-black">BF</span> STIPHAN BRICK FIRE</div>
            <button onClick={() => setDetail(brickFire)} className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/80">Details</button>
          </div>
          <div className="p-4">
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#151d2e] p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-900"><img src="/brick-fire-hero.svg" alt="" className="h-full w-full object-cover" /></div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xl font-black text-white">{brickFire.name}</div>
                <div className="mt-1 text-[11px] text-white/60">{brickFire.cat} · Browser game</div>
              </div>
            </div>
            <button onClick={() => launchGame(brickFire)} className="w-full rounded-xl bg-gradient-to-b from-amber-300 to-amber-600 px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-black">Play Brick Fire</button>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-white/45">How to play</div><p>{brickFire.instructions}</p></div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/60">Play instantly in a modern web browser. No account or payment is required.</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );

  const Shop = () => {
    const price = 2500;
    const allPremiumOwned = visibleThemes.every((theme) => theme.price === 0 || owned.includes(theme.id));
    return <><H2 title="STIPHAN Shop" /><p className="mb-4 text-sm text-white/55">Unlock optional themes with STC. These points are stored in this browser and have no cash value.</p><div className="max-w-xl rounded-2xl border border-amber-500/25 bg-[#111827] p-5"><div className="flex items-center gap-4"><div className="text-4xl text-amber-300">✦</div><div className="flex-1"><div className="font-bold text-white">Premium Theme Pack</div><div className="text-xs text-white/50">Unlock every theme in the catalog.</div></div><button disabled={allPremiumOwned} onClick={() => { if (allPremiumOwned) return; if (coins < price) return flash("Not enough STC"); setCoins((c) => c - price); setOwned(visibleThemes.map((theme) => theme.id)); flash("All themes unlocked"); }} className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-black text-black disabled:cursor-default disabled:opacity-50">{allPremiumOwned ? "All unlocked" : `Unlock · ${price} STC`}</button></div></div></>;
  };

  const Coins = () => {
    const shareStore = async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        setCoins((balance) => balance + 100);
        flash("Link copied · +100 local STC");
      } catch {
        flash("Clipboard access was denied. No coins were added.");
      }
    };
    return <><H2 title="STIPHAN Coins" /><div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-900/50 to-black p-8 text-center"><div className="text-white/60">Local virtual balance · no cash value</div><div className="my-2 text-5xl font-black text-amber-300">S {coins.toLocaleString()} STC</div><button onClick={claim} className="mt-3 rounded-xl bg-gradient-to-b from-amber-300 to-amber-600 px-8 py-3 font-black text-black">{claimed === today ? "Claimed today" : "Claim daily +150 STC"}</button></div><H2 title="Earn local points" /><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setTab("games")} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#141019] p-4 text-left hover:border-amber-400"><span className="text-2xl text-amber-300">▶</span><span className="flex-1 font-bold text-white">Play a game</span><span className="text-sm font-black text-amber-300">+5 STC per launch</span></button><button onClick={shareStore} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#141019] p-4 text-left hover:border-amber-400"><span className="text-2xl text-amber-300">↗</span><span className="flex-1 font-bold text-white">Copy store link</span><span className="text-sm font-black text-amber-300">+100 STC</span></button></div></>;
  };

  const Admin = () => {
    const [gameForm, setGameForm] = useState({ id: "", name: "", cat: "Action • Arcade", icon: "✦", grad: "from-cyan-500 via-blue-600 to-violet-800", rating: "0", desc: "", image: "", externalUrl: "", sourceHtml: "" });
    const [appForm, setAppForm] = useState({ id: "", name: "", cat: "Tools", icon: "▣", grad: "from-blue-500 to-violet-700", rating: "0", description: "", image: "", externalUrl: "" });
    const [themeForm, setThemeForm] = useState({ id: "", name: "", icon: "✦", bg: "linear-gradient(145deg,#00e5ff,#7c4dff,#0a0020)", price: "150", description: "Cinematic theme", image: "" });

    const handleSignOut = async () => {
      await signOutAdmin().catch(() => {});
      setAdminAuthed(false);
      flash("Admin session closed");
    };

    const input = (value: string, onChange: (v: string) => void, placeholder: string, area = false) => area ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={5} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400" /> : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400" />;
    const imageUpload = (onLoaded: (url: string) => void) => <label className="block text-xs text-white/50">Upload image<input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; if (!adminAuthed) return flash("Sign in as an approved admin before uploading images."); try { const result = await uploadArenaPackage(file, file.name.replace(/\.[^.]+$/, ""), "Store catalog image"); onLoaded(result.publicUrl); flash("Image uploaded to shared storage"); } catch (error) { flash(error instanceof Error ? error.message : "Image upload failed."); } }} className="mt-1 w-full text-xs text-white/50" /></label>;
    const saveGame = async (e: FormEvent) => {
      e.preventDefault();
      if (!gameForm.name.trim()) return flash("Game name is required");
      const id = gameForm.id.trim() || `custom-${Date.now()}`;
      const rating = Number(gameForm.rating);
      if (!Number.isFinite(rating) || rating < 0 || rating > 5) return flash("Rating must be between 0 and 5");
      const existing = allGames.find((game) => game.id === id);
      const item: StoreGame = { ...existing, id, name: gameForm.name.trim(), cat: gameForm.cat, icon: gameForm.icon || "✦", grad: gameForm.grad, rating, desc: gameForm.desc || "Custom STIPHAN STORE game.", image: gameForm.image || undefined, externalUrl: gameForm.externalUrl || undefined, sourceHtml: gameForm.sourceHtml || undefined };
      const isBuiltin = BUILTIN_GAMES.some((game) => game.id === id);
      const saved = await persistCatalogChange(
        async () => { await saveCatalogGame(item); await showCatalogItem("game", id); },
        () => {
          if (isBuiltin) setGameOverrides((current) => ({ ...current, [id]: item }));
          else setCustomGames((items) => [...items.filter((game) => game.id !== id), item]);
          setHiddenGames((items) => items.filter((hiddenId) => hiddenId !== id));
        },
      );
      if (!saved) return;
      setGameForm({ id: "", name: "", cat: "Action • Arcade", icon: "✦", grad: "from-cyan-500 via-blue-600 to-violet-800", rating: "0", desc: "", image: "", externalUrl: "", sourceHtml: "" });
    };
    const saveApp = async (e: FormEvent) => {
      e.preventDefault();
      if (!appForm.name.trim()) return flash("App name is required");
      const id = appForm.id.trim() || `app-${Date.now()}`;
      const rating = Number(appForm.rating);
      if (!Number.isFinite(rating) || rating < 0 || rating > 5) return flash("Rating must be between 0 and 5");
      const existing = allApps.find((app) => app.id === id);
      const item: StoreApp = { ...existing, id, name: appForm.name.trim(), cat: appForm.cat, icon: appForm.icon || "▣", grad: appForm.grad, rating, description: appForm.description || "Custom STIPHAN STORE app.", image: appForm.image || undefined, externalUrl: appForm.externalUrl || undefined };
      const isBuiltin = DEFAULT_APPS.some((app) => app.id === id);
      const saved = await persistCatalogChange(
        async () => { await saveCatalogApp(item); await showCatalogItem("app", id); },
        () => {
          if (isBuiltin) setAppOverrides((current) => ({ ...current, [id]: item }));
          else setAdminApps((items) => [...items.filter((app) => app.id !== id), item]);
          setHiddenApps((items) => items.filter((hiddenId) => hiddenId !== id));
        },
      );
      if (!saved) return;
      setAppForm({ id: "", name: "", cat: "Tools", icon: "▣", grad: "from-blue-500 to-violet-700", rating: "0", description: "", image: "", externalUrl: "" });
    };
    const saveTheme = async (e: FormEvent) => {
      e.preventDefault();
      if (!themeForm.name.trim()) return flash("Theme name is required");
      const parsedPrice = Number(themeForm.price);
      if (!Number.isInteger(parsedPrice) || parsedPrice < 0) return flash("Theme price must be a non-negative whole number");
      const id = themeForm.id.trim() || `theme-${Date.now()}`;
      const existing = themes.find((theme) => theme.id === id);
      const item: StoreTheme = { ...existing, id, name: themeForm.name.trim(), icon: themeForm.icon || "✦", bg: themeForm.bg, price: parsedPrice, description: themeForm.description, image: themeForm.image || undefined };
      const saved = await persistCatalogChange(
        async () => { await saveCatalogTheme(item); await showCatalogItem("theme", id); },
        () => {
          setThemes((items) => [...items.filter((theme) => theme.id !== id), item]);
          setHiddenThemeIds((items) => items.filter((hiddenId) => hiddenId !== id));
        },
      );
      if (!saved) return;
      setThemeForm({ id: "", name: "", icon: "✦", bg: "linear-gradient(145deg,#00e5ff,#7c4dff,#0a0020)", price: "150", description: "Cinematic theme", image: "" });
    };
    const editGame = (g: StoreGame) => setGameForm({ id: g.id, name: g.name, cat: g.cat, icon: g.icon, grad: g.grad, rating: String(g.rating), desc: g.desc, image: g.image || "", externalUrl: g.externalUrl || "", sourceHtml: g.sourceHtml || "" });
    const editApp = (a: StoreApp) => setAppForm({ id: a.id, name: a.name, cat: a.cat, icon: a.icon, grad: a.grad, rating: String(a.rating), description: a.description, image: a.image || "", externalUrl: a.externalUrl || "" });
    const editTheme = (t: StoreTheme) => setThemeForm({ id: t.id, name: t.name, icon: t.icon, bg: t.bg, price: String(t.price), description: t.description, image: t.image || "" });
    const removeGame = async (game: StoreGame) => {
      const isBuiltin = BUILTIN_GAMES.some((item) => item.id === game.id);
      await persistCatalogChange(
        () => isBuiltin ? hideCatalogItem("game", game.id) : deleteCatalogGame(game.id),
        () => {
          if (isBuiltin) setHiddenGames((items) => [...new Set([...items, game.id])]);
          else setCustomGames((items) => items.filter((item) => item.id !== game.id));
        },
      );
    };
    const removeApp = async (app: StoreApp) => {
      const isBuiltin = DEFAULT_APPS.some((item) => item.id === app.id);
      await persistCatalogChange(
        async () => {
          if (isBuiltin) {
            await hideCatalogItem("app", app.id);
            return;
          }
          if (app.storageBucket && app.storagePath) {
            await deleteCatalogStorageFile(app.storageBucket, app.storagePath);
          }
          await deleteCatalogApp(app.id);
        },
        () => {
          if (isBuiltin) setHiddenApps((items) => [...new Set([...items, app.id])]);
          else if (app.storagePath) setUploadedApps((items) => items.filter((item) => item.id !== app.id));
          else setAdminApps((items) => items.filter((item) => item.id !== app.id));
        },
      );
    };
    const removeTheme = async (theme: StoreTheme) => {
      await persistCatalogChange(
        () => deleteCatalogTheme(theme.id),
        () => setThemes((items) => items.filter((item) => item.id !== theme.id)),
      );
    };
    return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><H2 title="Admin Dashboard" /><p className="text-white/50 text-sm -mt-4">{catalogOnline ? "Shared catalog is connected to Supabase." : "Offline: showing this browser's saved catalog; changes will not reach other visitors."}</p></div><button onClick={handleSignOut} className="px-3 py-2 rounded-lg border border-white/15 text-xs">Sign Out</button></div>
      <section className="grid xl:grid-cols-2 gap-4"><form onSubmit={saveGame} className="rounded-2xl bg-[#141019] border border-white/10 p-5 space-y-3"><h3 className="font-black text-amber-300">Add / Edit Game</h3>{input(gameForm.id, (v) => setGameForm({ ...gameForm, id: v }), "ID (leave blank for new)")}{input(gameForm.name, (v) => setGameForm({ ...gameForm, name: v }), "Game name *")}{input(gameForm.cat, (v) => setGameForm({ ...gameForm, cat: v }), "Category")}{input(gameForm.icon, (v) => setGameForm({ ...gameForm, icon: v }), "Icon / short mark")}{input(gameForm.grad, (v) => setGameForm({ ...gameForm, grad: v }), "Tailwind gradient classes")}{input(gameForm.rating, (v) => setGameForm({ ...gameForm, rating: v }), "Rating")}{input(gameForm.image, (v) => setGameForm({ ...gameForm, image: v }), "Image URL (optional)")}{imageUpload((v) => setGameForm({ ...gameForm, image: v }))}{input(gameForm.externalUrl, (v) => setGameForm({ ...gameForm, externalUrl: v }), "External game URL (optional)")}{input(gameForm.desc, (v) => setGameForm({ ...gameForm, desc: v }), "Long description")}{input(gameForm.sourceHtml, (v) => setGameForm({ ...gameForm, sourceHtml: v }), "Paste custom HTML/JS game source (runs in a sandbox)", true)}<button className="w-full py-2.5 rounded-xl bg-amber-400 text-black font-black">Save Game</button></form>
      <form onSubmit={saveApp} className="rounded-2xl bg-[#141019] border border-white/10 p-5 space-y-3"><h3 className="font-black text-amber-300">Add / Edit App</h3>{input(appForm.id, (v) => setAppForm({ ...appForm, id: v }), "ID (leave blank for new)")}{input(appForm.name, (v) => setAppForm({ ...appForm, name: v }), "App name *")}{input(appForm.cat, (v) => setAppForm({ ...appForm, cat: v }), "Category")}{input(appForm.icon, (v) => setAppForm({ ...appForm, icon: v }), "Icon / short mark")}{input(appForm.grad, (v) => setAppForm({ ...appForm, grad: v }), "Tailwind gradient classes")}{input(appForm.rating, (v) => setAppForm({ ...appForm, rating: v }), "Rating")}{input(appForm.image, (v) => setAppForm({ ...appForm, image: v }), "Image URL")}{imageUpload((v) => setAppForm({ ...appForm, image: v }))}{input(appForm.externalUrl, (v) => setAppForm({ ...appForm, externalUrl: v }), "External app URL")}{input(appForm.description, (v) => setAppForm({ ...appForm, description: v }), "Long description", true)}<button className="w-full py-2.5 rounded-xl bg-amber-400 text-black font-black">Save App</button></form></section>
      <section className="rounded-2xl bg-[#141019] border border-white/10 p-5"><form onSubmit={saveTheme} className="grid md:grid-cols-2 gap-3"><div className="md:col-span-2"><h3 className="font-black text-amber-300 mb-2">Add / Edit Theme</h3></div>{input(themeForm.id, (v) => setThemeForm({ ...themeForm, id: v }), "ID (blank for new)")}{input(themeForm.name, (v) => setThemeForm({ ...themeForm, name: v }), "Theme name *")}{input(themeForm.icon, (v) => setThemeForm({ ...themeForm, icon: v }), "Theme mark")}{input(themeForm.price, (v) => setThemeForm({ ...themeForm, price: v }), "STC price")}{input(themeForm.bg, (v) => setThemeForm({ ...themeForm, bg: v }), "CSS background / gradient")}{input(themeForm.image, (v) => setThemeForm({ ...themeForm, image: v }), "Image URL")}{imageUpload((v) => setThemeForm({ ...themeForm, image: v }))}{input(themeForm.description, (v) => setThemeForm({ ...themeForm, description: v }), "Description", true)}<button className="md:col-span-2 py-2.5 rounded-xl bg-amber-400 text-black font-black">Save Theme</button></form></section>
      <section className="rounded-2xl bg-[#141019] border border-amber-500/20 p-5 shadow-[0_0_35px_rgba(245,158,11,.05)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div><h3 className="font-black text-amber-300 text-lg">Direct Upload Vault</h3><p className="text-xs text-white/45 mt-1">{supabaseConfigured ? `Supabase storage is active for ${arenaBucketName}.` : "Upload APK, ZIP, or app artwork straight from your phone. Files stay on this device/browser until a Supabase project is configured."}</p></div>
          <label className={`cursor-pointer px-5 py-3 rounded-xl bg-gradient-to-b from-amber-300 to-amber-600 text-black font-black text-sm ${uploadBusy ? "opacity-50 pointer-events-none" : ""}`}>
            {uploadBusy ? "UPLOADING…" : "＋ UPLOAD FILES"}
            <input type="file" multiple accept=".apk,.zip,.png,.jpg,.jpeg,.webp,.gif,application/zip,application/vnd.android.package-archive,image/*" className="hidden" onChange={(e) => { uploadStoreFiles(e.target.files); e.currentTarget.value = ""; }} />
          </label>
        </div>
        <div className="rounded-xl border border-dashed border-amber-500/25 bg-black/20 p-4 text-center text-xs text-white/45">{supabaseConfigured ? "Upload prepares the Arena ZIP workflow and validates file size/type before storage." : "Tip: select multiple APK/ZIP files at once from your Android file manager."}</div>
        {uploadedApps.length > 0 && <div className="grid md:grid-cols-2 gap-2 mt-4">{uploadedApps.map((a) => <div key={a.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
          <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${a.grad} flex items-center justify-center text-[10px] font-black text-black`}>{a.icon}</div>
          <div className="min-w-0 flex-1"><div className="font-bold truncate">{a.name}</div><div className="text-[10px] text-white/45">{a.fileName} • {fileSizeLabel(a.fileSize)}</div></div>
          <a href={a.externalUrl} download={a.fileName} className="text-xs text-amber-300 font-bold">Download</a>
          <button onClick={() => removeUploadedApp(a.id)} className="text-xs text-red-400">Delete</button>
        </div>)}</div>}
      </section>
      <section className="rounded-2xl bg-[#141019] border border-white/10 p-5"><h3 className="font-black text-amber-300 mb-3">Ads & Store Settings</h3><div className="grid md:grid-cols-2 gap-3"><label className="flex items-center gap-3 rounded-xl border border-white/10 p-3"><input type="checkbox" checked={ads.enabled} onChange={(e) => setAds({ ...ads, enabled: e.target.checked })} /> Enable ads layer</label><select value={ads.provider} onChange={(e) => setAds({ ...ads, provider: e.target.value as AdConfig["provider"] })} className="bg-black/40 border border-white/10 rounded-xl px-3"><option value="demo">Demo ad layer</option><option value="adsense">AdSense configured</option></select>{input(ads.publisherId, (v) => setAds({ ...ads, publisherId: v }), "AdSense publisher ID")}{input(ads.slotId, (v) => setAds({ ...ads, slotId: v }), "AdSense slot ID")}{input(ads.bannerText, (v) => setAds({ ...ads, bannerText: v }), "Ad banner text")}</div><p className="text-xs text-white/40 mt-3">The UI stores publisher/slot IDs for your deployment. A live AdSense account still requires Google's approval and its own script/verification.</p></section>
      <section className="grid xl:grid-cols-3 gap-4"><div className="rounded-2xl bg-[#141019] border border-white/10 p-5"><h3 className="font-black text-amber-300 mb-3">Games ({allGames.length})</h3>{allGames.map((g) => <div key={g.id} className="flex items-center gap-2 border-b border-white/5 py-2"><span className="flex-1 text-sm truncate">{g.name}</span><button onClick={() => editGame(g)} className="text-xs text-amber-300">Edit</button><button onClick={() => { void removeGame(g); }} className="text-xs text-red-400">Delete</button></div>)}</div><div className="rounded-2xl bg-[#141019] border border-white/10 p-5"><h3 className="font-black text-amber-300 mb-3">Apps ({allApps.length})</h3>{allApps.map((a) => <div key={a.id} className="flex items-center gap-2 border-b border-white/5 py-2"><span className="flex-1 text-sm truncate">{a.name}</span><button onClick={() => editApp(a)} className="text-xs text-amber-300">Edit</button><button onClick={() => { void removeApp(a); }} className="text-xs text-red-400">Delete</button></div>)}</div><div className="rounded-2xl bg-[#141019] border border-white/10 p-5"><h3 className="font-black text-amber-300 mb-3">Themes ({visibleThemes.length})</h3>{visibleThemes.map((t) => <div key={t.id} className="flex items-center gap-2 border-b border-white/5 py-2"><span className="flex-1 text-sm truncate">{t.name}</span><button onClick={() => editTheme(t)} className="text-xs text-amber-300">Edit</button>{!DEFAULT_THEMES.some((d) => d.id === t.id) && <button onClick={() => { void removeTheme(t); }} className="text-xs text-red-400">Delete</button>}</div>)}</div></section>
      <button onClick={() => { if (window.confirm("Reset all local STIPHAN STORE data?")) resetAll(); }} className="px-4 py-2 rounded-xl border border-red-500/30 text-red-300 text-sm">Reset local store data</button>
    </div>;
  };

  const pages: Record<string, React.ReactNode> = {
    home: <Home />,
    games: <><H2 title={`Games (${filteredGames.length})`} /><div className="mb-5 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter games by category">{categories.map((category) => <button key={category} aria-pressed={gameCategory === category} onClick={() => setGameCategory(category)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${gameCategory === category ? "border-amber-300 bg-amber-300 text-black" : "border-white/15 bg-white/5 text-white/65 hover:border-amber-300/60"}`}>{category}</button>)}</div>{filteredGames.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{filteredGames.map((g) => <GameCard key={g.id} game={g} />)}</div> : <p className="text-white/50">No games match this search and category.</p>}</>,
    apps: <><H2 title={`Apps (${filteredApps.length})`} />{filteredApps.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{filteredApps.map((a) => <AppCard key={a.id} app={a} />)}</div> : <p className="text-white/50">No app downloads match your search.</p>}</>,
    themes: <><H2 title={`${visibleThemes.length} Cinematic Themes`} /><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">{filteredThemes.map((t) => <ThemeCard key={t.id} theme={t} />)}</div></>,
    shop: <Shop />,
    coins: <Coins />,
    favs: <><H2 title="Favorites" />{favs.length ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">{allGames.filter((g) => favs.includes(g.id)).map((g) => <GameCard key={g.id} game={g} />)}</div> : <p className="text-white/50">No favorites yet — tap ♡ on a game.</p>}</>,
    profile: <><div className="mx-auto mt-6 max-w-md rounded-3xl border border-white/10 bg-[#141019] p-8 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-700 text-4xl font-black text-black">S</div><div className="mt-3 text-xl font-black text-white">Local player</div><div className="text-xs text-white/50">Your preferences and virtual points are saved in this browser.</div><div className="mt-5 grid grid-cols-3 gap-2">{[[allGames.length, "Games"], [`${owned.length}/${themes.length}`, "Themes"], [coins.toLocaleString(), "Local STC"]].map(([a, b]) => <div key={String(b)} className="rounded-xl bg-black/40 p-3"><div className="font-black text-amber-300">{a}</div><div className="text-[10px] text-white/50">{b}</div></div>)}</div><div className="mt-5 grid gap-2"><button onClick={() => setTab("favs")} className="rounded-xl border border-white/10 py-2 text-white/70">View favorites</button><button onClick={() => { if (window.confirm("Reset local store data?")) resetAll(); }} className="py-2 text-sm text-red-400">Reset local store data</button></div></div></>,
    admin: adminAuthed ? <Admin /> : <AdminLogin onAuthenticated={() => setAdminAuthed(true)} flash={flash} />,
  };

  return <div className="min-h-screen bg-[#070b12] text-white font-sans bg-[radial-gradient(ellipse_at_top,rgba(161,99,19,.16),transparent_52%)]" style={{ backgroundImage: activeTheme?.bg }}>
    <div className="mx-auto max-w-[1600px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-amber-500/20 bg-[#090d18]/90 p-4 backdrop-blur-xl lg:flex"><div className="mb-7"><StoreBrand /></div>{NAV.map(([id, icon, name]) => <button key={id} onClick={() => setTab(id)} className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${tab === id ? "border border-amber-400/60 bg-amber-500/10 text-white" : "text-white/70 hover:bg-white/5"}`}><span className="w-5 text-center">{icon}</span>{name}</button>)}<div className="mt-auto rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-900/30 to-black p-4 text-center"><div className="font-black text-amber-300">STIPHAN COINS</div><div className="mt-1 text-xs text-white/60">Daily reward</div><div className="my-2 text-4xl text-amber-300">S</div><button onClick={claim} className="rounded-lg border border-amber-400 px-4 py-1.5 text-xs text-amber-300">Claim +150</button></div></aside>
      <div className="lg:pl-60">
        <header className="store-header sticky top-0 z-20 border-b border-white/5 bg-[#070b12]/90 px-3 py-3 backdrop-blur-xl md:px-6">
          <div className="store-header-inner">
            <div className="store-brand-mobile lg:hidden"><StoreBrand /></div>
            <div className="store-header-actions">
              <input type="search" aria-label="Search games, apps, and themes" value={q} onChange={(e) => { const value = e.target.value; setQ(value); if (value && !["games", "apps", "themes"].includes(tab)) setTab("games"); }} placeholder="Search games, apps, themes..." className="store-search max-w-2xl flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-amber-400" />
              <button onClick={() => setTab("coins")} aria-label={`Virtual STC balance: ${coins.toLocaleString()}`} className="store-balance rounded-full border border-amber-500/50 bg-black px-3 py-1.5 text-sm font-black"><span className="store-balance-mark">S</span><span className="store-balance-value">{coins.toLocaleString()}</span></button>
              <button onClick={() => setTab("profile")} aria-label="Open local player profile" className="store-profile-button flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-400 bg-white/10 text-sm">●</button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 pb-28 md:p-6 md:pb-28 lg:pb-6">{pages[tab] || pages.home}</main>
        <footer className="mx-auto max-w-[1500px] px-4 pb-28 pt-6 text-xs text-white/45 md:px-6 lg:pb-8"><div className="flex flex-col gap-2 border-t border-white/10 pt-4 md:flex-row md:items-center md:justify-between"><div>© 2026 STIPHAN STORE. Owner details are not provided in this project.</div><div className="flex flex-wrap gap-3"><a href="/about.html" className="hover:text-amber-300">About</a><a href="/contact.html" className="hover:text-amber-300">Contact</a><a href="/privacy.html" className="hover:text-amber-300">Privacy</a><a href="/terms.html" className="hover:text-amber-300">Terms</a><a href="/robots.txt" className="hover:text-amber-300">Robots</a></div></div></footer>
      </div>
    </div>
    <nav aria-label="Mobile navigation" className="mobile-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-amber-400/20 bg-[#05080e]/95 backdrop-blur-xl lg:hidden">{MOBILE_NAV.map(([id, icon, name]) => <button key={id} aria-current={tab === id ? "page" : undefined} onClick={() => { setTab(id); setMobileMoreOpen(false); }} className={`flex min-w-0 flex-col items-center justify-center gap-0.5 py-2 text-[10px] ${tab === id ? "text-amber-300" : "text-white/60"}`}><span className="text-lg leading-5">{icon}</span>{name.split(" ")[0]}</button>)}<button aria-expanded={mobileMoreOpen} onClick={() => setMobileMoreOpen((open) => !open)} className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] ${mobileMoreOpen || MOBILE_MORE_NAV.some(([id]) => id === tab) ? "text-amber-300" : "text-white/60"}`}><span className="text-lg leading-5">•••</span>More</button></nav>
    {mobileMoreOpen && <div className="fixed right-3 z-30 w-48 rounded-2xl border border-amber-500/25 bg-[#0b111c]/95 p-2 shadow-2xl backdrop-blur-xl lg:hidden" style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }} aria-label="More navigation">{MOBILE_MORE_NAV.map(([id, icon, name]) => <button key={id} onClick={() => { setTab(id); setMobileMoreOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${tab === id ? "bg-amber-400/10 text-amber-300" : "text-white/75 hover:bg-white/5"}`}><span className="w-6 text-center">{icon}</span>{name}</button>)}</div>}

    {detail && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 p-4 backdrop-blur" onClick={() => setDetail(null)}><div role="dialog" aria-modal="true" aria-label={`${detail.name} details`} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl border border-amber-500/30 bg-[#100c15] p-5 md:p-6"><div className="mb-4 flex justify-between"><span className="font-black text-amber-300">STIPHAN STORE / {detail.name.toUpperCase()}</span><button aria-label="Close game details" onClick={() => setDetail(null)} className="text-xl">×</button></div><div className="flex flex-col gap-4 sm:flex-row"><div className={`relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${detail.grad} flex items-center justify-center text-5xl`}>{imageOrFallback(detail.image)}{!detail.image && <span className="relative font-black">{detail.icon}</span>}</div><div className="flex-1"><h3 className="text-2xl font-black">{detail.name}</h3><div className="my-2 flex flex-wrap gap-2">{detail.cat.split(" • ").map((category) => <span key={category} className="rounded-full border border-amber-400/40 px-2 py-0.5 text-xs text-amber-200">{category}</span>)}</div><p className="text-sm leading-6 text-white/70">{detail.desc}</p>{detail.externalUrl && <a href={detail.externalUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-cyan-300">External link ↗</a>}</div></div><div className="mt-5 flex gap-3"><button onClick={() => { if (detail.externalUrl) window.open(detail.externalUrl, "_blank", "noopener,noreferrer"); else launchGame(detail); }} className="flex-1 rounded-xl bg-gradient-to-b from-amber-300 to-amber-600 py-3 font-black text-black">{detail.externalUrl ? "Open game" : "Launch game"}</button><button onClick={() => toggleFav(detail.id)} className="flex-1 rounded-xl border border-white/30 py-3 font-bold">{favs.includes(detail.id) ? "♥ Favorited" : "♡ Add to Favorites"}</button></div><div className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><div className="rounded-xl border border-white/10 p-4"><div className="mb-2 font-bold">How to play</div><p className="leading-6 text-white/70">{detail.instructions || "Game controls and objectives are shown when you start the game."}</p></div><div className="rounded-xl border border-white/10 p-4"><div className="mb-2 font-bold">About this game</div><p className="leading-6 text-white/70">Play in the browser. Controls and touch support vary by game; read the start-screen guide before playing.</p></div></div></div></div>}

    {playing && <div className={playing.id === "brick" ? "fixed inset-0 z-50 flex flex-col overflow-hidden bg-black" : "fixed inset-0 z-50 overflow-auto bg-black/95"}><div className={`flex shrink-0 items-center justify-between border-b border-white/10 bg-black/85 p-3 backdrop-blur ${playing.id === "brick" ? "" : "sticky top-0 z-10"}`}><button onClick={() => setPlaying(null)} className="rounded-xl border border-amber-400 px-4 py-2 font-bold text-amber-300">← Store</button><span className="truncate px-3 font-black">{playing.name}</span><span className="text-sm text-amber-300">S {coins}</span></div>{playing.id === "brick" ? <div className="min-h-0 flex-1"><OriginalBrickFire /></div> : playing.gameUrl && isEmbeddedGameId(playing.id) ? <EmbeddedStoreGame gameId={playing.id} gameUrl={playing.gameUrl} title={playing.name} /> : <div className="p-3 pb-10">{playing.C ? <playing.C /> : playing.sourceHtml ? <iframe title={playing.name} srcDoc={playing.sourceHtml} sandbox="allow-scripts allow-forms allow-pointer-lock" className="w-full min-h-[75vh] rounded-2xl border border-amber-500/20 bg-black" /> : playing.externalUrl ? <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#141019] p-8 text-center"><div className="mb-3 text-5xl text-amber-300">↗</div><h2 className="text-xl font-black">External game</h2><p className="mt-2 text-sm text-white/50">This game is hosted outside STIPHAN STORE.</p><button onClick={() => window.open(playing.externalUrl, "_blank", "noopener,noreferrer")} className="mt-5 rounded-xl bg-amber-400 px-6 py-3 font-black text-black">Open game</button></div> : <div className="py-20 text-center text-white/50">No playable source has been added yet. Use Admin to add an external URL or HTML game source.</div>}</div>}</div>}

    {externalApp && <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4" onClick={() => setExternalApp(null)}><div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-[#100c15] border border-amber-500/30 p-7 text-center"><div className="text-5xl text-amber-300">↗</div><h2 className="text-2xl font-black mt-3">{externalApp.name}</h2><p className="text-white/50 text-sm mt-2">{externalApp.description}</p><button onClick={() => window.open(externalApp.externalUrl, "_blank", "noopener,noreferrer")} className="mt-5 w-full py-3 rounded-xl bg-amber-400 text-black font-black">OPEN APP</button><button onClick={() => setExternalApp(null)} className="mt-2 text-xs text-white/50">Close</button></div></div>}

    {toast && <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl bg-amber-400 text-black font-black shadow-2xl">{toast}</div>}
  </div>;
}
