import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "/vendor/react-jsx-runtime.js";
import { useEffect, useMemo, useState } from "/vendor/react.js";
import BrickFire from "./games/BrickFire.js";
import { Invaders, Racing, Snake, Tetris, Flappy, Pong, Asteroids, Jumper } from "./games/Arcade.js";
import { G2048, Memory, Mines, Connect4, TicTac, Simon, Whack } from "./games/Puzzle.js";
const BUILTIN_GAMES = [
    { id: "brick", name: "STIPHAN Brick Fire", cat: "Arcade • Action", icon: "◉", grad: "from-orange-500 via-pink-600 to-indigo-800", rating: 4.9, C: BrickFire, featured: true, downloadUrl: "/downloads/STIPHAN-BRICK-FIRE-1.0.apk", downloadName: "STIPHAN-BRICK-FIRE-1.0.apk", desc: "The flagship brick breaker with manual 0.5x–3.0x speed control, one-hit blocks, smooth physics and cinematic themes." },
    { id: "racing", name: "Racing Legends", cat: "Racing • Sports", icon: "◈", grad: "from-red-600 via-orange-500 to-yellow-400", rating: 4.6, C: Racing, desc: "Dodge traffic at high speed on an endless neon highway." },
    { id: "invaders", name: "Galaxy Invaders", cat: "Action • Shooter", icon: "✦", grad: "from-fuchsia-600 via-purple-700 to-indigo-900", rating: 4.5, C: Invaders, desc: "Defend the galaxy from escalating alien waves." },
    { id: "asteroids", name: "Asteroid Storm", cat: "Action • Space", icon: "◆", grad: "from-amber-500 via-rose-700 to-slate-900", rating: 4.5, C: Asteroids, desc: "Blast asteroids apart and survive the storm." },
    { id: "tetris", name: "Tetris", cat: "Puzzle • Classic", icon: "▦", grad: "from-cyan-500 via-blue-600 to-violet-800", rating: 4.8, C: Tetris, desc: "Neon falling blocks with ghost piece and hard drop controls." },
    { id: "snake", name: "Snake", cat: "Arcade • Classic", icon: "≈", grad: "from-emerald-400 via-teal-600 to-slate-900", rating: 4.4, C: Snake, desc: "Grow your neon snake and chase a new high score." },
    { id: "flappy", name: "Flappy Wings", cat: "Casual • Arcade", icon: "✈", grad: "from-sky-400 via-cyan-500 to-lime-400", rating: 4.3, C: Flappy, desc: "Tap to fly through the pipes and beat your best score." },
    { id: "jumper", name: "Sky Jumper", cat: "Casual • Platform", icon: "↟", grad: "from-indigo-700 via-purple-500 to-orange-400", rating: 4.5, C: Jumper, desc: "Bounce upward across moving platforms." },
    { id: "pong", name: "Neon Pong", cat: "Sports • Arcade", icon: "▐◉▌", grad: "from-pink-500 via-purple-700 to-cyan-500", rating: 4.2, C: Pong, desc: "Classic pong versus AI in a neon arena." },
    { id: "2048", name: "2048", cat: "Puzzle • Brain", icon: "2048", grad: "from-yellow-400 via-orange-500 to-pink-600", rating: 4.7, C: G2048, desc: "Merge matching tiles and reach 2048." },
    { id: "memory", name: "Memory Match", cat: "Puzzle • Brain", icon: "◇", grad: "from-violet-500 via-fuchsia-600 to-rose-500", rating: 4.4, C: Memory, desc: "Find every matching pair." },
    { id: "mines", name: "Mine Sweep", cat: "Puzzle • Strategy", icon: "×", grad: "from-slate-500 via-slate-700 to-red-900", rating: 4.5, C: Mines, desc: "Classic minesweeper with mobile-friendly controls." },
    { id: "connect", name: "Connect Four", cat: "Board • Strategy", icon: "●", grad: "from-blue-600 via-blue-800 to-yellow-500", rating: 4.6, C: Connect4, desc: "Connect four before the AI does." },
    { id: "tictac", name: "Tic Tac Pro", cat: "Board • Strategy", icon: "×○", grad: "from-cyan-400 via-slate-800 to-pink-500", rating: 4.1, C: TicTac, desc: "A polished tic-tac-toe challenge." },
    { id: "simon", name: "Simon Glow", cat: "Casual • Memory", icon: "◉", grad: "from-red-500 via-green-500 to-blue-600", rating: 4.3, C: Simon, desc: "Repeat the glowing sequence." },
    { id: "whack", name: "Whack Attack", cat: "Casual • Reflex", icon: "✚", grad: "from-green-500 via-lime-600 to-amber-700", rating: 4.4, C: Whack, desc: "Test your reflexes and beat the timer." },
];
const DEFAULT_APPS = [
    { id: "stiphantube", name: "Stiphantube", cat: "Video • Entertainment", icon: "▶", grad: "from-red-500 to-orange-600", rating: 4.9, description: "STIPHAN's video platform entry point.", featured: true, fileId: "builtin-stiphantube", fileName: "STIPHANTUBE.apk", fileType: "application/vnd.android.package-archive", externalUrl: "/downloads/STIPHANTUBE.apk" },
    { id: "photo", name: "Photo Editor Pro", cat: "Tools • Photography", icon: "▣", grad: "from-sky-400 to-blue-600", rating: 4.8, description: "Fast photo editing tools and filters.", featured: true },
    { id: "music", name: "Music Player", cat: "Music • Audio", icon: "♪", grad: "from-pink-500 to-rose-600", rating: 4.7, description: "A clean local music player.", featured: true },
    { id: "pdf", name: "PDF Reader", cat: "Productivity", icon: "PDF", grad: "from-red-500 to-red-700", rating: 4.6, description: "Read and organize PDF documents." },
    { id: "video", name: "Video Downloader", cat: "Tools • Media", icon: "↓", grad: "from-indigo-500 to-violet-700", rating: 4.5, description: "A store listing placeholder for your downloader app." },
    { id: "battery", name: "Battery Saver", cat: "Tools • Utility", icon: "▣", grad: "from-green-400 to-emerald-600", rating: 4.3, description: "Battery utility app listing." },
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
const DEFAULT_THEMES = THEME_SEEDS.map(([name, icon, colors], index) => ({ id: `theme-${index + 1}`, name, icon, bg: `linear-gradient(145deg,${colors})`, price: index < 4 ? 0 : 150 + (index % 5) * 100, description: `Cinematic ${name} theme for the STIPHAN ecosystem.`, featured: index < 8 }));
const NAV = [["home", "⌂", "Home"], ["games", "▣", "Games"], ["apps", "▤", "Apps"], ["themes", "✦", "Themes (30+)"], ["shop", "◈", "Shop"], ["coins", "S", "STIPHAN Coins"], ["favs", "♥", "Favorites"], ["profile", "●", "Profile"], ["admin", "⚙", "Admin"]];
const MOBILE_NAV = NAV.filter(([id]) => ["home", "games", "apps", "themes", "shop"].includes(id));
const FILE_DB = "stiph-store-assets";
const FILE_STORE = "files";
function openFileDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(FILE_DB, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(FILE_STORE, { keyPath: "id" });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
async function putAsset(asset) {
    const db = await openFileDB();
    await new Promise((resolve, reject) => {
        const tx = db.transaction(FILE_STORE, "readwrite");
        tx.objectStore(FILE_STORE).put(asset);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    db.close();
}
async function getAsset(id) {
    const db = await openFileDB();
    const value = await new Promise((resolve, reject) => {
        const req = db.transaction(FILE_STORE, "readonly").objectStore(FILE_STORE).get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    db.close();
    return value;
}
async function deleteAsset(id) {
    const db = await openFileDB();
    await new Promise((resolve, reject) => {
        const tx = db.transaction(FILE_STORE, "readwrite");
        tx.objectStore(FILE_STORE).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    db.close();
}
async function clearAssets() {
    const db = await openFileDB();
    await new Promise((resolve, reject) => {
        const tx = db.transaction(FILE_STORE, "readwrite");
        tx.objectStore(FILE_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    db.close();
}
function fileSizeLabel(size = 0) {
    if (size < 1024 * 1024)
        return `${(size / 1024).toFixed(0)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
function assetCategory(name) {
    const ext = name.split(".").pop()?.toLowerCase();
    return ext === "apk" ? "Android • APK" : ext === "zip" ? "Archive • ZIP" : "Upload • File";
}
function assetIcon(name) {
    const ext = name.split(".").pop()?.toLowerCase();
    return ext === "apk" ? "APK" : ext === "zip" ? "ZIP" : "FILE";
}
function useLS(key, fallback) {
    const [value, setValue] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        }
        catch {
            return fallback;
        }
    });
    useEffect(() => { try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch { } }, [key, value]);
    return [value, setValue];
}
const Stars = ({ rating }) => _jsxs("span", { className: "text-amber-300 text-xs font-black", children: ["\u2605 ", rating.toFixed(1)] });
const H2 = ({ title, more, onMore }) => _jsxs("div", { className: "flex justify-between items-center mb-3 mt-7", children: [_jsx("h2", { className: "text-lg md:text-xl font-black text-white border-l-4 border-amber-400 pl-3", children: title }), more && _jsxs("button", { onClick: onMore, className: "text-sm text-white/60 hover:text-amber-300", children: [more, " \u2192"] })] });
function imageOrFallback(image, className = "") {
    return image ? _jsx("img", { src: image, alt: "", className: `absolute inset-0 w-full h-full object-cover ${className}`, onError: (e) => { e.currentTarget.style.display = "none"; } }) : null;
}
export default function App() {
    const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("admin") === "1" ? "admin" : "home");
    const [coins, setCoins] = useLS("stc", 1250);
    const [favs, setFavs] = useLS("favs", ["brick"]);
    const [owned, setOwned] = useLS("themes", []);
    const [installed, setInstalled] = useLS("apps", []);
    const [claimed, setClaimed] = useLS("claim", "");
    const [customGames, setCustomGames] = useLS("admin_games", []);
    const [gameOverrides, setGameOverrides] = useLS("game_overrides", {});
    const [hiddenGames, setHiddenGames] = useLS("hidden_games", []);
    const [adminApps, setAdminApps] = useLS("admin_apps", []);
    const [uploadedApps, setUploadedApps] = useState([]);
    const [uploadBusy, setUploadBusy] = useState(false);
    const [appOverrides, setAppOverrides] = useLS("app_overrides", {});
    const [hiddenApps, setHiddenApps] = useLS("hidden_apps", []);
    const [themes, setThemes] = useLS("store_themes", DEFAULT_THEMES);
    const [ads, setAds] = useLS("ads_config", { enabled: true, provider: "demo", publisherId: "", slotId: "", bannerText: "STIPHAN STORE • Discover new games & apps" });
    const [adFree, setAdFree] = useLS("ad_free", false);
    const [detail, setDetail] = useState(null);
    const [playing, setPlaying] = useState(null);
    const [externalApp, setExternalApp] = useState(null);
    const [q, setQ] = useState("");
    const [toast, setToast] = useState("");
    const [slide, setSlide] = useState(0);
    const [adminAuthed, setAdminAuthed] = useLS("admin_auth", false);
    const [adminPin, setAdminPin] = useLS("admin_pin", "2468");
    useEffect(() => {
        let alive = true;
        const loadUploaded = async () => {
            try {
                const raw = localStorage.getItem("stiph_uploaded_apps");
                const meta = raw ? JSON.parse(raw) : [];
                const ready = [];
                for (const item of meta) {
                    if (!item.fileId)
                        continue;
                    const asset = await getAsset(item.fileId);
                    if (!asset)
                        continue;
                    const objectUrl = URL.createObjectURL(asset.blob);
                    ready.push({ ...item, externalUrl: objectUrl, image: item.fileType?.startsWith("image/") ? objectUrl : item.image });
                }
                if (alive)
                    setUploadedApps(ready);
            }
            catch { }
        };
        loadUploaded();
        const syncUploaded = () => loadUploaded();
        window.addEventListener("storage", syncUploaded);
        return () => {
            alive = false;
            window.removeEventListener("storage", syncUploaded);
        };
    }, []);
    const persistUploadedMeta = (items) => {
        localStorage.setItem("stiph_uploaded_apps", JSON.stringify(items.map(({ externalUrl, ...rest }) => rest)));
    };
    const uploadStoreFiles = async (files) => {
        if (!files?.length)
            return;
        setUploadBusy(true);
        try {
            const added = [];
            for (const file of Array.from(files)) {
                const ext = file.name.split(".").pop()?.toLowerCase() || "";
                const allowed = ["apk", "zip", "png", "jpg", "jpeg", "webp", "gif"];
                if (!allowed.includes(ext))
                    continue;
                const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                const asset = { id, name: file.name, type: file.type || "application/octet-stream", size: file.size, blob: file, createdAt: Date.now() };
                await putAsset(asset);
                const app = {
                    id, name: file.name.replace(/\.[^.]+$/, ""), cat: assetCategory(file.name), icon: assetIcon(file.name),
                    grad: "from-amber-300 via-yellow-500 to-orange-700", rating: 5, description: `Direct upload • ${file.name} • ${fileSizeLabel(file.size)}`,
                    featured: true, fileId: id, fileName: file.name, fileType: file.type || ext, fileSize: file.size,
                    externalUrl: URL.createObjectURL(file),
                    image: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
                };
                added.push(app);
            }
            if (added.length) {
                setUploadedApps((current) => {
                    const next = [...added, ...current];
                    persistUploadedMeta(next);
                    return next;
                });
                setTab("apps");
                window.scrollTo({ top: 0, behavior: "smooth" });
                flash(`${added.length} file${added.length > 1 ? "s" : ""} uploaded • Published in Apps`);
            }
            else {
                flash("Choose APK, ZIP, or image files");
            }
        }
        catch {
            flash("Upload failed on this browser");
        }
        finally {
            setUploadBusy(false);
        }
    };
    const removeUploadedApp = async (id) => {
        const item = uploadedApps.find((x) => x.id === id);
        if (item?.externalUrl)
            URL.revokeObjectURL(item.externalUrl);
        await deleteAsset(id).catch(() => { });
        setUploadedApps((current) => {
            const next = current.filter((x) => x.id !== id);
            persistUploadedMeta(next);
            return next;
        });
        flash("Upload removed");
    };
    const allGames = useMemo(() => [...BUILTIN_GAMES.map((g) => ({ ...g, ...(gameOverrides[g.id] || {}) })), ...customGames].filter((g) => !hiddenGames.includes(g.id)), [customGames, gameOverrides, hiddenGames]);
    const allApps = useMemo(() => [...DEFAULT_APPS.map((a) => ({ ...a, ...(appOverrides[a.id] || {}) })), ...adminApps, ...uploadedApps].filter((a) => !hiddenApps.includes(a.id)), [adminApps, appOverrides, hiddenApps, uploadedApps]);
    const today = new Date().toDateString();
    const flash = (message) => { setToast(message); window.setTimeout(() => setToast(""), 1800); };
    const claim = () => { if (claimed === today)
        return flash("Already claimed today"); setCoins((c) => c + 150); setClaimed(today); flash("+150 STC claimed"); };
    const toggleFav = (id) => setFavs((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id]);
    const launchGame = (g) => { setDetail(null); setPlaying(g); setCoins((c) => c + 5); };
    const launchExternalApp = (a) => { if (!a.externalUrl)
        return flash("Add an external URL from Admin first"); setExternalApp(a); };
    useEffect(() => { const t = window.setInterval(() => setSlide((s) => (s + 1) % Math.max(1, Math.min(3, allGames.length))), 5000); return () => window.clearInterval(t); }, [allGames.length]);
    const filteredGames = allGames.filter((g) => `${g.name} ${g.cat} ${g.desc}`.toLowerCase().includes(q.toLowerCase()));
    const filteredApps = allApps.filter((a) => `${a.name} ${a.cat} ${a.description}`.toLowerCase().includes(q.toLowerCase()));
    const filteredThemes = themes.filter((t) => `${t.name} ${t.description}`.toLowerCase().includes(q.toLowerCase()));
    const heroGame = allGames[slide % Math.min(3, allGames.length)] || allGames[0];
    const GameCard = ({ game, featured }) => (_jsxs("article", { onClick: () => setDetail(game), className: "group cursor-pointer rounded-2xl overflow-hidden bg-[#141019] border border-white/10 hover:border-amber-400/70 hover:-translate-y-1 transition shadow-xl", children: [_jsxs("div", { className: `relative aspect-[4/3] bg-gradient-to-br ${game.grad} flex items-center justify-center overflow-hidden`, children: [imageOrFallback(game.image), featured && _jsx("span", { className: "absolute top-2 left-2 text-[10px] font-black bg-amber-400 text-black px-2 py-1 rounded", children: "FEATURED" }), _jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,#fff5,transparent_48%),linear-gradient(to_top,#0009,transparent_65%)]" }), _jsx("span", { className: "relative text-5xl md:text-6xl font-black text-white/90 drop-shadow-[0_8px_20px_rgba(0,0,0,.7)] group-hover:scale-110 transition", children: game.icon }), _jsx("button", { "aria-label": "Favorite", onClick: (e) => { e.stopPropagation(); toggleFav(game.id); }, className: "absolute top-2 right-2 w-8 h-8 rounded-full bg-black/45 border border-white/20", children: favs.includes(game.id) ? "♥" : "♡" })] }), _jsxs("div", { className: "p-3", children: [_jsx("div", { className: "font-bold text-white text-sm truncate", children: game.name }), _jsx("div", { className: "text-xs text-white/50 truncate", children: game.cat }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsx(Stars, { rating: game.rating }), game.downloadUrl ? _jsx("a", { href: game.downloadUrl, download: game.downloadName || "download.apk", onClick: (e) => e.stopPropagation(), className: "text-xs font-black px-3 py-1.5 rounded-lg bg-gradient-to-b from-amber-300 to-amber-600 text-black", children: "Download APK" }) : _jsx("button", { onClick: (e) => { e.stopPropagation(); launchGame(game); }, className: "text-xs font-black px-3 py-1.5 rounded-lg bg-gradient-to-b from-amber-300 to-amber-600 text-black", children: "Play" })] })] })] }));
    const AppCard = ({ app }) => {
        const isInstalled = installed.includes(app.id);
        return _jsxs("article", { className: "rounded-2xl bg-[#141019] border border-white/10 p-3 flex gap-3 items-center hover:border-amber-400/60 transition", children: [_jsxs("div", { className: `relative w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br ${app.grad} flex items-center justify-center overflow-hidden text-2xl font-black`, children: [imageOrFallback(app.image), _jsx("span", { className: "relative", children: app.icon })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-sm font-bold text-white truncate", children: app.name }), _jsx("div", { className: "text-xs text-white/50 truncate", children: app.cat }), _jsx(Stars, { rating: app.rating })] }), app.fileId && app.externalUrl ? _jsx("a", { href: app.externalUrl, download: app.fileName || app.name, className: "text-xs px-3 py-1.5 rounded-lg border border-amber-400/60 text-amber-300", children: "Download" }) : _jsx("button", { onClick: () => { if (isInstalled && app.externalUrl)
                        return launchExternalApp(app); setInstalled((x) => isInstalled ? x.filter((id) => id !== app.id) : [...x, app.id]); flash(isInstalled ? "Removed from installed list" : `${app.name} installed`); }, className: "text-xs px-3 py-1.5 rounded-lg border border-amber-400/60 text-amber-300", children: isInstalled ? "Open" : "Install" })] });
    };
    const ThemeCard = ({ theme }) => {
        const own = theme.price === 0 || owned.includes(theme.id);
        return _jsxs("article", { className: "rounded-2xl overflow-hidden border border-white/10 hover:border-amber-400/70 transition group bg-[#141019]", children: [_jsxs("div", { className: "aspect-[4/3] relative flex items-center justify-center overflow-hidden", style: { background: theme.bg }, children: [imageOrFallback(theme.image), _jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#fff5,transparent_45%),linear-gradient(to_top,#0009,transparent)]" }), _jsx("div", { className: "absolute inset-x-5 top-5 grid grid-cols-6 gap-1 opacity-60", children: Array.from({ length: 18 }, (_, i) => _jsx("div", { className: "h-2 rounded bg-white/60" }, i)) }), _jsx("span", { className: "relative text-5xl font-black text-white drop-shadow-lg group-hover:scale-125 transition", children: theme.icon })] }), _jsxs("div", { className: "p-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-bold text-white", children: theme.name }), _jsx("div", { className: "text-[10px] text-white/50 mt-0.5", children: theme.description })] }), _jsx("span", { className: "text-[10px] border border-amber-400/60 text-amber-300 px-1.5 rounded", children: theme.price ? "Premium" : "Free" })] }), _jsx("button", { onClick: () => { if (own)
                                return flash(`${theme.name} applied`); if (coins < theme.price)
                                return flash("Not enough STC"); setCoins((c) => c - theme.price); setOwned((x) => [...x, theme.id]); flash(`Unlocked ${theme.name}`); }, className: "w-full mt-3 text-xs font-black px-2 py-2 rounded bg-amber-400 text-black", children: own ? "Apply Theme" : `Unlock • ${theme.price} STC` })] })] });
    };
    useEffect(() => {
        if (ads.provider !== "adsense" || !ads.publisherId || !ads.enabled || adFree)
            return;
        const existing = document.querySelector("script[data-stiphan-adsense]");
        if (existing)
            return;
        const script = document.createElement("script");
        script.async = true;
        script.crossOrigin = "anonymous";
        script.dataset.stiphanAdsense = "true";
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ads.publisherId)}`;
        document.head.appendChild(script);
    }, [ads.provider, ads.publisherId, ads.enabled, adFree]);
    useEffect(() => {
        if (ads.provider !== "adsense" || !ads.publisherId || !ads.slotId || !ads.enabled || adFree)
            return;
        const timer = window.setTimeout(() => { const w = window; w.adsbygoogle = w.adsbygoogle || []; try {
            w.adsbygoogle.push({});
        }
        catch { } }, 150);
        return () => window.clearTimeout(timer);
    }, [ads.provider, ads.publisherId, ads.slotId, ads.enabled, adFree]);
    const AdSlot = ({ compact = false }) => !ads.enabled || adFree ? null : _jsx("div", { className: `my-5 rounded-2xl border border-amber-500/20 bg-black/50 overflow-hidden ${compact ? "p-3" : "p-4"}`, children: ads.provider === "demo" ? _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-amber-300 text-xs font-black", children: "SPONSORED" }), _jsx("span", { className: "text-white/60 text-xs flex-1", children: ads.bannerText }), _jsx("button", { onClick: () => setAdFree(true), className: "text-[10px] border border-white/20 px-2 py-1 rounded text-white/60", children: "Hide demo ads" })] }) : ads.publisherId && ads.slotId ? _jsx("ins", { className: "adsbygoogle", style: { display: "block" }, "data-ad-client": ads.publisherId, "data-ad-slot": ads.slotId, "data-ad-format": "auto", "data-full-width-responsive": "true" }) : _jsx("div", { className: "text-center text-xs text-white/40", children: "Add AdSense publisher and slot IDs in Admin." }) });
    const resetAll = () => { clearAssets().catch(() => { }); ["stc", "favs", "themes", "apps", "claim", "admin_games", "admin_apps", "stiph_uploaded_apps", "store_themes", "ads_config", "ad_free", "admin_auth"].forEach((k) => localStorage.removeItem(k)); window.location.reload(); };
    const Home = () => _jsxs(_Fragment, { children: [_jsxs("section", { className: "relative rounded-3xl overflow-hidden border border-amber-500/30 min-h-[290px] md:min-h-[360px] shadow-[0_0_50px_rgba(255,174,0,.08)]", children: [_jsx("img", { src: "/hero.jpg", alt: "STIPHAN STORE", className: "absolute inset-0 w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/10" }), _jsxs("div", { className: "relative p-6 md:p-10 max-w-2xl", children: [_jsxs("span", { className: "inline-block bg-red-600 text-white text-xs font-black px-3 py-1 rounded-lg", children: ["\uD83D\uDD25 FEATURED GAME #", slide + 1] }), _jsx("h1", { className: "text-3xl md:text-5xl font-black text-white mt-3 leading-tight uppercase", children: heroGame?.name || "STIPHAN STORE" }), _jsx("p", { className: "text-white/80 mt-2 max-w-xl", children: heroGame?.desc }), _jsxs("div", { className: "flex flex-wrap gap-3 mt-6", children: [_jsx("button", { onClick: () => launchGame(heroGame), className: "px-6 py-3 rounded-xl bg-gradient-to-b from-amber-300 to-amber-600 text-black font-black shadow-[0_0_30px_rgba(255,180,0,.4)]", children: "\u25B6 PLAY NOW" }), _jsx("button", { onClick: () => setTab("themes"), className: "px-6 py-3 rounded-xl border border-white/40 text-white font-bold hover:bg-white/10", children: "EXPLORE THEMES" })] })] }), _jsx("div", { className: "absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2", children: [0, 1, 2].map((k) => _jsx("button", { onClick: () => setSlide(k), className: `h-2 rounded-full transition-all ${k === slide ? "w-7 bg-amber-400" : "w-2 bg-white/40"}` }, k)) })] }), _jsx(AdSlot, {}), _jsx(H2, { title: "Featured Games", more: "View All", onMore: () => setTab("games") }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3", children: allGames.slice(0, 10).map((g, i) => _jsx(GameCard, { game: g, featured: i === 0 || g.featured }, g.id)) }), _jsx(H2, { title: "Featured Apps", more: "View All", onMore: () => setTab("apps") }), _jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3", children: allApps.filter((a) => a.featured).slice(0, 6).map((a) => _jsx(AppCard, { app: a }, a.id)) }), _jsx(H2, { title: `Cinematic Themes (${themes.length}+)`, more: "View All", onMore: () => setTab("themes") }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3", children: themes.filter((t) => t.featured).slice(0, 5).map((t) => _jsx(ThemeCard, { theme: t }, t.id)) })] });
    const Shop = () => _jsxs(_Fragment, { children: [_jsx(H2, { title: "STIPHAN Shop" }), _jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3", children: [
                    ["✦", "Premium Theme Pack", `Unlock all ${themes.length} themes`, 2500], ["ϟ", "Game Boost", "2× play rewards for 24 hours", 800], ["×", "Ad Free", "Hide the store's demo ad layer", 600], ["S", "Coin Bundle", "Get 1,000 STC", 0]
                ].map(([icon, name, desc, price]) => _jsxs("div", { className: "rounded-2xl bg-[#141019] border border-white/10 p-5 flex items-center gap-4", children: [_jsx("div", { className: "text-4xl text-amber-300", children: icon }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-bold text-white", children: name }), _jsx("div", { className: "text-xs text-white/50", children: desc })] }), _jsx("button", { onClick: () => { const p = Number(price); if (!p) {
                                setCoins((c) => c + 1000);
                                return flash("+1,000 STC");
                            } if (coins < p)
                                return flash("Not enough STC"); setCoins((c) => c - p); if (String(name) === "Premium Theme Pack")
                                setOwned(themes.map((t) => t.id)); if (String(name) === "Ad Free")
                                setAdFree(true); flash(`${name} purchased`); }, className: "px-3 py-2 rounded-lg bg-amber-400 text-black text-xs font-black", children: Number(price) ? `S ${price}` : "FREE" })] }, String(name))) })] });
    const Coins = () => _jsxs(_Fragment, { children: [_jsx(H2, { title: "STIPHAN Coins" }), _jsxs("div", { className: "rounded-3xl p-8 text-center bg-gradient-to-br from-amber-900/50 to-black border border-amber-500/40", children: [_jsx("div", { className: "text-white/60", children: "Current Balance" }), _jsxs("div", { className: "text-5xl font-black text-amber-300 my-2", children: ["S ", coins.toLocaleString(), " STC"] }), _jsx("button", { onClick: claim, className: "mt-3 px-8 py-3 rounded-xl bg-gradient-to-b from-amber-300 to-amber-600 text-black font-black", children: claimed === today ? "✓ Claimed today" : "Claim Daily +150 STC" })] }), _jsx(H2, { title: "Earn More Coins" }), _jsx("div", { className: "space-y-2", children: [["▶", "Play any game", "+5 STC per session", () => setTab("games")], ["↗", "Share Store", "+100 STC", async () => { try {
                            await navigator.clipboard?.writeText(location.href);
                        }
                        catch { } setCoins((c) => c + 100); flash("Link copied • +100 STC"); }]].map(([i, n, r, f]) => _jsxs("button", { onClick: f, className: "w-full flex items-center gap-3 p-4 rounded-2xl bg-[#141019] border border-white/10 text-left hover:border-amber-400", children: [_jsx("span", { className: "text-2xl text-amber-300", children: i }), _jsx("span", { className: "flex-1 text-white font-bold", children: n }), _jsx("span", { className: "text-amber-300 text-sm font-black", children: r })] }, String(n))) })] });
    const Admin = () => {
        const [pin, setPin] = useState("");
        const [appUploadProgress, setAppUploadProgress] = useState(0);
        const [appUploadStatus, setAppUploadStatus] = useState("");
        const [gameForm, setGameForm] = useState({ id: "", name: "", cat: "Action • Arcade", icon: "✦", grad: "from-cyan-500 via-blue-600 to-violet-800", rating: "4.5", desc: "", image: "", externalUrl: "", sourceHtml: "" });
        const [appForm, setAppForm] = useState({ id: "", name: "", cat: "Tools", icon: "▣", grad: "from-blue-500 to-violet-700", rating: "4.5", description: "", image: "", externalUrl: "", fileId: "", fileName: "", fileType: "", fileSize: 0 });
        const [themeForm, setThemeForm] = useState({ id: "", name: "", icon: "✦", bg: "linear-gradient(145deg,#00e5ff,#7c4dff,#0a0020)", price: "150", description: "Cinematic theme", image: "" });
        if (!adminAuthed)
            return _jsxs("div", { className: "max-w-md mx-auto mt-10 rounded-3xl border border-amber-500/30 bg-[#141019] p-7", children: [_jsx("div", { className: "text-2xl font-black", children: "Admin Panel" }), _jsx("p", { className: "text-white/50 text-sm mt-1", children: "Local store management. Default PIN: 2468" }), _jsx("input", { type: "password", value: pin, onChange: (e) => setPin(e.target.value), placeholder: "Admin PIN", className: "w-full mt-5 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-400" }), _jsx("button", { onClick: () => pin === adminPin ? setAdminAuthed(true) : flash("Incorrect PIN"), className: "w-full mt-3 py-3 rounded-xl bg-amber-400 text-black font-black", children: "Enter Admin" })] });
        const input = (value, onChange, placeholder, area = false) => area ? _jsx("textarea", { value: value, onChange: (e) => onChange(e.target.value), placeholder: placeholder, rows: 5, className: "w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400" }) : _jsx("input", { value: value, onChange: (e) => onChange(e.target.value), placeholder: placeholder, className: "w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400" });
        const imageUpload = (onLoaded) => _jsxs("label", { className: "block text-xs text-white/50", children: ["Upload image", _jsx("input", { type: "file", accept: "image/*", onChange: (e) => { const file = e.target.files?.[0]; if (!file)
                        return; const reader = new FileReader(); reader.onload = () => onLoaded(String(reader.result)); reader.readAsDataURL(file); }, className: "mt-1 w-full text-xs text-white/50" })] });
        const saveGame = (e) => { e.preventDefault(); if (!gameForm.name.trim())
            return flash("Game name is required"); const id = gameForm.id.trim() || `custom-${Date.now()}`; const item = { id, name: gameForm.name.trim(), cat: gameForm.cat, icon: gameForm.icon || "✦", grad: gameForm.grad, rating: Number(gameForm.rating) || 4.5, desc: gameForm.desc || "Custom STIPHAN STORE game.", image: gameForm.image || undefined, externalUrl: gameForm.externalUrl || undefined, sourceHtml: gameForm.sourceHtml || undefined }; if (BUILTIN_GAMES.some((x) => x.id === id))
            setGameOverrides((x) => ({ ...x, [id]: item }));
        else
            setCustomGames((items) => [...items.filter((x) => x.id !== id), item]); setHiddenGames((x) => x.filter((v) => v !== id)); flash("Game saved"); setGameForm({ id: "", name: "", cat: "Action • Arcade", icon: "✦", grad: "from-cyan-500 via-blue-600 to-violet-800", rating: "4.5", desc: "", image: "", externalUrl: "", sourceHtml: "" }); };
        const saveApp = (e) => { e.preventDefault(); if (!appForm.name.trim())
            return flash("App name is required"); const id = appForm.id.trim() || `app-${Date.now()}`; const item = { id, name: appForm.name.trim(), cat: appForm.cat, icon: appForm.icon || "▣", grad: appForm.grad, rating: Number(appForm.rating) || 4.5, description: appForm.description || "Custom STIPHAN STORE app.", image: appForm.image || undefined, externalUrl: appForm.externalUrl || undefined, fileId: appForm.fileId || undefined, fileName: appForm.fileName || undefined, fileType: appForm.fileType || undefined, fileSize: appForm.fileSize || undefined };
        if (appForm.fileId) {
            setUploadedApps((items) => { const next = items.map((x) => x.id === appForm.fileId ? { ...x, ...item, id: x.id, externalUrl: x.externalUrl || item.externalUrl } : x); persistUploadedMeta(next); return next; });
            setTab("apps");
        } else if (DEFAULT_APPS.some((x) => x.id === id))
            setAppOverrides((x) => ({ ...x, [id]: item }));
        else
            setAdminApps((items) => [...items.filter((x) => x.id !== id), item]); setHiddenApps((x) => x.filter((v) => v !== id)); flash("App saved • published in Apps"); setAppForm({ id: "", name: "", cat: "Tools", icon: "▣", grad: "from-blue-500 to-violet-700", rating: "4.5", description: "", image: "", externalUrl: "", fileId: "", fileName: "", fileType: "", fileSize: 0 }); };
        const saveTheme = (e) => { e.preventDefault(); if (!themeForm.name.trim())
            return flash("Theme name is required"); const id = themeForm.id.trim() || `theme-${Date.now()}`; const item = { id, name: themeForm.name.trim(), icon: themeForm.icon || "✦", bg: themeForm.bg, price: Number(themeForm.price) || 0, description: themeForm.description, image: themeForm.image || undefined }; setThemes((items) => [...items.filter((x) => x.id !== id), item]); flash("Theme saved"); setThemeForm({ id: "", name: "", icon: "✦", bg: "linear-gradient(145deg,#00e5ff,#7c4dff,#0a0020)", price: "150", description: "Cinematic theme", image: "" }); };
        const editGame = (g) => setGameForm({ id: g.id, name: g.name, cat: g.cat, icon: g.icon, grad: g.grad, rating: String(g.rating), desc: g.desc, image: g.image || "", externalUrl: g.externalUrl || "", sourceHtml: g.sourceHtml || "" });
        const editApp = (a) => setAppForm({ id: a.id, name: a.name, cat: a.cat, icon: a.icon, grad: a.grad, rating: String(a.rating), description: a.description, image: a.image || "", externalUrl: a.externalUrl || "", fileId: a.fileId || "", fileName: a.fileName || "", fileType: a.fileType || "", fileSize: a.fileSize || 0 });
        const editTheme = (t) => setThemeForm({ id: t.id, name: t.name, icon: t.icon, bg: t.bg, price: String(t.price), description: t.description, image: t.image || "" });
        return _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx(H2, { title: "Admin Dashboard" }), _jsx("p", { className: "text-white/50 text-sm -mt-4", children: "Manage store content from this browser without editing React files." })] }), _jsx("button", { onClick: () => setAdminAuthed(false), className: "px-3 py-2 rounded-lg border border-white/15 text-xs", children: "Lock Admin" })] }), _jsxs("section", { className: "grid xl:grid-cols-2 gap-4", children: [_jsxs("form", { onSubmit: saveGame, className: "rounded-2xl bg-[#141019] border border-white/10 p-5 space-y-3", children: [_jsx("h3", { className: "font-black text-amber-300", children: "Add / Edit Game" }), input(gameForm.id, (v) => setGameForm({ ...gameForm, id: v }), "ID (leave blank for new)"), input(gameForm.name, (v) => setGameForm({ ...gameForm, name: v }), "Game name *"), input(gameForm.cat, (v) => setGameForm({ ...gameForm, cat: v }), "Category"), input(gameForm.icon, (v) => setGameForm({ ...gameForm, icon: v }), "Icon / short mark"), input(gameForm.grad, (v) => setGameForm({ ...gameForm, grad: v }), "Tailwind gradient classes"), input(gameForm.rating, (v) => setGameForm({ ...gameForm, rating: v }), "Rating"), input(gameForm.image, (v) => setGameForm({ ...gameForm, image: v }), "Image URL (optional)"), imageUpload((v) => setGameForm({ ...gameForm, image: v })), input(gameForm.externalUrl, (v) => setGameForm({ ...gameForm, externalUrl: v }), "External game URL (optional)"), input(gameForm.desc, (v) => setGameForm({ ...gameForm, desc: v }), "Long description"), input(gameForm.sourceHtml, (v) => setGameForm({ ...gameForm, sourceHtml: v }), "Paste custom HTML/JS game source (runs in a sandbox)", true), _jsx("button", { className: "w-full py-2.5 rounded-xl bg-amber-400 text-black font-black", children: "Save Game" })] }), _jsxs("form", { onSubmit: saveApp, className: "rounded-2xl bg-[#141019] border border-white/10 p-5 space-y-3", children: [_jsx("h3", { className: "font-black text-amber-300", children: "Add / Edit App" }), input(appForm.id, (v) => setAppForm({ ...appForm, id: v }), "ID (leave blank for new)"), input(appForm.name, (v) => setAppForm({ ...appForm, name: v }), "App name *"), input(appForm.cat, (v) => setAppForm({ ...appForm, cat: v }), "Category"), input(appForm.icon, (v) => setAppForm({ ...appForm, icon: v }), "Icon / short mark"), input(appForm.grad, (v) => setAppForm({ ...appForm, grad: v }), "Tailwind gradient classes"), input(appForm.rating, (v) => setAppForm({ ...appForm, rating: v }), "Rating"), input(appForm.image, (v) => setAppForm({ ...appForm, image: v }), "Image URL"), imageUpload((v) => setAppForm({ ...appForm, image: v })), input(appForm.externalUrl, (v) => setAppForm({ ...appForm, externalUrl: v }), "External app URL (optional)"), _jsxs("label", { className: "block text-xs text-white/60 rounded-xl border border-amber-500/20 bg-black/20 p-3", children: [_jsxs("div", { className: "font-bold text-amber-300 mb-1", children: ["Upload APK / ZIP", appForm.fileName ? _jsxs("span", { className: "ml-2 text-white/50 font-normal", children: ["• ", appForm.fileName] }) : null] }), _jsx("input", { type: "file", accept: ".apk,.zip,application/vnd.android.package-archive,application/zip", className: "mt-1 w-full text-xs", onChange: async (e) => { const file = e.target.files?.[0]; e.currentTarget.value = ""; if (!file) return; const ext = file.name.split(".").pop()?.toLowerCase() || ""; if (!["apk","zip"].includes(ext)) return flash("Choose an APK or ZIP file"); setAppUploadProgress(5); setAppUploadStatus("Preparing upload…"); try { const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; setAppUploadProgress(20); await putAsset({ id, name: file.name, type: file.type || "application/octet-stream", size: file.size, blob: file, createdAt: Date.now() }); setAppUploadProgress(85); const url = URL.createObjectURL(file); const uploaded = { id, name: appForm.name.trim() || file.name.replace(/\.[^.]+$/, ""), cat: appForm.cat || (ext === "apk" ? "Android • APK" : "Archive • ZIP"), icon: appForm.icon || ext.toUpperCase(), grad: appForm.grad || "from-amber-300 via-yellow-500 to-orange-700", rating: Number(appForm.rating) || 5, description: appForm.description || `Uploaded app • ${file.name} • ${fileSizeLabel(file.size)}`, featured: true, fileId: id, fileName: file.name, fileType: file.type || ext, fileSize: file.size, externalUrl: url }; setUploadedApps((items) => { const next = [uploaded, ...items.filter((x) => x.id !== id)]; persistUploadedMeta(next); return next; }); setAppForm((f) => ({ ...f, id, name: f.name || uploaded.name, cat: uploaded.cat, icon: uploaded.icon, fileId: id, fileName: uploaded.fileName, fileType: uploaded.fileType, fileSize: uploaded.fileSize, externalUrl: url })); setAppUploadProgress(100); setAppUploadStatus("100% • Published in Apps now"); flash("100% • ZIP/APK is live in Apps"); } catch { setAppUploadProgress(0); setAppUploadStatus(""); flash("Upload failed on this browser"); } } })] }), appUploadProgress > 0 && _jsxs("div", { className: "rounded-xl border border-amber-500/25 bg-black/30 p-3", children: [_jsxs("div", { className: "flex justify-between text-xs mb-2", children: [_jsx("span", { className: "text-amber-300 font-bold", children: appUploadStatus || "Uploading…" }), _jsxs("span", { className: "text-white/60", children: [appUploadProgress, "%"] })] }), _jsx("div", { className: "h-2 rounded-full bg-white/10 overflow-hidden", children: _jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all", style: { width: `${appUploadProgress}%` } }) })] }), input(appForm.description, (v) => setAppForm({ ...appForm, description: v }), "Long description", true), _jsx("button", { className: "w-full py-2.5 rounded-xl bg-amber-400 text-black font-black", children: "Save / Update App Details" })] })] }), _jsx("section", { className: "rounded-2xl bg-[#141019] border border-white/10 p-5", children: _jsxs("form", { onSubmit: saveTheme, className: "grid md:grid-cols-2 gap-3", children: [_jsx("div", { className: "md:col-span-2", children: _jsx("h3", { className: "font-black text-amber-300 mb-2", children: "Add / Edit Theme" }) }), input(themeForm.id, (v) => setThemeForm({ ...themeForm, id: v }), "ID (blank for new)"), input(themeForm.name, (v) => setThemeForm({ ...themeForm, name: v }), "Theme name *"), input(themeForm.icon, (v) => setThemeForm({ ...themeForm, icon: v }), "Theme mark"), input(themeForm.price, (v) => setThemeForm({ ...themeForm, price: v }), "STC price"), input(themeForm.bg, (v) => setThemeForm({ ...themeForm, bg: v }), "CSS background / gradient"), input(themeForm.image, (v) => setThemeForm({ ...themeForm, image: v }), "Image URL"), imageUpload((v) => setThemeForm({ ...themeForm, image: v })), input(themeForm.description, (v) => setThemeForm({ ...themeForm, description: v }), "Description", true), _jsx("button", { className: "md:col-span-2 py-2.5 rounded-xl bg-amber-400 text-black font-black", children: "Save Theme" })] }) }), _jsxs("section", { className: "rounded-2xl bg-[#141019] border border-amber-500/20 p-5 shadow-[0_0_35px_rgba(245,158,11,.05)]", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-black text-amber-300 text-lg", children: "Direct Upload Vault" }), _jsx("p", { className: "text-xs text-white/45 mt-1", children: "Upload APK, ZIP, or app artwork straight from your phone. Built-in store files are included with this release. New uploads are saved in this browser." })] }), _jsxs("label", { className: `cursor-pointer px-5 py-3 rounded-xl bg-gradient-to-b from-amber-300 to-amber-600 text-black font-black text-sm ${uploadBusy ? "opacity-50 pointer-events-none" : ""}`, children: [uploadBusy ? "UPLOADING…" : "＋ UPLOAD FILES", _jsx("input", { type: "file", multiple: true, accept: "*/*", className: "hidden", onChange: (e) => { uploadStoreFiles(e.target.files); e.currentTarget.value = ""; } })] })] }), _jsx("div", { className: "rounded-xl border border-dashed border-amber-500/25 bg-black/20 p-4 text-center text-xs text-white/45", children: "Tip: select multiple APK/ZIP files at once from your Android file manager." }), uploadedApps.length > 0 && _jsx("div", { className: "grid md:grid-cols-2 gap-2 mt-4", children: uploadedApps.map((a) => _jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3", children: [_jsx("div", { className: `w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${a.grad} flex items-center justify-center text-[10px] font-black text-black`, children: a.icon }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("div", { className: "font-bold truncate", children: a.name }), _jsxs("div", { className: "text-[10px] text-white/45", children: [a.fileName, " \u2022 ", fileSizeLabel(a.fileSize)] })] }), _jsx("a", { href: a.externalUrl, download: a.fileName, className: "text-xs text-amber-300 font-bold", children: "Download" }), _jsx("button", { onClick: () => removeUploadedApp(a.id), className: "text-xs text-red-400", children: "Delete" })] }, a.id)) })] }), _jsxs("section", { className: "rounded-2xl bg-[#141019] border border-white/10 p-5", children: [_jsx("h3", { className: "font-black text-amber-300 mb-3", children: "Ads & Store Settings" }), _jsxs("div", { className: "grid md:grid-cols-2 gap-3", children: [_jsxs("label", { className: "flex items-center gap-3 rounded-xl border border-white/10 p-3", children: [_jsx("input", { type: "checkbox", checked: ads.enabled, onChange: (e) => setAds({ ...ads, enabled: e.target.checked }) }), " Enable ads layer"] }), _jsxs("select", { value: ads.provider, onChange: (e) => setAds({ ...ads, provider: e.target.value }), className: "bg-black/40 border border-white/10 rounded-xl px-3", children: [_jsx("option", { value: "demo", children: "Demo ad layer" }), _jsx("option", { value: "adsense", children: "AdSense configured" })] }), input(ads.publisherId, (v) => setAds({ ...ads, publisherId: v }), "AdSense publisher ID"), input(ads.slotId, (v) => setAds({ ...ads, slotId: v }), "AdSense slot ID"), input(ads.bannerText, (v) => setAds({ ...ads, bannerText: v }), "Ad banner text"), input(adminPin, (v) => setAdminPin(v || "2468"), "Admin PIN")] }), _jsx("p", { className: "text-xs text-white/40 mt-3", children: "The UI stores publisher/slot IDs for your deployment. A live AdSense account still requires Google's approval and its own script/verification." })] }), _jsxs("section", { className: "grid xl:grid-cols-3 gap-4", children: [_jsxs("div", { className: "rounded-2xl bg-[#141019] border border-white/10 p-5", children: [_jsxs("h3", { className: "font-black text-amber-300 mb-3", children: ["Games (", allGames.length, ")"] }), allGames.map((g) => _jsxs("div", { className: "flex items-center gap-2 border-b border-white/5 py-2", children: [_jsx("span", { className: "flex-1 text-sm truncate", children: g.name }), _jsx("button", { onClick: () => editGame(g), className: "text-xs text-amber-300", children: "Edit" }), _jsx("button", { onClick: () => { if (BUILTIN_GAMES.some((x) => x.id === g.id))
                                                setHiddenGames((x) => [...new Set([...x, g.id])]);
                                            else
                                                setCustomGames((x) => x.filter((i) => i.id !== g.id)); }, className: "text-xs text-red-400", children: "Delete" })] }, g.id))] }), _jsxs("div", { className: "rounded-2xl bg-[#141019] border border-white/10 p-5", children: [_jsxs("h3", { className: "font-black text-amber-300 mb-3", children: ["Apps (", allApps.length, ")"] }), allApps.map((a) => _jsxs("div", { className: "flex items-center gap-2 border-b border-white/5 py-2", children: [_jsx("span", { className: "flex-1 text-sm truncate", children: a.name }), _jsx("button", { onClick: () => editApp(a), className: "text-xs text-amber-300", children: "Edit" }), _jsx("button", { onClick: () => { if (DEFAULT_APPS.some((x) => x.id === a.id))
                                                setHiddenApps((x) => [...new Set([...x, a.id])]);
                                            else
                                                setAdminApps((x) => x.filter((i) => i.id !== a.id)); }, className: "text-xs text-red-400", children: "Delete" })] }, a.id))] }), _jsxs("div", { className: "rounded-2xl bg-[#141019] border border-white/10 p-5", children: [_jsxs("h3", { className: "font-black text-amber-300 mb-3", children: ["Themes (", themes.length, ")"] }), themes.map((t) => _jsxs("div", { className: "flex items-center gap-2 border-b border-white/5 py-2", children: [_jsx("span", { className: "flex-1 text-sm truncate", children: t.name }), _jsx("button", { onClick: () => editTheme(t), className: "text-xs text-amber-300", children: "Edit" }), !DEFAULT_THEMES.some((d) => d.id === t.id) && _jsx("button", { onClick: () => setThemes((x) => x.filter((i) => i.id !== t.id)), className: "text-xs text-red-400", children: "Delete" })] }, t.id))] })] }), _jsx("button", { onClick: () => { if (window.confirm("Reset all local STIPHAN STORE data?"))
                        resetAll(); }, className: "px-4 py-2 rounded-xl border border-red-500/30 text-red-300 text-sm", children: "Reset local store data" })] });
    };
    const pages = {
        home: _jsx(Home, {}),
        games: _jsxs(_Fragment, { children: [_jsx(H2, { title: `Games (${filteredGames.length})` }), _jsx(AdSlot, { compact: true }), filteredGames.length ? _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3", children: filteredGames.map((g) => _jsx(GameCard, { game: g }, g.id)) }) : _jsx("p", { className: "text-white/50", children: "No games match your search." })] }),
        apps: _jsxs(_Fragment, { children: [_jsx(H2, { title: `Apps (${filteredApps.length})` }), _jsx(AdSlot, { compact: true }), _jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3", children: filteredApps.map((a) => _jsx(AppCard, { app: a }, a.id)) })] }),
        themes: _jsxs(_Fragment, { children: [_jsx(H2, { title: `${themes.length} Cinematic Themes` }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3", children: filteredThemes.map((t) => _jsx(ThemeCard, { theme: t }, t.id)) })] }),
        shop: _jsx(Shop, {}),
        coins: _jsx(Coins, {}),
        favs: _jsxs(_Fragment, { children: [_jsx(H2, { title: "Favorites" }), favs.length ? _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3", children: allGames.filter((g) => favs.includes(g.id)).map((g) => _jsx(GameCard, { game: g }, g.id)) }) : _jsx("p", { className: "text-white/50", children: "No favorites yet \u2014 tap \u2661 on a game." })] }),
        profile: _jsx(_Fragment, { children: _jsxs("div", { className: "rounded-3xl p-8 text-center bg-[#141019] border border-white/10 max-w-md mx-auto mt-6", children: [_jsx("div", { className: "w-20 h-20 mx-auto rounded-full bg-gradient-to-b from-amber-300 to-amber-700 flex items-center justify-center text-4xl font-black text-black", children: "S" }), _jsx("div", { className: "text-xl font-black text-white mt-3", children: "STIPHAN USER" }), _jsx("div", { className: "text-xs text-white/50", children: "Store account & game library" }), _jsx("div", { className: "grid grid-cols-3 gap-2 mt-5", children: [[allGames.length, "Games"], [`${owned.length}/${themes.length}`, "Themes"], [coins.toLocaleString(), "Coins"]].map(([a, b]) => _jsxs("div", { className: "rounded-xl bg-black/40 p-3", children: [_jsx("div", { className: "text-amber-300 font-black", children: a }), _jsx("div", { className: "text-[10px] text-white/50", children: b })] }, String(b))) }), _jsxs("div", { className: "grid gap-2 mt-5", children: [_jsx("button", { onClick: () => setTab("admin"), className: "py-2 rounded-xl border border-amber-400/40 text-amber-300", children: "Open Admin Panel" }), _jsx("button", { onClick: () => { setAdFree(false); flash("Ads restored"); }, className: "py-2 rounded-xl border border-white/10 text-white/60", children: "Restore demo ads" }), _jsx("button", { onClick: () => { if (window.confirm("Reset local store data?"))
                                    resetAll(); }, className: "py-2 text-sm text-red-400", children: "Reset local store data" })] })] }) }),
        admin: _jsx(Admin, {}),
    };
    return _jsxs("div", { className: "min-h-screen bg-[#07050b] text-white font-sans bg-[radial-gradient(ellipse_at_top,#2a1a05_0%,transparent_50%)]", children: [_jsxs("aside", { className: "hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col p-4 border-r border-amber-500/20 bg-black/70 backdrop-blur-xl z-30", children: [_jsxs("div", { className: "flex items-center gap-2 mb-7", children: [_jsx("div", { className: "w-11 h-11 rounded-xl bg-gradient-to-b from-amber-300 to-amber-700 flex items-center justify-center text-2xl font-black text-black", children: "S" }), _jsxs("div", { className: "leading-none", children: [_jsx("div", { className: "font-black text-lg", children: "STIPHAN" }), _jsx("div", { className: "font-black text-amber-400", children: "STORE" })] })] }), NAV.map(([id, icon, name]) => _jsxs("button", { onClick: () => setTab(id), className: `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-semibold transition ${tab === id ? "bg-amber-500/15 border border-amber-400 text-white" : "text-white/70 hover:bg-white/5"}`, children: [_jsx("span", { className: "w-5 text-center", children: icon }), name] }, id)), _jsxs("div", { className: "mt-auto rounded-2xl p-4 border border-amber-500/40 bg-gradient-to-b from-amber-900/30 to-black text-center", children: [_jsx("div", { className: "text-amber-300 font-black", children: "STIPHAN COINS" }), _jsx("div", { className: "text-xs text-white/60", children: "Daily reward" }), _jsx("div", { className: "text-4xl my-2 text-amber-300", children: "S" }), _jsx("button", { onClick: claim, className: "text-xs px-4 py-1.5 rounded-lg border border-amber-400 text-amber-300", children: "Claim +150" })] })] }), _jsxs("div", { className: "lg:pl-60 pb-24 lg:pb-8", children: [_jsxs("header", { className: "sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 py-3 bg-[#07050b]/90 backdrop-blur-xl border-b border-white/5", children: [_jsx("div", { className: "lg:hidden w-9 h-9 rounded-lg bg-gradient-to-b from-amber-300 to-amber-700 flex items-center justify-center font-black text-black", children: "S" }), _jsx("input", { value: q, onChange: (e) => { const value = e.target.value; setQ(value); if (value && !["games", "apps", "themes"].includes(tab))
                                    setTab("games"); }, placeholder: "Search games, apps, themes...", className: "flex-1 max-w-2xl bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400" }), _jsxs("button", { onClick: () => setTab("coins"), className: "px-3 py-1.5 rounded-full border border-amber-500/50 bg-black font-black text-sm", children: ["S ", coins.toLocaleString()] }), _jsx("button", { onClick: () => setTab("profile"), className: "w-9 h-9 rounded-full border-2 border-amber-400 bg-white/10", children: "\u25CF" })] }), _jsx("main", { className: "p-4 md:p-6 max-w-7xl mx-auto", children: pages[tab] || pages.home })] }), _jsx("nav", { className: "lg:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 bg-black/95 backdrop-blur-xl border-t border-amber-500/20", children: MOBILE_NAV.map(([id, icon, name]) => _jsxs("button", { onClick: () => setTab(id), className: `py-2 text-[10px] flex flex-col items-center ${tab === id ? "text-amber-400" : "text-white/60"}`, children: [_jsx("span", { className: "text-lg", children: icon }), name.split(" ")[0]] }, id)) }), detail && _jsx("div", { className: "fixed inset-0 z-40 bg-black/85 backdrop-blur flex items-center justify-center p-4", onClick: () => setDetail(null), children: _jsxs("div", { onClick: (e) => e.stopPropagation(), className: "w-full max-w-3xl rounded-3xl bg-[#100c15] border border-amber-500/30 p-5 md:p-6 max-h-[90vh] overflow-auto", children: [_jsxs("div", { className: "flex justify-between mb-4", children: [_jsxs("span", { className: "font-black text-amber-300", children: ["STIPHAN STORE / ", detail.name.toUpperCase()] }), _jsx("button", { onClick: () => setDetail(null), className: "text-xl", children: "\u00D7" })] }), _jsxs("div", { className: "flex gap-4 flex-col sm:flex-row", children: [_jsxs("div", { className: `relative w-32 h-32 shrink-0 rounded-2xl bg-gradient-to-br ${detail.grad} flex items-center justify-center text-5xl overflow-hidden`, children: [imageOrFallback(detail.image), _jsx("span", { className: "relative font-black", children: detail.icon })] }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-2xl font-black", children: detail.name }), _jsxs("div", { className: "flex flex-wrap gap-2 my-2", children: [detail.cat.split(" • ").map((c) => _jsx("span", { className: "text-xs px-2 py-0.5 rounded-full border border-blue-400/50 text-blue-300", children: c }, c)), _jsx(Stars, { rating: detail.rating })] }), _jsx("p", { className: "text-white/70 text-sm leading-6", children: detail.desc }), detail.externalUrl && _jsx("a", { href: detail.externalUrl, target: "_blank", rel: "noreferrer", className: "inline-block mt-2 text-xs text-cyan-300", children: "External link \u2197" })] })] }), _jsxs("div", { className: "flex gap-3 mt-5", children: [_jsx("button", { onClick: () => { if (detail.externalUrl)
                                        window.open(detail.externalUrl, "_blank", "noopener,noreferrer");
                                    else
                                        launchGame(detail); }, className: "flex-1 py-3 rounded-xl bg-gradient-to-b from-amber-300 to-amber-600 text-black font-black", children: detail.externalUrl ? "↗ OPEN GAME" : "▶ LAUNCH GAME" }), _jsx("button", { onClick: () => toggleFav(detail.id), className: "flex-1 py-3 rounded-xl border border-white/30 font-bold", children: favs.includes(detail.id) ? "♥ Favorited" : "♡ Add to Favorites" })] }), _jsxs("div", { className: "grid sm:grid-cols-2 gap-3 mt-5 text-sm", children: [_jsxs("div", { className: "rounded-xl border border-white/10 p-4", children: [_jsx("div", { className: "font-bold mb-2", children: "Game Features" }), ["Smooth responsive controls", "Touch + keyboard support", "Neon visual effects", "STIPHAN Coins rewards"].map((f) => _jsxs("div", { className: "text-white/70", children: ["\u2713 ", f] }, f))] }), _jsxs("div", { className: "rounded-xl border border-white/10 p-4", children: [_jsx("div", { className: "font-bold mb-2", children: "System" }), ["Android 5.0+", "iOS 11+ / modern Safari", "Chrome, Firefox, Edge", "Responsive web layout"].map((f) => _jsxs("div", { className: "text-white/70", children: ["\u2022 ", f] }, f))] })] })] }) }), playing && _jsxs("div", { className: "fixed inset-0 z-50 bg-black/95 overflow-auto", children: [_jsxs("div", { className: "flex justify-between items-center p-3 sticky top-0 bg-black/85 backdrop-blur z-10 border-b border-white/10", children: [_jsx("button", { onClick: () => setPlaying(null), className: "px-4 py-2 rounded-xl border border-amber-400 text-amber-300 font-bold", children: "\u2190 Store" }), _jsx("span", { className: "font-black truncate px-3", children: playing.name }), _jsxs("span", { className: "text-sm text-amber-300", children: ["S ", coins] })] }), _jsx("div", { className: "p-3 pb-10", children: playing.C ? _jsx(playing.C, {}) : playing.sourceHtml ? _jsx("iframe", { title: playing.name, srcDoc: playing.sourceHtml, sandbox: "allow-scripts allow-forms allow-pointer-lock", className: "w-full min-h-[75vh] rounded-2xl border border-amber-500/20 bg-black" }) : playing.externalUrl ? _jsxs("div", { className: "max-w-xl mx-auto rounded-2xl bg-[#141019] border border-white/10 p-8 text-center", children: [_jsx("div", { className: "text-5xl text-amber-300 mb-3", children: "\u2197" }), _jsx("h2", { className: "text-xl font-black", children: "External game" }), _jsx("p", { className: "text-white/50 text-sm mt-2", children: "This game is hosted outside STIPHAN STORE." }), _jsx("button", { onClick: () => window.open(playing.externalUrl, "_blank", "noopener,noreferrer"), className: "mt-5 px-6 py-3 rounded-xl bg-amber-400 text-black font-black", children: "Open game" })] }) : _jsx("div", { className: "text-center text-white/50 py-20", children: "No playable source has been added yet. Use Admin to add an external URL or HTML game source." }) })] }), externalApp && _jsx("div", { className: "fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4", onClick: () => setExternalApp(null), children: _jsxs("div", { onClick: (e) => e.stopPropagation(), className: "w-full max-w-lg rounded-3xl bg-[#100c15] border border-amber-500/30 p-7 text-center", children: [_jsx("div", { className: "text-5xl text-amber-300", children: "\u2197" }), _jsx("h2", { className: "text-2xl font-black mt-3", children: externalApp.name }), _jsx("p", { className: "text-white/50 text-sm mt-2", children: externalApp.description }), _jsx("button", { onClick: () => window.open(externalApp.externalUrl, "_blank", "noopener,noreferrer"), className: "mt-5 w-full py-3 rounded-xl bg-amber-400 text-black font-black", children: "OPEN APP" }), _jsx("button", { onClick: () => setExternalApp(null), className: "mt-2 text-xs text-white/50", children: "Close" })] }) }), toast && _jsx("div", { className: "fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl bg-amber-400 text-black font-black shadow-2xl", children: toast })] });
}
