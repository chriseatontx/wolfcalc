# calc.wolfcreek

[**Open the live calculator →**](https://chriseatontx.github.io/wolfcalc/)

![calc.wolfcreek scientific calculator](assets/wolfcalc-preview.jpg)

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

## Versioning and releases

`package.json` is the source of truth for the calculator version. The version is shown in the calculator's header and included in the GitHub Pages deployment. When publishing a GitHub release, use a matching `v`-prefixed tag, such as `v0.1.0` for package version `0.1.0`.

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

The project uses only Node.js built-in modules and browser APIs.

## License

This project is available under the MIT License. See `LICENSE` for the terms.

## GitHub Pages

The live demo is hosted on GitHub Pages. The manual deployment workflow in `.github/workflows/pages.yml` publishes only the calculator page assets.

