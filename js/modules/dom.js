// Helpers para crear elementos sin usar innerHTML.
// ¿Por qué? innerHTML interpreta texto como HTML: si un dato trae "<script>" o
// "<img onerror=...>", se ejecuta. textContent y createElement nunca lo hacen.

/**
 * Crea un elemento HTML.
 * el('a', { class: 'btn', href: '#' }, 'Texto')  →  <a class="btn" href="#">Texto</a>
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  setAttrs(node, attrs);
  node.append(...children.flat().filter((c) => c != null && c !== false));
  return node;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Igual que el(), pero para SVG (necesita su propio "namespace"). */
export function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  setAttrs(node, attrs);
  node.append(...children.flat().filter((c) => c != null && c !== false));
  return node;
}

function setAttrs(node, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === 'text') node.textContent = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value === true ? '' : value);
  }
}

/** Trae un JSON y avisa con un error claro si falla. */
export async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`No se pudo cargar ${path} (${res.status})`);
  return res.json();
}

/** true si el usuario pidió menos animaciones en su sistema operativo. */
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
