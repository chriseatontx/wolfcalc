import test from 'node:test';
import assert from 'node:assert/strict';
import { allClear, createCalculator, equals, inputDigit, operator } from '../js/core/calculator.js';

function press(keys) {
  let state = createCalculator();
  for (const key of keys) state = key === '=' ? equals(state) : '+-*/'.includes(key) ? operator(state, key) : inputDigit(state, key);
  return state;
}

test('basic arithmetic operators calculate results', () => {
  assert.equal(press('2+3=').display, '5');
  assert.equal(press('10-4=').display, '6');
  assert.equal(press('6*7=').display, '42');
  assert.equal(press('8/2=').display, '4');
});

test('operations chain immediately and continue from equals result', () => {
  assert.equal(press('2+3=+4=').display, '9');
  assert.equal(press('2+3*4=').display, '20');
});

test('operator and equals start a fresh digit entry', () => {
  assert.equal(press('2+3').display, '3');
  assert.equal(press('2+3=4').display, '4');
});

test('division by zero enters Error and a new digit starts recovery', () => {
  let state = press('5/0=');
  assert.equal(state.display, 'Error');
  state = inputDigit(state, '7');
  assert.equal(state.display, '7');
  assert.equal(state.error, false);
  state = allClear(state);
  assert.equal(state.display, '0');
});
