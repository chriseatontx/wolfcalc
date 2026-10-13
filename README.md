# calc.wolfcreek

calc.wolfcreek is a browser-based scientific calculator with an original interface informed by vintage graphing calculators. It uses plain HTML, CSS, and JavaScript and has no external runtime dependencies.

## Run locally

Use Node.js 24 or newer. From the repository root:

```powershell
npm start
```

Open the local address printed by the server (by default, `http://127.0.0.1:8000/`). Stop the server with Ctrl+C.

To run the calculator and local-server tests:

```powershell
npm test
```

The full repository test suite is also available with `npm run test:all`.

## Features

- Arithmetic with precedence, parentheses, unary signs, and chained expressions
- Scientific functions, constants, factorial, percentages, and degree/radian modes
- One-slot calculator memory and previous-answer recall
- A single-function Cartesian graph over a fixed viewing window
- Mouse and keyboard input, responsive layout, and clear unsupported-key labeling

Statistics, programmable menus, and ALPHA character entry are not implemented. The visual design and product identity are original; the interface does not use another calculator's product name or marks.

## Project structure

- `index.html`, `styles.css`: page and calculator presentation
- `js/core/`: calculator state, expression evaluation, and graph sampling
- `js/ui.js`: browser interaction and display rendering
- `tests/`: Node.js built-in test suite

The project currently uses only Node.js built-in modules and browser APIs. Release licensing and third-party asset review are tracked in `TASKS.md`.

## License

This project is available under the MIT License. See `LICENSE` for the terms.

## GitHub Pages preparation

A manual-only Pages workflow is prepared under `.github/workflows/pages.yml`. It deploys only the calculator page assets when explicitly run from GitHub Actions. The workflow has not been run, and no site has been published.
