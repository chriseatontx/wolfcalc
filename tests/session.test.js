import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyFunction, createSession, enterDigit, enterOperator, enterParenthesis, enterConstant,
  enterDecimal, enterVariable, evaluateSession, sessionMemory, toggleSessionAngleMode, toggleShift,
} from '../js/core/session.js';
import { sampleGraph } from '../js/core/graph.js';

test('expression entry honors precedence and continues from an answer', () => {
  let state = createSession();
  for (const key of ['2', '+', '3', '*', '4']) {
    state = /^[0-9]$/.test(key) ? enterDigit(state, key) : enterOperator(state, key);
  }
  state = evaluateSession(state);
  assert.equal(state.display, '14');
  assert.equal(enterOperator(state, '+').expression, '14+');
});

test('parentheses and decimal entry are usable from the session', () => {
  let state = createSession();
  state = enterParenthesis(state, '(');
  state = enterDigit(state, '2');
  state = enterOperator(state, '+');
  state = enterDigit(state, '3');
  state = enterParenthesis(state, ')');
  state = enterOperator(state, '*');
  state = enterDigit(state, '4');
  assert.equal(evaluateSession(state).display, '20');
  state = enterDecimal(createSession());
  state = enterDigit(state, '5');
  assert.equal(state.display, '0.5');
});

test('unary scientific keys replace the current operand and use angle mode', () => {
  let state = enterDigit(createSession(), '3');
  state = enterDigit(state, '0');
  state = applyFunction(state, 'sin');
  assert.equal(evaluateSession(state).display, '0.5');
  state = toggleSessionAngleMode(createSession());
  state = enterDigit(state, '9');
  state = enterDigit(state, '0');
  state = applyFunction(state, 'sin');
  assert.ok(Math.abs(Number(evaluateSession(state).display) - Math.sin(90)) < 1e-12);
});

test('constants and memory can participate in calculator expressions', () => {
  let state = createSession();
  state = enterConstant(state, 'pi');
  state = enterOperator(state, '*');
  state = enterDigit(state, '2');
  assert.ok(Math.abs(Number(evaluateSession(state).display) - 2 * Math.PI) < 1e-12);
  state = sessionMemory({ ...createSession(), display: '12' }, 'M+');
  state = sessionMemory(state, 'MR');
  assert.equal(state.display, '12');
});

test('x variable builds a graphable expression', () => {
  let state = createSession();
  state = enterVariable(state, 'x');
  state = enterOperator(state, '^');
  state = enterDigit(state, '2');
  assert.equal(state.expression, 'x^2');
});

test('x followed by square stays symbolic and graphs as x squared', () => {
  let state = enterVariable(createSession(), 'x');
  state = applyFunction(state, 'square');
  assert.equal(state.error, false);
  assert.equal(state.expression, '(x)^2');
  assert.equal(state.display, 'x²');
  const points = sampleGraph(state.expression, { xMin: -2, xMax: 2, samples: 4 });
  assert.deepEqual(points.map(point => point.y), [4, 1, 0, 1, 4]);
});

test('2nd activates cube root, cube, absolute value, and two-operand nPr', () => {
  let state = enterDigit(createSession(), '8');
  state = toggleShift(state);
  state = applyFunction(state, 'sqrt');
  assert.equal(evaluateSession(state).display, '2');

  state = enterDigit(createSession(), '2');
  state = toggleShift(state);
  state = applyFunction(state, 'square');
  assert.equal(evaluateSession(state).display, '8');

  state = enterDigit(createSession(), '5');
  state = applyFunction(state, 'toggleSign');
  state = toggleShift(state);
  state = applyFunction(state, 'reciprocal');
  assert.equal(evaluateSession(state).display, '5');

  state = enterDigit(createSession(), '5');
  state = toggleShift(state);
  state = applyFunction(state, 'factorial');
  assert.equal(state.expression, 'nPr(5,');
  state = enterDigit(state, '2');
  assert.equal(evaluateSession(state).display, '20');

  state = enterDigit(createSession(), '2');
  state = enterOperator(state, '+');
  state = enterDigit(state, '5');
  state = toggleShift(state);
  state = applyFunction(state, 'factorial');
  state = enterDigit(state, '2');
  state = enterOperator(state, '*');
  state = enterDigit(state, '3');
  assert.equal(evaluateSession(state).display, '62');
});

test('shifted scientific expressions remain graphable', () => {
  let state = enterVariable(createSession(), 'x');
  state = toggleShift(state);
  state = applyFunction(state, 'sqrt');
  assert.deepEqual(sampleGraph(state.expression, { xMin: -8, xMax: 8, samples: 2 }).map(point => point.y), [-2, 0, 2]);

  state = enterVariable(createSession(), 'x');
  state = toggleShift(state);
  state = applyFunction(state, 'square');
  assert.deepEqual(sampleGraph(state.expression, { xMin: -2, xMax: 2, samples: 2 }).map(point => point.y), [-8, 0, 8]);

  state = enterVariable(createSession(), 'x');
  state = toggleShift(state);
  state = applyFunction(state, 'reciprocal');
  assert.deepEqual(sampleGraph(state.expression, { xMin: -3, xMax: 3, samples: 2 }).map(point => point.y), [3, 0, 3]);
});
