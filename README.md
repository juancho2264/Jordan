# Michael Jordan · 23 — una carrera contada con datos

Página interactiva que recorre la carrera de Michael Jordan temporada por temporada.
Los datos viven en archivos JSON y JavaScript los convierte en gráficos, línea de tiempo y trivia.

**Demo:** https://juancho2264.github.io/Jordan/

## Qué tiene

- **Gráfico interactivo hecho a mano en SVG**: puntos, rebotes, asistencias o robos por temporada, con las temporadas campeonas marcadas, los años de retiro y el promedio de carrera. Tocá una barra para ver el detalle.
- **Contadores animados** que arrancan cuando entran en pantalla.
- **Línea de tiempo** y **trivia con puntaje**, generadas desde JSON.
- **Videos en `<dialog>` nativo**: el iframe de YouTube se carga recién al abrirlo.
- **Accesible**: navegable con teclado, `aria-*` en los componentes, enlace "saltar al contenido" y respeto por `prefers-reduced-motion`.
- **Responsive**, mobile-first.

## Decisiones técnicas

| Decisión | Por qué |
|---|---|
| HTML, CSS y JS sin librerías ni frameworks | Mostrar los fundamentos. Sin dependencias que se rompan o pesen |
| Datos separados del código (`/data/*.json`) | Cambiar o agregar contenido sin tocar el HTML |
| Módulos ES (`import`/`export`) | Cada archivo tiene una sola responsabilidad |
| Elementos creados con `createElement` y `textContent` | Evita inyección de HTML (XSS) que trae `innerHTML` |
| `IntersectionObserver` en lugar de eventos `scroll` | Menos trabajo para el navegador y más fluidez |
| Sin imágenes de terceros | El "23" de la portada es tipografía con contorno |

## Estructura

```
├── index.html
├── css/styles.css
├── js/
│   ├── main.js            # punto de entrada: carga datos e inicia todo
│   └── modules/
│       ├── dom.js         # helpers el(), svg(), loadJSON()
│       ├── nav.js         # menú móvil, scroll spy, animaciones de aparición
│       ├── counters.js    # contadores animados
│       ├── chart.js       # gráfico SVG + panel de detalle
│       ├── sections.js    # línea de tiempo y momentos (videos)
│       └── trivia.js      # trivia con estado y puntaje
└── data/
    ├── stats.json         # estadísticas por temporada
    ├── timeline.json
    ├── moments.json
    └── trivia.json
```

## Correrlo en tu compu

Los módulos y `fetch()` no funcionan abriendo el archivo con doble click (`file://`); hace falta un servidor local:

```bash
npx serve .
```

O con la extensión **Live Server** de VS Code.

## Fuentes

Estadísticas de temporada regular: [Basketball-Reference](https://www.basketball-reference.com/players/j/jordami01.html).
Proyecto personal sin fines comerciales.

---

Hecho por [Juan Cruz Ferrandini](https://www.linkedin.com/in/juan-cruz-ferrandini-a47a89224/).
