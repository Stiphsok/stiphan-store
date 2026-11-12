// STIPHAN runtime loader: CDN fallback chain
let R;
try { R = await import("https://cdn.jsdelivr.net/npm/react@19.2.6/+esm"); }
catch (e1) { try { R = await import("https://esm.sh/react@19.2.6"); } catch (e2) { R = await import("https://unpkg.com/react@19.2.6/index.js?module"); } }
export const useEffect = R.useEffect;
export const useMemo = R.useMemo;
export const useState = R.useState;
export const useRef = R.useRef;
export const useCallback = R.useCallback;
export const StrictMode = R.StrictMode;
export const createElement = R.createElement;
export const Fragment = R.Fragment;
export default R.default || R;
