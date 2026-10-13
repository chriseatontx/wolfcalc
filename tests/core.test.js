import test from 'node:test';
import assert from 'node:assert/strict';

// T1 smoke test: the core module must load and expose its factory.
import * as core from '../js/core/calculator.js';

test('core module loads and exposes createCalculator', () => {
  assert.equal(typeof core.createCalculator, 'function');
});

test('createCalculator returns initial state with display "0"', () => {
  const calc = core.createCalculator();
  assert.deepEqual(calc, { display: '0', angleMode: 'DEG', memory: null });
});
