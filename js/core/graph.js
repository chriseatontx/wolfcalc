import { evaluateExpression } from './evaluator.js';

/** Sample a calculator expression over a finite x interval for a Cartesian plot. */
export function sampleGraph(expression, options = {}) {
  const xMin = Number.isFinite(options.xMin) ? options.xMin : -10;
  const xMax = Number.isFinite(options.xMax) ? options.xMax : 10;
  const count = Math.max(2, Math.min(1000, Math.floor(options.samples ?? 240)));
  const samples = [];
  for (let index = 0; index <= count; index += 1) {
    const x = xMin + (xMax - xMin) * index / count;
    const result = evaluateExpression(expression, { angleMode: options.angleMode, variables: { x } });
    samples.push({ x, y: typeof result === 'number' && Number.isFinite(result) ? result : null });
  }
  return samples;
}
