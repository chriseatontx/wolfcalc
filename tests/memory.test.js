import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allClear, createCalculator, inputDigit, memoryAdd, memoryClear, memoryRecall, memorySubtract,
} from '../js/core/calculator.js';

test('memory stores, adds, subtracts, and recalls one value', () => {
  let state = memoryAdd({ ...createCalculator(), display: '12' });
  assert.equal(state.memory, 12);
  state = memoryAdd({ ...state, display: '3' });
  assert.equal(state.memory, 15);
  state = memorySubtract({ ...state, display: '4' });
  assert.equal(state.memory, 11);
  state = memoryRecall({ ...state, display: '99' });
  assert.equal(state.display, '11');
});

test('memory survives all clear and is cleared only by MC', () => {
  let state = memoryAdd({ ...createCalculator(), display: '8' });
  state = allClear(state);
  assert.equal(state.display, '0');
  assert.equal(state.memory, 8);
  assert.equal(memoryRecall(state).display, '8');
  state = memoryClear(state);
  assert.equal(state.memory, null);
  assert.deepEqual(memoryRecall(state), state);
});

test('memory commands ignore Error and recall can be followed by new input', () => {
  const error = { ...createCalculator(), display: 'Error', error: true };
  assert.equal(memoryAdd(error).memory, null);
  assert.equal(memorySubtract(error).memory, null);
  const recalled = memoryRecall({ ...createCalculator(), memory: 5 });
  assert.equal(inputDigit(recalled, '2').display, '2');
});
