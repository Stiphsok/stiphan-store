// Local JSX runtime shim; avoids import-map failures on static hosting.
let R;
try { R = await import("https://cdn.jsdelivr.net/npm/react@19.2.6/+esm"); }
catch (e1) { try { R = await import("https://esm.sh/react@19.2.6"); } catch (e2) { R = await import("https://unpkg.com/react@19.2.6/index.js?module"); } }
const React = R.default || R;
export const Fragment = React.Fragment;
export function jsx(type, props, key) { return React.createElement(type, key == null ? props : {...(props||{}), key}); }
export const jsxs = jsx;
