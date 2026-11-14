// Trivia con puntaje. Patrón: un objeto "state" + una función render() que
// dibuja la pantalla según ese estado. Si el estado cambia, se vuelve a dibujar.
import { el } from './dom.js';

/** Mezcla un array (algoritmo Fisher-Yates) sin modificar el original. */
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function initTrivia(questions) {
  const root = document.getElementById('trivia-app');
  let state;

  const reset = () => {
    state = {
      questions: shuffle(questions).map((q) => ({ ...q, options: shuffle(q.options) })),
      index: 0,
      score: 0,
      picked: null, // la opción elegida en la pregunta actual (null = todavía no respondió)
    };
    render();
  };

  const answer = (option) => {
    if (state.picked !== null) return; // evita responder dos veces
    state.picked = option;
    if (option === state.questions[state.index].answer) state.score++;
    render();
    root.querySelector('.trivia__next')?.focus();
  };

  const next = () => {
    state.index++;
    state.picked = null;
    render();
    root.querySelector('.trivia__option')?.focus();
  };

  function render() {
    const total = state.questions.length;
    if (state.index >= total) return renderResult(total);

    const q = state.questions[state.index];
    const answered = state.picked !== null;

    const options = q.options.map((option) => {
      let status = '';
      if (answered && option === q.answer) status = ' is-correct';
      else if (answered && option === state.picked) status = ' is-wrong';
      return el('button', {
        class: `trivia__option${status}`,
        type: 'button',
        disabled: answered,
        onclick: () => answer(option),
        text: option,
      });
    });

    // Ojo: replaceChildren() convierte false/undefined en texto ("false").
    // Por eso armamos la lista y filtramos los vacíos con .filter(Boolean).
    const parts = [
      el('div', { class: 'trivia__top' },
        el('span', { text: `Pregunta ${state.index + 1} de ${total}` }),
        el('span', { text: `Puntaje: ${state.score}` }),
      ),
      el('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': state.index },
        el('span', { style: `width: ${(state.index / total) * 100}%` }),
      ),
      el('h3', { class: 'trivia__q', text: q.q }),
      el('div', { class: 'trivia__options' }, options),
      answered && el('div', { class: 'trivia__feedback' },
        el('p', {},
          el('strong', { text: state.picked === q.answer ? '¡Correcto! ' : 'Casi. ' }),
          q.why,
        ),
        el('button', {
          class: 'btn trivia__next',
          type: 'button',
          onclick: next,
          text: state.index + 1 < total ? 'Siguiente →' : 'Ver resultado →',
        }),
      ),
    ];
    root.replaceChildren(...parts.filter(Boolean));
  }

  function renderResult(total) {
    const ratio = state.score / total;
    const message =
      ratio === 1 ? 'Perfecto. Sabés más que un comentarista de la NBA.'
      : ratio >= 0.6 ? 'Muy bien. Se nota que viste los partidos.'
      : 'Hay que repasar. Volvé a la línea de tiempo y probá otra vez.';

    root.replaceChildren(
      el('p', { class: 'kicker', text: 'Resultado' }),
      el('p', { class: 'trivia__score', text: `${state.score}/${total}` }),
      el('p', { text: message }),
      el('button', { class: 'btn', type: 'button', onclick: reset, text: 'Jugar de nuevo' }),
    );
  }

  reset();
}
