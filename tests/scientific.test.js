import test from 'node:test';
import assert from 'node:assert/strict';
import { applyScientific } from '../js/core/scientific.js';

const calculate = (display, operation, operand) =>
  applyScientific({ display: String(display), error: false }, operation, operand);
const close = (state, expected) => {
  assert.equal(state.error, false);
  assert.ok(Math.abs(Number(state.display) - expected) < 1e-10);
};

test('trigonometric operations use degrees for inputs and outputs', () => {
  close(calculate(30, 'sin'), 0.5);
  close(calculate(0, 'cos'), 1);
  close(calculate(45, 'tan'), 1);
  close(calculate(0.5, 'asin'), 30);
  close(calculate(0.5, 'acos'), 60);
  close(calculate(1, 'atan'), 45);
});

test('logarithms, powers, roots, reciprocal, and factorial calculate', () => {
  close(calculate(100, 'log10'), 2);
  close(calculate(Math.E, 'ln'), 1);
  close(calculate(9, 'sqrt'), 3);
  close(calculate(4, 'square'), 16);
  close(calculate(2, 'power', 3), 8);
  close(calculate(4, 'reciprocal'), 0.25);
  close(calculate(5, 'factorial'), 120);
  close(calculate(-8, 'cubeRoot'), -2);
  close(calculate(-2, 'cube'), -8);
  close(calculate(-7, 'absolute'), 7);
  close(calculate(5, 'nPr', 2), 20);
});

test('sign toggle, percent, and constants calculate', () => {
  close(calculate(-3, 'toggleSign'), 3);
  close(calculate(25, 'percent'), 0.25);
  close(calculate(0, 'pi'), Math.PI);
  close(calculate(0, 'e'), Math.E);
});

test('invalid domains and unknown operations produce calculator Error state', () => {
  for (const [value, operation, operand] of [
    [-1, 'sqrt'], [2, 'asin'], [-2, 'asin'], [2, 'acos'], [-2, 'acos'],
    [0, 'log10'], [-1, 'log10'], [0, 'ln'], [-1, 'ln'], [90, 'tan'],
    [0, 'reciprocal'], [-1, 'factorial'], [2.5, 'factorial'], [1, 'unknown'],
    [-1, 'nPr', 1], [3, 'nPr', -1], [3, 'nPr', 4], [3.5, 'nPr', 1],
  ]) {
    const state = calculate(value, operation, operand);
    assert.equal(state.display, 'Error', `${operation}(${value})`);
    assert.equal(state.error, true, `${operation}(${value})`);
  }
});

test('scientific operations preserve other state fields without mutating input', () => {
  const original = { display: '4', error: true, marker: 'kept' };
  const result = applyScientific(original, 'square');
  assert.deepEqual(result, { display: '16', error: false, marker: 'kept' });
  assert.deepEqual(original, { display: '4', error: true, marker: 'kept' });
});
