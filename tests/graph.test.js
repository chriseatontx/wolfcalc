import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleGraph } from '../js/core/graph.js';

test('samples a Cartesian function across the requested x interval', () => {
  const points = sampleGraph('x^2', { xMin: -2, xMax: 2, samples: 4 });
  assert.deepEqual(points.map(({ x, y }) => [x, y]), [
    [-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4],
  ]);
});

test('graph samples respect calculator angle mode and retain domain gaps', () => {
  const points = sampleGraph('1/x', { xMin: -1, xMax: 1, samples: 2 });
  assert.equal(points[1].y, null);
  const degreePoints = sampleGraph('sin(x)', { xMin: 0, xMax: 90, samples: 1, angleMode: 'DEG' });
  assert.equal(degreePoints.at(-1).y, 1);
});
