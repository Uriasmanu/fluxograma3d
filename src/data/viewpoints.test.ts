import { describe, expect, it } from 'vitest';
import { CAMERA_LIMITS, ISO_POLAR } from './cameraLimits';
import { VIEWPOINTS } from './viewpoints';

const polarOf = (viewpoint: (typeof VIEWPOINTS)[number]) => {
  const [dx, dy, dz] = viewpoint.position.map((value, axis) => value - viewpoint.target[axis]);
  return Math.acos(dy / Math.hypot(dx, dy, dz));
};

describe('VIEWPOINTS', () => {
  it.each(VIEWPOINTS.map((viewpoint) => [viewpoint.id, viewpoint] as const))(
    '%s uses the isometric tilt and a span inside the limits',
    (_id, viewpoint) => {
      expect(polarOf(viewpoint)).toBeCloseTo(ISO_POLAR, 3);
      expect(viewpoint.span).toBeGreaterThanOrEqual(CAMERA_LIMITS.minSpan);
      expect(viewpoint.span).toBeLessThanOrEqual(CAMERA_LIMITS.maxSpan);
    },
  );

  it.each(VIEWPOINTS.map((viewpoint) => [viewpoint.id, viewpoint] as const))(
    '%s targets a point inside the pan bounds, including its height',
    (_id, viewpoint) => {
      const { min, max } = CAMERA_LIMITS.bounds;
      for (const axis of [0, 1, 2]) {
        expect(viewpoint.target[axis]).toBeGreaterThanOrEqual(min[axis]);
        expect(viewpoint.target[axis]).toBeLessThanOrEqual(max[axis]);
      }
    },
  );

  it('has unique ids and non-empty labels', () => {
    expect(new Set(VIEWPOINTS.map((viewpoint) => viewpoint.id)).size).toBe(VIEWPOINTS.length);
    expect(VIEWPOINTS.every((viewpoint) => viewpoint.label.trim().length > 0)).toBe(true);
  });

  it('opens the roof only for the monitoring room', () => {
    const withRoof = VIEWPOINTS.filter((viewpoint) => viewpoint.openRoof).map((viewpoint) => viewpoint.id);
    expect(withRoof).toEqual(['monitoring-room']);
  });
});
