import test from 'node:test';
import assert from 'node:assert/strict';
import { allClear, createCalculator, inputDigit, toggleAngleMode } from '../js/core/calculator.js';
import { applyScientific } from '../js/core/scientific.js';

const trig = (state, operation) => applyScientific(state, operation);
const close = (state, expected) => assert.ok(Math.abs(Number(state.display) - expected) < 1e-10);

test('degree mode is the default and sin(30) is one half', () => {
  const state = createCalculator();
  assert.equal(state.angleMode, 'DEG');
  close(trig({ ...state, display: '30' }, 'sin'), 0.5);
});

test('radian mode changes trig inputs and inverse trig outputs', () => {
  let state = toggleAngleMode(createCalculator());
  close(trig({ ...state, display: String(Math.PI / 2) }, 'sin'), 1);
  close(trig({ ...state, display: '0.5' }, 'asin'), Math.PI / 6);
  close(trig({ ...state, display: '1' }, 'atan'), Math.PI / 4);
});

test('angle mode persists across input, calculations, and all clear until toggled', () => {
  let state = toggleAngleMode(createCalculator());
  state = inputDigit(state, '4');
  state = trig(state, 'square');
  assert.equal(state.angleMode, 'RAD');
  state = allClear(state);
  assert.equal(state.angleMode, 'RAD');
  assert.equal(toggleAngleMode(state).angleMode, 'DEG');
});
