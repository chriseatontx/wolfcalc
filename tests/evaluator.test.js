import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExpression } from '../js/core/evaluator.js';

test('evaluates precedence, parentheses, and right-associative powers', () => {
  assert.equal(evaluateExpression('2+3×4'), 14);
  assert.equal(evaluateExpression('(2+3)×4'), 20);
  assert.equal(evaluateExpression('2^3^2'), 512);
  assert.equal(evaluateExpression('2*(3+(4*5))'), 46);
});

test('supports ASCII operators, division, decimals, and unary signs', () => {
  assert.equal(evaluateExpression('8/2+1.5'), 5.5);
  assert.equal(evaluateExpression('−2^2'), -4);
  assert.equal(evaluateExpression('2^-2'), 0.25);
});

test('returns Error for malformed expressions and mismatched parentheses', () => {
  for (const expression of ['(2+3', '2+3)', '', '2**3', '2/0', '2+abc']) {
    assert.equal(evaluateExpression(expression), 'Error', expression);
  }
});

test('evaluates calculator functions, constants, factorials, and percentages', () => {
  assert.ok(Math.abs(evaluateExpression('sin(30)') - 0.5) < 1e-12);
  assert.ok(Math.abs(evaluateExpression('sin(π/2)', { angleMode: 'RAD' }) - 1) < 1e-12);
  assert.equal(evaluateExpression('log(100)+ln(e)'), 3);
  assert.equal(evaluateExpression('sqrt(81)+3!'), 15);
  assert.equal(evaluateExpression('25%*4'), 1);
  assert.equal(evaluateExpression('pow10(3)'), 1000);
  assert.equal(evaluateExpression('sin(90)', { angleMode: 'RAD' }), Math.sin(90));
  assert.equal(evaluateExpression('tan(90)'), 'Error');
});
