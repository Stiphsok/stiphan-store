import { useEffect, useRef, useState } from "react";
import originalHtml from "./brick-fire-original.html?raw";

const STORAGE_KEYS = [
  "stiphans_coins",
  "stiphans_best_score",
  "stiphans_best_combo",
  "stiphans_lang",
] as const;

function prepareOriginalHtml(
  source: string,
  initialStorage: Partial<Record<(typeof STORAGE_KEYS)[number], string>>,
): string {
  const storageBridge = `<script>(() => {
  const allowed = new Set(${JSON.stringify(STORAGE_KEYS)});
  const values = new Map(Object.entries(${JSON.stringify(initialStorage).replace(/</g, "\\u003c")}));
  const storage = {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { key = String(key); return values.has(key) ? values.get(key) : null; },
    setItem(key, value) {
      key = String(key); value = String(value);
      if (!allowed.has(key)) return;
      values.set(key, value);
      parent.postMessage({ type: "brick-fire-storage", key, value }, "*");
    },
    removeItem(key) {
      key = String(key);
      if (!allowed.has(key)) return;
      values.delete(key);
      parent.postMessage({ type: "brick-fire-storage-remove", key }, "*");
    },
    clear() {
      for (const key of allowed) this.removeItem(key);
    }
  };
  Object.defineProperty(window, "localStorage", { configurable: true, value: storage });
})();</script>`;
  const policy = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src 'none'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">`;
  const prepared = source.replace("</head>", `${policy}${storageBridge}</head>`);
  if (prepared === source) throw new Error("The original game HTML is missing its head element.");
  return prepared;
}

export default function OriginalBrickFire() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const initialStorage = STORAGE_KEYS.reduce<Partial<Record<(typeof STORAGE_KEYS)[number], string>>>((values, key) => {
        const value = localStorage.getItem(key);
        if (value !== null && value.length <= 64) values[key] = value;
        return values;
      }, {});
      setHtml(prepareOriginalHtml(originalHtml, initialStorage));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The original game could not be loaded.");
    }
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== frame.current?.contentWindow || event.origin !== "null") return;
      if (typeof event.data !== "object" || event.data === null) return;
      const message = event.data as { type?: unknown; key?: unknown; value?: unknown };
      const key = typeof message.key === "string" ? STORAGE_KEYS.find((candidate) => candidate === message.key) : undefined;
      if (!key) return;
      if (message.type === "brick-fire-storage" && typeof message.value === "string" && message.value.length <= 64) {
        localStorage.setItem(key, message.value);
      } else if (message.type === "brick-fire-storage-remove") {
        localStorage.removeItem(key);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (error) return <div role="alert" className="p-6 text-center text-red-200">{error}</div>;
  if (!html) return <div role="status" className="p-6 text-center text-amber-200">Loading original STIPHAN Brick Fire…</div>;

  return (
    <iframe
      ref={frame}
      title="Original STIPHAN Brick Fire"
      srcDoc={html}
      sandbox="allow-scripts"
      className="block h-full w-full border-0 bg-[#02030a]"
    />
  );
}
