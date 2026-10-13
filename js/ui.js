import {
  applyFunction, clearSession, clearSessionEntry, createSession, enterConstant, enterDecimal,
  enterDigit, enterOperator, enterParenthesis, enterVariable, eraseEntry, evaluateSession, insertAnswer,
  sessionMemory, toggleSessionAngleMode, toggleShift,
} from './core/session.js';
import { sampleGraph } from './core/graph.js';

const keypad = document.getElementById('button-grid');
const expressionOutput = document.getElementById('expression');
const displayOutput = document.getElementById('display');
const angleStatus = document.getElementById('angle-status');
const memoryStatus = document.getElementById('memory-status');
const shiftStatus = document.getElementById('shift-status');
const calculatorView = document.getElementById('calculator-view');
const graphView = document.getElementById('graph-view');
const graphEquation = document.getElementById('graph-equation');
const graphCanvas = document.getElementById('graph-canvas');

let state = createSession();
let graphVisible = false;

function drawGraph() {
  const equation = state.expression || state.history || 'x';
  graphEquation.textContent = `y = ${equation}`;
  graphCanvas.setAttribute('aria-label', `Graph of y equals ${equation}`);
  const bounds = graphCanvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const ratio = window.devicePixelRatio || 1;
  graphCanvas.width = Math.round(bounds.width * ratio);
  graphCanvas.height = Math.round(bounds.height * ratio);
  const context = graphCanvas.getContext('2d');
  context.scale(ratio, ratio);

  const width = bounds.width;
  const height = bounds.height;
  const xMin = -10, xMax = 10, yMin = -10, yMax = 10;
  const px = x => (x - xMin) / (xMax - xMin) * width;
  const py = y => height - (y - yMin) / (yMax - yMin) * height;
  context.fillStyle = '#a9b79d';
  context.fillRect(0, 0, width, height);
  context.strokeStyle = 'rgba(31, 49, 34, .16)';
  context.lineWidth = 1;
  for (let tick = -10; tick <= 10; tick += 2) {
    context.beginPath();
    context.moveTo(px(tick), 0);
    context.lineTo(px(tick), height);
    context.moveTo(0, py(tick));
    context.lineTo(width, py(tick));
    context.stroke();
  }
  context.strokeStyle = 'rgba(25, 38, 28, .72)';
  context.lineWidth = 1.3;
  context.beginPath();
  context.moveTo(px(0), 0); context.lineTo(px(0), height);
  context.moveTo(0, py(0)); context.lineTo(width, py(0));
  context.stroke();

  const points = sampleGraph(equation, { xMin, xMax, samples: 280, angleMode: state.angleMode });
  context.strokeStyle = '#263b2d';
  context.lineWidth = 2.1;
  context.beginPath();
  let penDown = false;
  for (const point of points) {
    if (point.y === null || point.y < yMin - 1 || point.y > yMax + 1) { penDown = false; continue; }
    if (penDown) context.lineTo(px(point.x), py(point.y));
    else { context.moveTo(px(point.x), py(point.y)); penDown = true; }
  }
  context.stroke();
}

function render() {
  expressionOutput.textContent = state.history || state.expression || '\u00a0';
  displayOutput.textContent = state.display;
  displayOutput.classList.toggle('is-error', state.error);
  angleStatus.textContent = state.angleMode;
  memoryStatus.classList.toggle('is-active', Number.isFinite(state.memory));
  shiftStatus.classList.toggle('is-active', state.shiftActive);

  const shiftButton = keypad.querySelector('[data-action="shift"]');
  shiftButton?.setAttribute('aria-pressed', String(state.shiftActive));
  calculatorView.hidden = graphVisible;
  graphView.hidden = !graphVisible;
  if (graphVisible) drawGraph();
}

function flashKey(button) {
  button.classList.remove('key--pressed');
  void button.offsetWidth;
  button.classList.add('key--pressed');
  window.setTimeout(() => button.classList.remove('key--pressed'), 130);
}

function activate(button) {
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  const value = button.dataset.value;
  switch (action) {
    case 'digit': state = enterDigit(state, value); break;
    case 'decimal': state = enterDecimal(state); break;
    case 'operator': state = enterOperator(state, value); break;
    case 'paren': state = enterParenthesis(state, value); break;
    case 'function': state = applyFunction(state, value); break;
    case 'constant': state = enterConstant(state, value); break;
    case 'equals': state = evaluateSession(state); break;
    case 'backspace': state = eraseEntry(state); break;
    case 'clear-entry': state = clearSessionEntry(state); break;
    case 'clear': state = clearSession(state); break;
    case 'shift': state = toggleShift(state); break;
    case 'angle': state = toggleSessionAngleMode(state); break;
    case 'memory': state = sessionMemory(state, value); break;
    case 'answer': state = insertAnswer(state); break;
    case 'variable': state = enterVariable(state, value); break;
    case 'graph': graphVisible = !graphVisible; break;
    default: return;
  }
  flashKey(button);
  render();
}

keypad.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (button && keypad.contains(button)) activate(button);
});

document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  const key = event.key;
  let target;
  if (/^[0-9]$/.test(key)) target = keypad.querySelector(`[data-action="digit"][data-value="${key}"]`);
  else if (key === '.') target = keypad.querySelector('[data-action="decimal"]');
  else if (['+', '-', '*', '/', '^'].includes(key)) target = keypad.querySelector(`[data-action="operator"][data-value="${key}"]`);
  else if (key === '(' || key === ')') target = keypad.querySelector(`[data-action="paren"][data-value="${key}"]`);
  else if (key === 'Enter' || key === '=') target = keypad.querySelector('[data-action="equals"]');
  else if (key === 'Backspace') target = keypad.querySelector('[data-action="backspace"]');
  else if (key === 'Delete') target = keypad.querySelector('[data-action="clear-entry"]');
  else if (key === 'Escape') target = keypad.querySelector('[data-action="clear"]');
  else if (key === 'Shift') target = keypad.querySelector('[data-action="shift"]');
  else if (key.toLowerCase() === 'd') target = keypad.querySelector('[data-action="angle"]');
  else if (key.toLowerCase() === 'a') target = keypad.querySelector('[data-action="answer"]');
  else if (key.toLowerCase() === 'x') target = keypad.querySelector('[data-action="variable"]');
  else if (key.toLowerCase() === 'g') target = keypad.querySelector('[data-action="graph"]');
  else if (/^F[1-5]$/.test(key)) target = document.querySelector(`.key--soft[data-kbd="${key}"]`);
  else {
    const functionKeys = { s: 'sin', c: 'cos', t: 'tan', l: 'log10', n: 'ln' };
    const operation = functionKeys[key.toLowerCase()];
    if (operation) target = keypad.querySelector(`[data-action="function"][data-value="${operation}"]`);
  }
  if (!target) return;
  event.preventDefault();
  activate(target);
});

render();
