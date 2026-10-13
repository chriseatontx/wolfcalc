import test from 'node:test';
import assert from 'node:assert/strict';
import { applyScientific } from '../js/core/scientific.js';
import { evaluateExpression } from '../js/core/evaluator.js';
import { createSession, enterDigit, enterNthRoot, enterOperator, evaluateSession, toggleShift } from '../js/core/session.js';
import { sampleGraph } from '../js/core/graph.js';

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
