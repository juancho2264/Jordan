// Punto de entrada: carga los datos y arranca cada parte de la página.
import { loadJSON, el } from './modules/dom.js';
import { initNav, initReveal } from './modules/nav.js';
import { initCounters } from './modules/counters.js';
import { initChart } from './modules/chart.js';
import { renderTimeline, renderMoments } from './modules/sections.js';
import { initTrivia } from './modules/trivia.js';

initNav();
initCounters();

try {
  // Promise.all descarga los 4 archivos en paralelo, no uno detrás del otro
  const [stats, timeline, moments, trivia] = await Promise.all([
    loadJSON('data/stats.json'),
    loadJSON('data/timeline.json'),
    loadJSON('data/moments.json'),
    loadJSON('data/trivia.json'),
  ]);

  initChart(stats);
  renderTimeline(timeline);
  renderMoments(moments);
  initTrivia(trivia);
} catch (error) {
  console.error(error);
  document.getElementById('temporadas').append(
    el('p', { class: 'error', text: 'No se pudieron cargar los datos. Si abriste el archivo directo, usá un servidor local (ver README).' }),
  );
} finally {
  // Se ejecuta siempre: así las animaciones funcionan aunque falle la carga
  initReveal();
}
