import { describe, expect, it } from 'vitest';
import { validateYard } from './validate';
import { YARD, YARD_SIZE } from './yard';

const HALF_WIDTH = YARD_SIZE.width / 2;
const HALF_DEPTH = YARD_SIZE.depth / 2;

describe('YARD', () => {
  it('has no validation errors and keeps every connection', () => {
    const result = validateYard(YARD);
    expect(result.errors).toEqual([]);
    expect(result.validConnections).toHaveLength(YARD.connections.length);
  });

  it('has two power transformers', () => {
    expect(YARD.equipment.filter((item) => item.type === 'transformer')).toHaveLength(2);
  });

  it('keeps every piece of equipment inside the fence', () => {
    for (const { id, position } of YARD.equipment) {
      expect(Math.abs(position[0]), id).toBeLessThanOrEqual(HALF_WIDTH);
      expect(Math.abs(position[2]), id).toBeLessThanOrEqual(HALF_DEPTH);
    }
  });

  it('keeps worker positions, routes and facing targets inside the fence', () => {
    for (const worker of YARD.workers) {
      const points = [worker.position, ...(worker.route ?? []), ...(worker.facing ? [worker.facing] : [])];
      for (const point of points) {
        expect(Math.abs(point[0]), worker.id).toBeLessThanOrEqual(HALF_WIDTH);
        expect(Math.abs(point[2]), worker.id).toBeLessThanOrEqual(HALF_DEPTH);
      }
    }
  });

  it('has between 6 and 8 people counting the operators', () => {
    const total = YARD.workers.length + YARD.building.operators;
    expect(total).toBeGreaterThanOrEqual(6);
    expect(total).toBeLessThanOrEqual(8);
  });

  it('gives every walker a route with at least two points', () => {
    for (const worker of YARD.workers.filter((item) => item.role === 'walker')) {
      expect(worker.route?.length ?? 0, worker.id).toBeGreaterThanOrEqual(2);
    }
  });
});
