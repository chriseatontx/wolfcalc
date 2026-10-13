import { evaluateExpression } from './evaluator.js';

export function completeExpression(expression) {
  const source = String(expression);
  const opens = source.split('(').length - 1;
  const closes = source.split(')').length - 1;
  return source + ')'.repeat(Math.max(0, opens - closes));
}

/** Sample a calculator expression over a finite x interval for a Cartesian plot. */
export function sampleGraph(expression, options = {}) {
  const graphExpression = completeExpression(expression);
  const xMin = Number.isFinite(options.xMin) ? options.xMin : -10;
  const xMax = Number.isFinite(options.xMax) ? options.xMax : 10;
  const count = Math.max(2, Math.min(1000, Math.floor(options.samples ?? 240)));
  const samples = [];
  for (let index = 0; index <= count; index += 1) {
    const x = xMin + (xMax - xMin) * index / count;
    const result = evaluateExpression(graphExpression, { angleMode: options.angleMode, variables: { x } });
    samples.push({ x, y: typeof result === 'number' && Number.isFinite(result) ? result : null });
  }
  return samples;
}
