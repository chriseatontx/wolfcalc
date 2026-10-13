import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyFunction, createSession, enterDigit, enterOperator, enterParenthesis, enterConstant,
  enterDecimal, enterVariable, evaluateSession, sessionMemory, toggleSessionAngleMode,
} from '../js/core/session.js';

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
