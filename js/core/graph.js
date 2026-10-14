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
  const yMin = Number.isFinite(options.yMin) ? options.yMin : null;
  const yMax = Number.isFinite(options.yMax) ? options.yMax : null;
  const evaluateAt = x => {
    const result = evaluateExpression(graphExpression, { angleMode: options.angleMode, variables: { x } });
    return typeof result === 'number' && Number.isFinite(result) ? result : null;
  };
  const samples = [];
  for (let index = 0; index <= count; index += 1) {
    const x = xMin + (xMax - xMin) * index / count;
    const y = evaluateAt(x);
    samples.push({ x, y: y !== null && yMin !== null && yMax !== null && (y < yMin || y > yMax) ? null : y });
  }

  if (yMin === null || yMax === null) return samples;

  const points = [];
  for (let index = 0; index < samples.length - 1; index += 1) {
    const current = samples[index];
    const next = samples[index + 1];
    points.push(current);

    if (current.y === null || next.y === null) continue;
    const midpointX = (current.x + next.x) / 2;
    const midpointY = evaluateAt(midpointX);
    const midpointBreaksPath = midpointY === null
      || (current.y >= yMin && current.y <= yMax
        && next.y >= yMin && next.y <= yMax
        && (midpointY < yMin || midpointY > yMax));
    if (midpointBreaksPath) points.push({ x: midpointX, y: null });
  }
  points.push(samples.at(-1));
  return points;
}
