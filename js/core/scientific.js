const degreesToRadians = value => (value * Math.PI) / 180;
const radiansToDegrees = value => (value * 180) / Math.PI;

function factorial(value) {
  if (!Number.isInteger(value) || value < 0) return NaN;
  let result = 1;
  for (let factor = 2; factor <= value; factor += 1) result *= factor;
  return result;
}

function permutation(n, r) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(r) || n < 0 || r < 0 || r > n || r > 170) return NaN;
  let result = 1;
  for (let offset = 0; offset < r; offset += 1) result *= n - offset;
  return result;
}

/** Apply a pure scientific operation to the calculator's displayed number. */
export function applyScientific(state, operation, operand) {
  const value = Number(state.display);
  if (!Number.isFinite(value)) return { ...state, display: 'Error', error: true };

  const radians = (state.angleMode ?? 'DEG') === 'RAD';
  const toRadians = input => radians ? input : degreesToRadians(input);
  const fromRadians = input => radians ? input : radiansToDegrees(input);

  let result;
  switch (operation) {
    case 'sin': result = Math.sin(toRadians(value)); break;
    case 'cos': result = Math.cos(toRadians(value)); break;
    case 'tan': result = Math.abs(Math.cos(toRadians(value))) < 1e-12
      ? NaN : Math.tan(toRadians(value)); break;
    case 'asin': result = fromRadians(Math.asin(value)); break;
    case 'acos': result = fromRadians(Math.acos(value)); break;
    case 'atan': result = fromRadians(Math.atan(value)); break;
    case 'log10': result = Math.log10(value); break;
    case 'ln': result = Math.log(value); break;
    case 'exp': result = Math.exp(value); break;
    case 'tenPower': result = 10 ** value; break;
    case 'sqrt': result = Math.sqrt(value); break;
    case 'cubeRoot': result = Math.cbrt(value); break;
    case 'square': result = value ** 2; break;
    case 'cube': result = value ** 3; break;
    case 'absolute': result = Math.abs(value); break;
    case 'power': result = value ** Number(operand); break;
    case 'nthRoot': {
      const index = Number(operand);
      if (!Number.isFinite(index) || index === 0) { result = NaN; break; }
      if (value < 0) {
        if (!Number.isInteger(index) || Math.abs(index % 2) !== 1) { result = NaN; break; }
        result = -((-value) ** (1 / index));
      } else result = value ** (1 / index);
      break;
    }
    case 'nPr': result = permutation(value, Number(operand)); break;
    case 'reciprocal': result = value === 0 ? NaN : 1 / value; break;
    case 'factorial': result = factorial(value); break;
    case 'toggleSign': result = -value; break;
    case 'percent': result = value / 100; break;
    case 'pi': result = Math.PI; break;
    case 'e': result = Math.E; break;
    default: result = NaN;
  }

  if (!Number.isFinite(result)) return { ...state, display: 'Error', error: true };
  return { ...state, display: String(result), error: false };
}
