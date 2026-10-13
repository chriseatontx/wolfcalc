import {
  allClear, createCalculator, memoryAdd, memoryClear, memoryRecall, memorySubtract, toggleAngleMode,
} from './calculator.js';
import { evaluateExpression } from './evaluator.js';
import { applyScientific } from './scientific.js';

export function createSession() {
  return { ...createCalculator(), expression: '', history: '', answer: '0', entryStart: true, justEvaluated: false, shiftActive: false };
}

export function formatNumber(value) {
  if (!Number.isFinite(value)) return 'Error';
  if (Object.is(value, -0) || Math.abs(value) < 1e-14) return '0';
  return String(Number(value.toPrecision(15)));
}

function freshEntry(state) {
  return { ...state, expression: '', history: '', display: '0', error: false, entryStart: true, justEvaluated: false };
}

function expressionPrefix(state) {
  if (state.justEvaluated) return '';
  if (!state.entryStart && state.expression.endsWith(state.display)) {
    return state.expression.slice(0, -state.display.length);
  }
  return state.expression;
}

export function enterDigit(state, digit) {
  if (!/^[0-9]$/.test(String(digit))) return state;
  if (state.error) state = freshEntry(state);
  let expression = state.expression;
  let display = state.display;
  let entryStart = state.entryStart;
  if (state.justEvaluated) {
    expression = '';
    display = '0';
    entryStart = true;
  }
  if (entryStart) {
    if (expression.endsWith(')') || expression.endsWith('π') || expression.endsWith('e')) expression += '*';
    expression += digit;
    display = digit;
  } else {
    const next = display === '0' ? digit : display + digit;
    expression = expression.endsWith(display) ? expression.slice(0, -display.length) + next : expression + digit;
    display = next;
  }
  return { ...state, expression, display, error: false, entryStart: false, justEvaluated: false, history: '' };
}

export function enterDecimal(state) {
  if (state.error) state = freshEntry(state);
  if (!state.entryStart && state.display.includes('.')) return state;
  let expression = state.expression;
  let display = state.display;
  if (state.justEvaluated) {
    expression = '';
    display = '0';
  }
  if (state.entryStart) {
    if (expression.endsWith(')') || expression.endsWith('π') || expression.endsWith('e')) expression += '*';
    expression += '0.';
    display = '0.';
  } else {
    display += '.';
    expression = expression.endsWith(state.display) ? expression.slice(0, -state.display.length) + display : expression + '.';
  }
  return { ...state, expression, display, error: false, entryStart: false, justEvaluated: false, history: '' };
}

export function enterOperator(state, operator) {
  if (!['+', '-', '*', '/', '^'].includes(operator)) return state;
  if (state.error) return state;
  let expression = state.justEvaluated ? state.display : state.expression;
  if (!expression) expression = state.display === '0' && operator === '-' ? '' : state.display;
  if (/[+*/^]$/.test(expression) && operator !== '-') expression = expression.slice(0, -1);
  expression += operator;
  return { ...state, expression, entryStart: true, justEvaluated: false, history: '' };
}

export function enterParenthesis(state, character) {
  if (state.error || !['(', ')'].includes(character)) return state;
  let expression = state.justEvaluated ? state.display : state.expression;
  if (character === '(') {
    if (/[0-9πe)]$/.test(expression)) expression += '*';
    expression += '(';
    return { ...state, expression, display: '0', entryStart: true, justEvaluated: false, history: '' };
  }
  const opens = (expression.match(/\(/g) || []).length;
  const closes = (expression.match(/\)/g) || []).length;
  if (opens <= closes || /[+\-*/^(]$/.test(expression)) return state;
  expression += ')';
  return { ...state, expression, entryStart: true, justEvaluated: false, history: '' };
}

const inverseFunctions = { sin: 'asin', cos: 'acos', tan: 'atan', log10: 'tenPower', ln: 'exp' };

export function applyFunction(state, requestedOperation) {
  if (state.error) return state;
  const operation = state.shiftActive ? inverseFunctions[requestedOperation] ?? requestedOperation : requestedOperation;
  const operand = state.display;
  let expression;
  if (state.entryStart && /[+\-*/^(]$/.test(state.expression)) {
    expression = `${state.expression}${operation === 'tenPower' ? 'pow10' : operation}(`;
    return { ...state, expression, display: '0', history: '', entryStart: true, justEvaluated: false, shiftActive: false };
  } else {
    const prefix = expressionPrefix(state);
    const operandExpression = operation === 'tenPower' ? `pow10(${operand})`
      : operation === 'exp' ? `exp(${operand})`
        : operation === 'square' ? `(${operand})^2`
          : operation === 'reciprocal' ? `1/(${operand})`
            : operation === 'toggleSign' ? `-(${operand})`
              : operation === 'percent' ? `${operand}%`
                : operation === 'factorial' ? `${operand}!`
                  : `${operation}(${operand})`;
    expression = prefix + operandExpression;
  }

  const result = applyScientific({ ...state, display: operand }, operation);
  return {
    ...result,
    expression,
    history: '',
    entryStart: true,
    justEvaluated: false,
    shiftActive: false,
  };
}

export function insertAnswer(state) {
  if (state.error) return state;
  let expression = state.justEvaluated ? '' : state.expression;
  if (/[0-9πe)]$/.test(expression)) expression += '*';
  const answer = state.answer ?? '0';
  expression += answer;
  return { ...state, expression, display: answer, entryStart: true, justEvaluated: false, history: '' };
}

export function enterConstant(state, constant) {
  if (!['pi', 'e'].includes(constant) || state.error) return state;
  if (state.justEvaluated) state = { ...state, expression: '', justEvaluated: false };
  let expression = state.expression;
  if (!state.entryStart && expression.endsWith(state.display)) expression = expressionPrefix(state);
  if (/[0-9πe)]$/.test(expression)) expression += '*';
  expression += constant === 'pi' ? 'π' : 'e';
  return { ...state, expression, display: String(constant === 'pi' ? Math.PI : Math.E), entryStart: true, justEvaluated: false, history: '' };
}

export function enterVariable(state, variable = 'x') {
  if (variable !== 'x' || state.error) return state;
  if (state.justEvaluated) state = { ...state, expression: '', justEvaluated: false };
  let expression = state.expression;
  if (!state.entryStart && expression.endsWith(state.display)) expression = expressionPrefix(state);
  if (/[0-9πe)]$/.test(expression)) expression += '*';
  expression += variable;
  return { ...state, expression, display: variable, entryStart: true, justEvaluated: false, history: '' };
}

export function evaluateSession(state) {
  if (state.error || !state.expression) return state;
  let expression = state.expression;
  const missingCloses = (expression.match(/\(/g) || []).length - (expression.match(/\)/g) || []).length;
  if (missingCloses > 0) expression += ')'.repeat(missingCloses);
  const value = evaluateExpression(expression, { angleMode: state.angleMode });
  if (value === 'Error') return { ...state, expression, history: expression, display: 'Error', error: true, entryStart: true, justEvaluated: false };
  const answer = formatNumber(value);
  return { ...state, expression, history: expression, answer, display: answer, error: false, entryStart: true, justEvaluated: true, shiftActive: false };
}

export function eraseEntry(state) {
  if (state.error) return { ...state, expression: '', display: '0', history: '', error: false, entryStart: true, justEvaluated: false };
  if (state.entryStart) return { ...state, display: '0' };
  const display = state.display.length > 1 ? state.display.slice(0, -1) : '0';
  const expression = state.expression.endsWith(state.display)
    ? state.expression.slice(0, -state.display.length) + display
    : state.expression.slice(0, -1);
  return { ...state, expression, display, entryStart: display === '0', history: '' };
}

export function clearSessionEntry(state) {
  const expression = expressionPrefix(state);
  return { ...state, expression, display: '0', error: false, entryStart: true, justEvaluated: false, history: '' };
}

export function clearSession(state) {
  return { ...allClear(state), answer: state.answer ?? '0', expression: '', history: '', entryStart: true, justEvaluated: false, shiftActive: false };
}

export function toggleShift(state) {
  return { ...state, shiftActive: !state.shiftActive };
}

export function toggleSessionAngleMode(state) {
  return toggleAngleMode(state);
}

export function sessionMemory(state, command) {
  if (command === 'MR' && !Number.isFinite(state.memory)) return state;
  const result = command === 'MC' ? memoryClear(state)
    : command === 'MR' ? memoryRecall(state)
      : command === 'M+' ? memoryAdd(state)
        : command === 'M-' ? memorySubtract(state) : state;
  if (command === 'MR' && result !== state) {
    return { ...result, expression: String(result.display), entryStart: false, justEvaluated: false, history: '' };
  }
  return result;
}
