import { applyScientific } from './scientific.js';

function tokenize(expression) {
  const tokens = [];
  const input = String(expression);
  let index = 0;

  while (index < input.length) {
    if (/\s/.test(input[index])) {
      index += 1;
      continue;
    }
    const number = input.slice(index).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
    if (number) {
      tokens.push(Number(number[0]));
      index += number[0].length;
      continue;
    }
    const word = input.slice(index).match(/^(?:pow10|[a-z]+)/i);
    if (word) {
      tokens.push(word[0].toLowerCase());
      index += word[0].length;
      continue;
    }
    const symbol = input[index];
    if ('+-^()%!π'.includes(symbol) || symbol === '*' || symbol === '/' || symbol === '×' || symbol === '÷' || symbol === '−') {
      tokens.push(symbol === '×' ? '*' : symbol === '÷' ? '/' : symbol === '−' ? '-' : symbol);
      index += 1;
      continue;
    }
    throw new SyntaxError('Invalid character');
  }

  if (tokens.length === 0) throw new SyntaxError('Empty expression');
  return tokens;
}

function parse(tokens, angleMode = 'DEG', variables = {}) {
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];

  function primary() {
    if (peek() === '(') {
      take();
      const value = sum();
      if (take() !== ')') throw new SyntaxError('Missing closing parenthesis');
      return value;
    }
    const value = take();
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (value === 'π' || value === 'pi') return Math.PI;
    if (value === 'e') return Math.E;
    if (value === 'x' && Number.isFinite(variables.x)) return variables.x;
    const operations = {
      sin: 'sin', cos: 'cos', tan: 'tan', asin: 'asin', acos: 'acos', atan: 'atan',
      log: 'log10', log10: 'log10', ln: 'ln', sqrt: 'sqrt', exp: 'exp',
      pow10: 'tenPower',
    };
    if (typeof value === 'string' && operations[value]) {
      if (take() !== '(') throw new SyntaxError('Expected opening parenthesis');
      const operand = sum();
      if (take() !== ')') throw new SyntaxError('Missing closing parenthesis');
      const result = Number(applyScientific({ display: String(operand), angleMode }, operations[value]).display);
      if (!Number.isFinite(result)) throw new SyntaxError('Function domain error');
      return result;
    }
    throw new SyntaxError('Expected number');
  }

  function postfix() {
    let value = primary();
    while (peek() === '!' || peek() === '%') {
      const operation = take();
      if (operation === '%') value /= 100;
      else {
        if (!Number.isInteger(value) || value < 0 || value > 170) throw new SyntaxError('Factorial domain error');
        let result = 1;
        for (let factor = 2; factor <= value; factor += 1) result *= factor;
        value = result;
      }
    }
    return value;
  }

  function power() {
    let value = postfix();
    if (peek() === '^') {
      take();
      value **= unary();
    }
    return value;
  }

  function unary() {
    if (peek() === '+' || peek() === '-') {
      const sign = take();
      return (sign === '-' ? -1 : 1) * unary();
    }
    return power();
  }

  function product() {
    let value = unary();
    while (peek() === '*' || peek() === '/') {
      const operator = take();
      const right = unary();
      value = operator === '*' ? value * right : value / right;
    }
    return value;
  }

  function sum() {
    let value = product();
    while (peek() === '+' || peek() === '-') {
      const operator = take();
      const right = product();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  }

  const result = sum();
  if (position !== tokens.length || !Number.isFinite(result)) throw new SyntaxError('Invalid expression');
  return result;
}

export function evaluateExpression(expression, options = {}) {
  try {
    return parse(tokenize(expression), options.angleMode ?? 'DEG', options.variables ?? {});
  } catch {
    return 'Error';
  }
}
