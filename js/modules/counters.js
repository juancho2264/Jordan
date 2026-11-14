// Contadores animados: de 0 al valor de data-count cuando entran en pantalla.
import { reducedMotion } from './dom.js';

const DURATION = 1400; // ms
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function format(value, decimals) {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function animate(node) {
  const target = Number(node.dataset.count);
  const decimals = Number(node.dataset.decimals ?? 0);

  if (reducedMotion()) {
    node.textContent = format(target, decimals);
    return;
  }

  const start = performance.now();
  // requestAnimationFrame sincroniza con el refresco de pantalla (más fluido que setInterval)
  const tick = (now) => {
    const progress = Math.min((now - start) / DURATION, 1);
    node.textContent = format(target * easeOutCubic(progress), decimals);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function initCounters() {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animate(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-count]').forEach((n) => io.observe(n));
}
