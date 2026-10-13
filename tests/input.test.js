import test from 'node:test';
import assert from 'node:assert/strict';

// T2: number input state machine.
import {
  createCalculator,
  inputDigit,
  inputDecimalPoint,
  backspace,
  clearEntry,
  allClear,
} from '../js/core/calculator.js';

test('entering "0" then "5" shows "5"', () => {
  let calc = createCalculator();
  calc = inputDigit(calc, '0');
  assert.equal(calc.display, '0'); // pressing 0 on the initial zero stays "0" (no "00")
  calc = inputDigit(calc, '5');
  assert.equal(calc.display, '5');
});

test('"1." + "2" shows "1.2"', () => {
  let calc = createCalculator();
  calc = inputDigit(calc, '1');
  calc = inputDecimalPoint(calc);
  assert.equal(calc.display, '1.');
  calc = inputDigit(calc, '2');
  assert.equal(calc.display, '1.2');
});

test('a second "." is ignored', () => {
  let calc = createCalculator();
  calc = inputDigit(calc, '1');
  calc = inputDecimalPoint(calc);
  const before = calc;
  calc = inputDecimalPoint(calc);
  assert.equal(calc.display, '1.');
  assert.equal(calc, before); // ignored: same state returned, nothing mutated
});

test('backspace on empty input is safe', () => {
  const calc = createCalculator();
  const next = backspace(calc);
  assert.equal(next.display, '0');
  assert.deepEqual(next, { display: '0', angleMode: 'DEG', memory: null });
});

test('AC resets to 0', () => {
  let calc = createCalculator();
  calc = inputDigit(calc, '7');
  calc = inputDecimalPoint(calc);
  calc = inputDigit(calc, '3');
  assert.equal(calc.display, '7.3');
  calc = allClear(calc);
  assert.deepEqual(calc, { display: '0', angleMode: 'DEG', memory: null });
});

test('CE clears the current entry to "0"', () => {
  let calc = createCalculator();
  calc = inputDigit(calc, '4');
  calc = inputDigit(calc, '2');
  calc = clearEntry(calc);
  assert.equal(calc.display, '0');
});

test('entering "." first yields "0." and then valid decimals', () => {
  let calc = createCalculator();
  calc = inputDecimalPoint(calc);
  assert.equal(calc.display, '0.');
  calc = inputDigit(calc, '5');
  assert.equal(calc.display, '0.5');
});

test('backspace removes the last character', () => {
  let calc = createCalculator();
  calc = inputDigit(calc, '1');
  calc = inputDigit(calc, '2');
  calc = backspace(calc);
  assert.equal(calc.display, '1');
  calc = backspace(calc); // single digit clears to "0"
  assert.equal(calc.display, '0');
});

test('backspace removes a trailing decimal point', () => {
  let calc = createCalculator();
  calc = inputDigit(calc, '9');
  calc = inputDecimalPoint(calc);
  calc = backspace(calc);
  assert.equal(calc.display, '9');
});

test('inputDigit ignores non-digit characters', () => {
  const calc = createCalculator();
  assert.equal(inputDigit(calc, 'a'), calc);
  assert.equal(inputDigit(calc, undefined), calc);
  assert.equal(inputDigit(calc, ''), calc);
  assert.equal(calc.display, '0');
});

test('actions never mutate the previous state', () => {
  const calc = createCalculator();
  const next1 = inputDigit(calc, '3');
  const next2 = backspace(next1);
  const next3 = clearEntry(next2);
  assert.equal(calc.display, '0'); // original untouched by every action
  assert.equal(next1.display, '3');
  assert.equal(next2.display, '0');
  assert.notEqual(next1, calc);
  assert.notEqual(next3, next2);
});
