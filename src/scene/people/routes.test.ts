import { describe, expect, it } from 'vitest';
import type { Vec3 } from '../../data/types';
import { headingBetween, sampleRoute } from './routes';

const OUT_AND_BACK: Vec3[] = [
  [0, 0, 0],
  [10, 0, 0],
];
const OPTIONS = { speed: 2, pause: 1 };

describe('sampleRoute', () => {
  it('waits at the first point before moving', () => {
    const sample = sampleRoute(OUT_AND_BACK, OPTIONS, 0);
    expect(sample.position).toEqual([0, 0, 0]);
    expect(sample.moving).toBe(false);
  });

  it('walks toward the next point after the pause', () => {
    const sample = sampleRoute(OUT_AND_BACK, OPTIONS, 3.5);
    expect(sample.position[0]).toBeCloseTo(5);
    expect(sample.moving).toBe(true);
    expect(sample.heading).toBeCloseTo(Math.PI / 2);
  });

  it('pauses at the far point and then returns facing the other way', () => {
    const paused = sampleRoute(OUT_AND_BACK, OPTIONS, 6.5);
    expect(paused.position[0]).toBeCloseTo(10);
    expect(paused.moving).toBe(false);

    const back = sampleRoute(OUT_AND_BACK, OPTIONS, 9.5);
    expect(back.position[0]).toBeCloseTo(5);
    expect(back.heading).toBeCloseTo(-Math.PI / 2);
  });

  it('loops with a period equal to the full cycle', () => {
    const first = sampleRoute(OUT_AND_BACK, OPTIONS, 3.5);
    const again = sampleRoute(OUT_AND_BACK, OPTIONS, 3.5 + 12);
    expect(again.position[0]).toBeCloseTo(first.position[0]);
  });

  it('stays finite and inside the route for a huge elapsed time', () => {
    const sample = sampleRoute(OUT_AND_BACK, OPTIONS, 1e7 + 0.3);
    expect(Number.isFinite(sample.position[0])).toBe(true);
    expect(sample.position[0]).toBeGreaterThanOrEqual(0);
    expect(sample.position[0]).toBeLessThanOrEqual(10);
  });

  it('handles negative time by wrapping', () => {
    const sample = sampleRoute(OUT_AND_BACK, OPTIONS, -1);
    expect(Number.isFinite(sample.position[0])).toBe(true);
  });

  it('stays at the only point of a one-point route', () => {
    const sample = sampleRoute([[3, 0, 4]], OPTIONS, 5);
    expect(sample.position).toEqual([3, 0, 4]);
    expect(sample.moving).toBe(false);
  });

  it('throws for an empty route', () => {
    expect(() => sampleRoute([], OPTIONS, 0)).toThrow('at least one point');
  });

  it('throws for a speed that is not positive', () => {
    expect(() => sampleRoute(OUT_AND_BACK, { speed: 0, pause: 1 }, 0)).toThrow('speed');
    expect(() => sampleRoute(OUT_AND_BACK, { speed: -1, pause: 1 }, 0)).toThrow('speed');
  });

  it('never returns NaN when consecutive points repeat', () => {
    const route: Vec3[] = [
      [0, 0, 0],
      [0, 0, 0],
      [4, 0, 0],
    ];
    for (let time = 0; time < 30; time += 0.37) {
      const sample = sampleRoute(route, OPTIONS, time);
      expect(sample.position.every(Number.isFinite)).toBe(true);
      expect(Number.isFinite(sample.heading)).toBe(true);
    }
  });

  it('stays still when the whole route is one repeated point with no pause', () => {
    const route: Vec3[] = [
      [1, 0, 1],
      [1, 0, 1],
    ];
    const sample = sampleRoute(route, { speed: 1, pause: 0 }, 7);
    expect(sample.position).toEqual([1, 0, 1]);
    expect(sample.moving).toBe(false);
  });
});

describe('headingBetween', () => {
  it('is 0 when the target is straight ahead on +Z', () => {
    expect(headingBetween([0, 0, 0], [0, 0, 5])).toBe(0);
  });

  it('is PI/2 when the target is on +X', () => {
    expect(headingBetween([0, 0, 0], [5, 0, 0])).toBeCloseTo(Math.PI / 2);
  });

  it('is 0 when both points are the same', () => {
    expect(headingBetween([2, 0, 2], [2, 0, 2])).toBe(0);
  });
});
