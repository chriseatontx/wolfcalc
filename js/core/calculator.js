// Pure calculator logic (no DOM access).
// T1 scaffold + T2 numeric input state machine + T3 arithmetic.

export const VERSION = '0.1.0';

/**
 * Create a fresh calculator instance.
 * @returns {{ display: string }} Initial state; `display` is the value the UI renders.
 */
export function createCalculator() {
  return { display: '0', angleMode: 'DEG', memory: null };
}

function withDefaults(state) {
  return { accumulator: null, pendingOperator: null, startNewEntry: false, error: false, angleMode: 'DEG', memory: null, ...state };
}

/**
 * Append a digit to the current entry (T2).
 * - Replaces the initial "0" so leading zeros are not accumulated ("0" + "5" -> "5").
 * - Appends after an existing decimal point.
 * @param {{ display: string }} state Current calculator state.
 * @param {string} digit A single character '0'-'9'.
 * @returns {{ display: string }} New state; input is never mutated.
 */
export function inputDigit(state, digit) {
  const d = String(digit);
  if (!/^[0-9]$/.test(d)) return state;
  state = withDefaults(state);
  const display = state.error || state.startNewEntry || state.display === '0' ? d : state.display + d;
  return { ...state, display, error: false, startNewEntry: false, justEvaluated: false };
}

/**
 * Insert a single decimal point into the current entry (T2).
 * - Adds "." to an integer entry ("1" -> "1.").
 * - A second "." in the same entry is ignored.
 * @param {{ display: string }} state Current calculator state.
 * @returns {{ display: string }} New state; input is never mutated.
 */
export function inputDecimalPoint(state) {
  if (state.error) return { ...withDefaults(state), display: '0.', error: false, startNewEntry: false, justEvaluated: false };
  if (state.display.includes('.')) return state;
  state = withDefaults(state);
  if (state.startNewEntry) return { ...state, display: '0.', startNewEntry: false, justEvaluated: false };
  return { ...state, display: state.display + '.', justEvaluated: false };
}

/**
 * Remove the last character of the current entry (T2).
 * - "1.2" -> "1."; "1." -> "1"; "5" -> "0".
 * - Safe on empty/initial input: stays "0".
 * @param {{ display: string }} state Current calculator state.
 * @returns {{ display: string }} New state; input is never mutated.
 */
export function backspace(state) {
  if (state.error) return state;
  if (!state.display) return { display: '0' };
  if (state.display === '0' && !Object.hasOwn(state, 'accumulator')) return state;
  state = withDefaults(state);
  const display = state.display;
  let next = display.slice(0, -1);
  if (next === '') next = '0';
  return { ...state, display: next };
}

/**
 * Clear the current entry only (T2). Display resets to "0".
 * @param {{ display: string }} state Current calculator state.
 * @returns {{ display: string }} New state; input is never mutated.
 */
export function clearEntry(state) {
  return { ...withDefaults(state), display: '0', startNewEntry: false, justEvaluated: false };
}

/**
 * Clear everything (T2). Display resets to "0".
 * @param {{ display: string }} state Current calculator state.
 * @returns {{ display: string }} New state; input is never mutated.
 */
export function allClear(state) {
  return {
    ...createCalculator(),
    angleMode: state?.angleMode === 'RAD' ? 'RAD' : 'DEG',
    memory: Number.isFinite(state?.memory) ? state.memory : null,
  };
}

/** Toggle degree/radian mode. The selected mode is part of calculator state. */
export function toggleAngleMode(state) {
  state = withDefaults(state);
  return { ...state, angleMode: state.angleMode === 'RAD' ? 'DEG' : 'RAD' };
}

/** Clear the single memory slot. */
export function memoryClear(state) {
  return { ...withDefaults(state), memory: null };
}

/** Recall the stored value into the display; an empty slot leaves the display alone. */
export function memoryRecall(state) {
  state = withDefaults(state);
  if (!Number.isFinite(state.memory)) return state;
  return { ...state, display: String(state.memory), error: false, startNewEntry: true, justEvaluated: false };
}

function updateMemory(state, direction) {
  state = withDefaults(state);
  const value = Number(state.display);
  if (state.error || !Number.isFinite(value)) return state;
  const current = Number.isFinite(state.memory) ? state.memory : 0;
  const memory = current + direction * value;
  return Number.isFinite(memory) ? { ...state, memory } : { ...state, display: 'Error', error: true };
}

/** Add the displayed value to the single memory slot. */
export function memoryAdd(state) {
  return updateMemory(state, 1);
}

/** Subtract the displayed value from the single memory slot. */
export function memorySubtract(state) {
  return updateMemory(state, -1);
}

function calculate(left, right, key) {
  if (key === '+') return left + right;
  if (key === '-') return left - right;
  if (key === '*') return left * right;
  if (key === '/') return right === 0 ? null : left / right;
  return null;
}

function resultState(state, value) {
  if (!Number.isFinite(value)) return { ...state, display: 'Error', error: true };
  return { ...state, display: String(value), error: false };
}

export function operator(state, key) {
  state = withDefaults(state);
  if (state.error || !['+', '-', '*', '/'].includes(key)) return state;
  const current = Number(state.display);
  if (state.pendingOperator && !state.startNewEntry) {
    const value = calculate(state.accumulator, current, state.pendingOperator);
    if (value === null || !Number.isFinite(value)) return resultState(state, NaN);
    return { ...resultState(state, value), accumulator: value, pendingOperator: key, startNewEntry: true, justEvaluated: false };
  }
  const accumulator = state.justEvaluated ? current : state.accumulator ?? current;
  return { ...state, accumulator, pendingOperator: key, startNewEntry: true, justEvaluated: false };
}

export function equals(state) {
  state = withDefaults(state);
  if (state.error || !state.pendingOperator) return state;
  const right = state.startNewEntry ? state.accumulator : Number(state.display);
  const value = calculate(state.accumulator, right, state.pendingOperator);
  if (value === null || !Number.isFinite(value)) return resultState(state, NaN);
  return { ...resultState(state, value), accumulator: null, pendingOperator: null, startNewEntry: true, justEvaluated: true };
}
