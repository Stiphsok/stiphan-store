import { useEffect, useRef, useState } from "react";

const STORAGE_KEYS = {
  "troll-platformer": ["stiphan_game_save_v1", "stiphan_claimed_tokens"],
  puzzle: ["stiphan_puzzle_stats_v1", "stiphan_puzzle_sound_v1", "stiphan_puzzle_theme_v1"],
  millionaire: ["millionaire_player_name", "millionaire_currency", "millionaire_custom_questions", "millionaire_history"],
} as const;

export type EmbeddedGameId = keyof typeof STORAGE_KEYS;

export function isEmbeddedGameId(gameId: string): gameId is EmbeddedGameId {
  return Object.prototype.hasOwnProperty.call(STORAGE_KEYS, gameId);
}

const MAX_STORAGE_VALUE_LENGTH = 256_000;

function parentStorageKey(gameId: EmbeddedGameId, key: string) {
  return `stiph_embedded_${gameId}_${key}`;
}

function prepareGameHtml(source: string, gameId: EmbeddedGameId, initialStorage: Record<string, string>, storeOrigin: string) {
  const allowedKeys = STORAGE_KEYS[gameId];
  const serializedStorage = JSON.stringify(initialStorage).replace(/</g, "\\u003c");
  const policy = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https://fonts.googleapis.com; img-src ${storeOrigin} data: blob: https:; font-src data: https://fonts.gstatic.com; media-src data: blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">`;
  const storageBridge = `<script>(() => {
    const gameId = ${JSON.stringify(gameId)};
    const allowed = new Set(${JSON.stringify(allowedKeys)});
    const values = new Map(Object.entries(${serializedStorage}));
    const notify = (type, key, value) => parent.postMessage({ type, gameId, key, value }, "*");
    const storage = {
      get length() { return values.size; },
      key(index) { return [...values.keys()][index] ?? null; },
      getItem(key) { key = String(key); return values.has(key) ? values.get(key) : null; },
      setItem(key, value) {
        key = String(key); value = String(value);
        if (!allowed.has(key)) return;
        if (value.length > ${MAX_STORAGE_VALUE_LENGTH}) throw new DOMException("Game storage item is too large.", "QuotaExceededError");
        values.set(key, value);
        notify("store-game-storage", key, value);
      },
      removeItem(key) {
        key = String(key);
        if (!allowed.has(key)) return;
        values.delete(key);
        notify("store-game-storage-remove", key);
      },
      clear() {
        for (const key of allowed) this.removeItem(key);
      }
    };
    Object.defineProperty(window, "localStorage", { configurable: true, value: storage });
  })();</script>`;
  const headCloseIndex = source.lastIndexOf("</head>");
  if (headCloseIndex === -1) throw new Error("The embedded game page is missing its head element.");
  return `${source.slice(0, headCloseIndex)}${policy}${storageBridge}${source.slice(headCloseIndex)}`;
}

export default function EmbeddedStoreGame({ gameId, gameUrl, title }: { gameId: EmbeddedGameId; gameUrl: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setHtml("");
    setError("");

    void (async () => {
      try {
        const response = await fetch(gameUrl, { signal: controller.signal });
        if (!response.ok) throw new Error(`Game page returned HTTP ${response.status}.`);
        const source = await response.text();
        const initialStorage = STORAGE_KEYS[gameId].reduce<Record<string, string>>((values, key) => {
          const value = localStorage.getItem(parentStorageKey(gameId, key));
          if (value !== null && value.length <= MAX_STORAGE_VALUE_LENGTH) values[key] = value;
          return values;
        }, {});
        setHtml(prepareGameHtml(source, gameId, initialStorage, window.location.origin));
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "The embedded game could not be loaded.");
      }
    })();

    return () => controller.abort();
  }, [gameId, gameUrl]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== frame.current?.contentWindow || event.origin !== "null") return;
      if (typeof event.data !== "object" || event.data === null) return;

      const message = event.data as { type?: unknown; gameId?: unknown; key?: unknown; value?: unknown };
      if (message.gameId !== gameId || typeof message.key !== "string") return;
      const key = STORAGE_KEYS[gameId].find((candidate) => candidate === message.key);
      if (!key) return;

      try {
        if (message.type === "store-game-storage" && typeof message.value === "string" && message.value.length <= MAX_STORAGE_VALUE_LENGTH) {
          localStorage.setItem(parentStorageKey(gameId, key), message.value);
        } else if (message.type === "store-game-storage-remove") {
          localStorage.removeItem(parentStorageKey(gameId, key));
        }
      } catch (cause) {
        console.error(`Could not persist ${title} game data.`, cause);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [gameId, title]);

  if (error) return <div role="alert" className="p-6 text-center text-red-200">{title} could not be loaded: {error}</div>;
  if (!html) return <div role="status" className="p-6 text-center text-amber-200">Loading {title}…</div>;

  return (
    <iframe
      ref={frame}
      title={title}
      srcDoc={html}
      sandbox="allow-scripts allow-forms allow-pointer-lock"
      allow="fullscreen"
      className="block h-[calc(100dvh-4.25rem)] min-h-[32rem] w-full border-0 bg-black"
    />
  );
}
