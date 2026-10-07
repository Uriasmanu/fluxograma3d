import { describe, expect, it } from 'vitest';
import type { Equipment, Vec3 } from '../../data/types';
import { sagPoints, terminalWorldPosition } from './curve';

const transformer = (overrides: Partial<Equipment> = {}): Equipment => ({
  id: 't1',
  type: 'transformer',
  position: [10, 0, 5],
  ...overrides,
});

describe('terminalWorldPosition', () => {
  it('adds the equipment position to the local terminal', () => {
    expect(terminalWorldPosition(transformer(), 'lv1')).toEqual([11.5, 4.4, 5]);
  });

  it('rotates around Y before translating', () => {
    const [x, y, z] = terminalWorldPosition(transformer({ rotationY: Math.PI / 2 }), 'lv1');
    expect(x).toBeCloseTo(10);
    expect(y).toBeCloseTo(4.4);
    expect(z).toBeCloseTo(3.5);
  });

  it('throws for a terminal that does not exist', () => {
    expect(() => terminalWorldPosition(transformer(), 'nope')).toThrow('no terminal "nope"');
  });

  it('throws for prototype keys', () => {
    expect(() => terminalWorldPosition(transformer(), 'toString')).toThrow('no terminal "toString"');
  });
});

describe('sagPoints', () => {
  const from: Vec3 = [0, 5, 0];
  const to: Vec3 = [10, 5, 0];

  it('returns segments + 1 points that start and end at the terminals', () => {
    const points = sagPoints(from, to, 1, 10);
    expect(points).toHaveLength(11);
    expect(points[0]).toEqual(from);
    expect(points[10]).toEqual(to);
  });

  it('defaults to 24 segments', () => {
    expect(sagPoints(from, to, 1)).toHaveLength(25);
  });

  it('drops by the sag at the midpoint', () => {
    const points = sagPoints(from, to, 1, 10);
    expect(points[5][1]).toBeCloseTo(4);
  });

  it('is a straight line with zero sag', () => {
    const points = sagPoints(from, to, 0, 4);
    expect(points.map((point) => point[1])).toEqual([5, 5, 5, 5, 5]);
  });

  it('never produces NaN when both ends are the same point', () => {
    const points = sagPoints(from, from, 0.6);
    expect(points.every((point) => point.every(Number.isFinite))).toBe(true);
  });

  it('treats a segment count below 1 as 1', () => {
    expect(sagPoints(from, to, 1, 0)).toHaveLength(2);
  });
});
