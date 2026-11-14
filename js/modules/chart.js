// Gráfico de barras en SVG hecho a mano, sin librerías.
// Idea clave: una "escala" convierte un valor (ej. 30.1 puntos) en píxeles.
import { el, svg } from './dom.js';

const W = 960;
const H = 400;
const M = { top: 48, right: 16, bottom: 48, left: 44 }; // márgenes
const INNER_W = W - M.left - M.right;
const INNER_H = H - M.top - M.bottom;

// Configuración de cada estadística: nombre y tope del eje Y
const STATS = {
  pts: { label: 'Puntos', max: 40, step: 10 },
  reb: { label: 'Rebotes', max: 10, step: 2 },
  ast: { label: 'Asistencias', max: 10, step: 2 },
  stl: { label: 'Robos', max: 4, step: 1 },
};

const TEAMS = { CHI: 'Chicago Bulls', WAS: 'Washington Wizards' };
const GAP_WIDTH = 0.6; // los huecos (retiros) ocupan menos que una temporada

// "1995-96" → "95-96"
const shortSeason = (s) => `${s.slice(2, 4)}-${s.slice(-2)}`;

// 30.1 → "30,1" (formato argentino, igual que los contadores)
const fmt = (v) => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function initChart({ carrera, temporadas, fuente }) {
  const root = document.getElementById('chart');
  const detail = document.getElementById('season-detail');
  const picker = document.getElementById('stat-picker');
  document.getElementById('chart-source').textContent = `Fuente: ${fuente}.`;

  // Estado del componente: qué estadística y qué temporada están elegidas
  const state = { stat: 'pts', selected: '1995-96' };

  // Precalculamos la posición X de cada columna (no cambia al cambiar de estadística)
  const units = temporadas.reduce((sum, t) => sum + (t.gap ? GAP_WIDTH : 1), 0);
  const unitW = INNER_W / units;
  let cursor = M.left;
  const columns = temporadas.map((t) => {
    const width = (t.gap ? GAP_WIDTH : 1) * unitW;
    const col = { ...t, x: cursor, width };
    cursor += width;
    return col;
  });

  function render() {
    const { max, step, label } = STATS[state.stat];
    const y = (v) => M.top + INNER_H * (1 - v / max); // la escala
    const baseline = y(0);

    const grid = [];
    for (let v = 0; v <= max; v += step) {
      grid.push(
        svg('line', { class: 'grid', x1: M.left, x2: W - M.right, y1: y(v), y2: y(v) }),
        svg('text', { class: 'axis', x: M.left - 10, y: y(v) + 4, 'text-anchor': 'end', text: v }),
      );
    }

    const bars = columns.map((c) => (c.gap ? gapColumn(c, baseline) : barColumn(c, y, baseline, label)));

    // Línea punteada con el promedio de carrera
    const avg = carrera[state.stat];
    const avgLine = svg('g', { class: 'avg' },
      svg('line', { x1: M.left, x2: W - M.right, y1: y(avg), y2: y(avg) }),
      svg('text', { x: W - M.right, y: y(avg) - 8, 'text-anchor': 'end', text: `Promedio de carrera: ${fmt(avg)}` }),
    );

    // replaceChildren borra todo y agrega lo nuevo en una sola operación
    root.replaceChildren(...grid, ...bars, avgLine);
    renderDetail();
  }

  function barColumn(c, y, baseline, label) {
    const value = c[state.stat];
    const barW = c.width * 0.62;
    const bx = c.x + (c.width - barW) / 2;
    const cx = c.x + c.width / 2;
    const isSelected = c.season === state.selected;

    const select = () => { state.selected = c.season; render(); };

    return svg('g', {
      class: `bar bar--${c.team.toLowerCase()}${isSelected ? ' is-selected' : ''}`,
      tabindex: 0,
      role: 'button',
      'aria-pressed': String(isSelected),
      'aria-label': `${c.season}, ${TEAMS[c.team]}: ${fmt(value)} ${label.toLowerCase()} por partido${c.champion ? ', campeón' : ''}`,
      onclick: select,
      onkeydown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
      },
    },
      // rect "invisible" que agranda el área clickeable a toda la columna
      svg('rect', { class: 'bar__hit', x: c.x, y: M.top, width: c.width, height: INNER_H + M.bottom }),
      svg('rect', { class: 'bar__fill', x: bx, y: y(value), width: barW, height: baseline - y(value), rx: 2 }),
      svg('text', { class: 'bar__value', x: cx, y: y(value) - 8, 'text-anchor': 'middle', text: fmt(value) }),
      c.champion && svg('circle', { class: 'bar__ring', cx, cy: y(value) - 30, r: 6 }),
      svg('text', { class: 'axis', x: cx, y: baseline + 22, 'text-anchor': 'middle', text: shortSeason(c.season) }),
    );
  }

  function gapColumn(c, baseline) {
    const cx = c.x + c.width / 2;
    return svg('g', { class: 'gap', 'aria-hidden': 'true' },
      svg('line', { x1: cx, x2: cx, y1: M.top + 20, y2: baseline - 80 }), // deja lugar al texto vertical
      svg('text', { x: cx, y: baseline - 12, 'text-anchor': 'start', 'dominant-baseline': 'middle', transform: `rotate(-90 ${cx} ${baseline - 12})`, text: c.label }),
    );
  }

  function renderDetail() {
    const t = temporadas.find((s) => s.season === state.selected);
    const statRows = Object.entries(STATS).map(([key, { label }]) =>
      el('div', { class: key === state.stat ? 'is-active' : null },
        el('dt', { text: label }),
        el('dd', { text: fmt(t[key]) }),
      ),
    );

    // Uso un contenedor el() porque filtra los valores vacíos (false/undefined).
    // replaceChildren() directo los convertiría en el texto "undefined".
    detail.replaceChildren(el('div', {},
      el('p', { class: 'kicker', text: TEAMS[t.team] }),
      el('h3', { class: 'detail__title', text: t.season }),
      el('p', { class: 'muted', text: `${t.games} partidos jugados` }),
      el('dl', { class: 'detail__stats' }, statRows),
      t.awards.length > 0 && el('ul', { class: 'chips' }, t.awards.map((a) =>
        el('li', { class: a === 'Campeón NBA' ? 'chip chip--gold' : 'chip', text: a }),
      )),
      t.note && el('p', { class: 'detail__note', text: t.note }),
    ));
  }

  // Delegación de eventos: un solo listener en el grupo en vez de uno por botón
  picker.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-stat]');
    if (!btn) return;
    state.stat = btn.dataset.stat;
    picker.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    render();
  });

  render();
}
