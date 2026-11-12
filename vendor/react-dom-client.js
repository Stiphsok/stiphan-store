// Local ReactDOM client loader with CDN fallbacks.
let D;
try { D = await import("https://cdn.jsdelivr.net/npm/react-dom@19.2.6/client/+esm"); }
catch (e1) { try { D = await import("https://esm.sh/react-dom@19.2.6/client"); } catch (e2) { D = await import("https://unpkg.com/react-dom@19.2.6/client.js?module"); } }
export const createRoot = D.createRoot;
