Attempting to perform the InitializeDefaultDrives operation on the 'FileSystem' provider failed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyScientific } from '../js/core/scientific.js';
import { evaluateExpression } from '../js/core/evaluator.js';
import { createSession, enterConstant, enterDigit, enterNthRoot, enterOperator, enterParenthesis, enterVariable, evaluateSession, insertAnswer, toggleShift, applyFunction } from '../js/core/session.js';
import { completeExpression, sampleGraph } from '../js/core/graph.js';

test('nth root calculates real roots and rejects undefined real domains', () => {
  assert.equal(applyScientific({ display: '27' }, 'nthRoot', 3).display, '3');
  assert.equal(applyScientific({ display: '-8' }, 'nthRoot', 3).display, '-2');
  for (const [value, index] of [[-8, 2], [8, 0]]) {
    const result = applyScientific({ display: String(value) }, 'nthRoot', index);
    assert.equal(result.display, 'Error');
    assert.equal(result.error, true);
  }
});

test('nth-root expressions accept two operands, compose, and retain ordinary powers', () => {
  assert.equal(evaluateExpression('nthRoot(27,3)'), 3);
  assert.equal(evaluateExpression('2+nthRoot(27,3)*4'), 14);
  assert.equal(evaluateExpression('nthRoot(x,3)', { variables: { x: -8 } }), -2);
  assert.equal(evaluateExpression('27^3'), 19683);
  assert.equal(evaluateExpression('nthRoot(-8,2)'), 'Error');
  assert.equal(evaluateExpression('nthRoot(8,0)'), 'Error');
});

test('2ND plus xʸ enters an nth root and keeps it composable and graphable', () => {
  let state = createSession();
  for (const digit of '27') state = enterDigit(state, digit);
  state = toggleShift(state);
  state = enterNthRoot(state);
  assert.equal(state.expression, 'nthRoot(27,');
  assert.equal(state.shiftActive, false);
  state = enterDigit(state, '3');
  assert.equal(evaluateSession(state).display, '3');

  state = createSession();
  state = enterDigit(state, '2');
  state = enterOperator(state, '+');
  for (const digit of '27') state = enterDigit(state, digit);
  state = toggleShift(state);
  state = enterNthRoot(state);
  state = enterDigit(state, '3');
  state = enterOperator(state, '+');
  state = enterDigit(state, '1');
  assert.equal(evaluateSession(state).display, '6');

  const points = sampleGraph('nthRoot(x,3)', { xMin: -8, xMax: 8, samples: 2 });
  assert.deepEqual(points.map(point => point.y), [-2, 0, 2]);
});

test('keyboard power operation remains ordinary exponentiation', () => {
  let state = createSession();
  state = enterDigit(state, '2');
  state = enterOperator(state, '^');
  state = enterDigit(state, '3');
  assert.equal(evaluateSession(state).display, '8');
});

test('manual root closing clears pending state before continuing an expression', () => {
  let state = createSession();
  for (const digit of '27') state = enterDigit(state, digit);
  state = toggleShift(state);
  state = enterNthRoot(state);
  state = enterDigit(state, '3');
  state = enterParenthesis(state, ')');
  assert.equal(state.nthRootOpen, false);
  state = enterDigit(state, '2');
  state = enterOperator(state, '+');
  state = enterDigit(state, '1');
  assert.equal(evaluateSession(state).display, '7');
});

test('nth-root entry accepts constants and recalled answers as radicands', () => {
  let state = enterConstant(createSession(), 'pi');
  state = toggleShift(state);
  state = enterNthRoot(state);
  assert.equal(state.expression, 'nthRoot(π,');
  state = enterDigit(state, '2');
  assert.ok(Math.abs(Number(evaluateSession(state).display) - Math.sqrt(Math.PI)) < 1e-12);

  state = insertAnswer({ ...createSession(), answer: '16' });
  state = toggleShift(state);
  state = enterNthRoot(state);
  state = enterDigit(state, '2');
  assert.equal(evaluateSession(state).display, '4');
});

test('root index accepts a scientific function and keypad graphing closes the root', () => {
  let state = createSession();
  for (const digit of '16') state = enterDigit(state, digit);
  state = toggleShift(state);
  state = enterNthRoot(state);
  state = applyFunction(state, 'sqrt');
  state = enterDigit(state, '4');
  assert.equal(evaluateSession(state).display, '4');

  state = enterVariable(createSession(), 'x');
  state = toggleShift(state);
  state = enterNthRoot(state);
  state = enterDigit(state, '3');
  assert.equal(state.expression, 'nthRoot(x,3');
  assert.equal(completeExpression(state.expression), 'nthRoot(x,3)');
  assert.deepEqual(sampleGraph(state.expression, { xMin: -8, xMax: 8, samples: 2 }).map(point => point.y), [-2, 0, 2]);
});

test('recovering from an invalid root clears pending root state', () => {
  let state = createSession();
  state = enterDigit(state, '8');
  state = toggleShift(state);
  state = enterNthRoot(state);
  state = enterDigit(state, '0');
  state = evaluateSession(state);
  assert.equal(state.display, 'Error');

  state = enterDigit(state, '2');
  state = enterOperator(state, '+');
  state = enterDigit(state, '3');
  assert.equal(evaluateSession(state).display, '5');
});

test('a completed constant root index closes before the next operator', () => {
  let state = createSession();
  for (const digit of '16') state = enterDigit(state, digit);
  state = toggleShift(state);
  state = enterNthRoot(state);
  state = enterConstant(state, 'pi');
  state = enterOperator(state, '+');
  state = enterDigit(state, '1');

  const result = Number(evaluateSession(state).display);
  assert.ok(Math.abs(result - (16 ** (1 / Math.PI) + 1)) < 1e-12);
});

test('nested nth roots all close before continuing the expression', () => {
  let state = createSession();
  for (const digit of '16') state = enterDigit(state, digit);
  state = toggleShift(state);
  state = enterNthRoot(state);
  for (const digit of '27') state = enterDigit(state, digit);
  state = toggleShift(state);
  state = enterNthRoot(state);
  state = enterDigit(state, '3');
  state = enterOperator(state, '+');
  state = enterDigit(state, '1');

  const result = Number(evaluateSession(state).display);
  assert.ok(Math.abs(result - (16 ** (1 / 3) + 1)) < 1e-12);
});

test('a function-valued root index closes before continuing the expression', () => {
  let state = createSession();
  for (const digit of '16') state = enterDigit(state, digit);
  state = toggleShift(state);
  state = enterNthRoot(state);
  state = applyFunction(state, 'sqrt');
  state = enterDigit(state, '4');
  state = enterOperator(state, '+');
  state = enterDigit(state, '1');

  assert.equal(evaluateSession(state).display, '5');
});

