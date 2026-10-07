import { describe, expect, it } from 'vitest';
import { CAMERA_LIMITS } from './cameraLimits';
import { VIEWPOINTS } from './viewpoints';

const offset = (viewpoint: (typeof VIEWPOINTS)[number]) =>
  viewpoint.position.map((value, axis) => value - viewpoint.target[axis]);

describe('VIEWPOINTS', () => {
  it.each(VIEWPOINTS.map((viewpoint) => [viewpoint.id, viewpoint] as const))(
    '%s respects the polar angle and distance limits',
    (_id, viewpoint) => {
      const [dx, dy, dz] = offset(viewpoint);
      const distance = Math.hypot(dx, dy, dz);
      const polar = Math.acos(dy / distance);
      expect(polar).toBeGreaterThanOrEqual(CAMERA_LIMITS.minPolar);
      expect(polar).toBeLessThanOrEqual(CAMERA_LIMITS.maxPolar);
      expect(distance).toBeGreaterThanOrEqual(CAMERA_LIMITS.minDistance);
      expect(distance).toBeLessThanOrEqual(CAMERA_LIMITS.maxDistance);
    },
  );

  it.each(VIEWPOINTS.map((viewpoint) => [viewpoint.id, viewpoint] as const))(
    '%s targets a point inside the pan bounds',
    (_id, viewpoint) => {
      const { min, max } = CAMERA_LIMITS.bounds;
      expect(viewpoint.target[0]).toBeGreaterThanOrEqual(min[0]);
      expect(viewpoint.target[0]).toBeLessThanOrEqual(max[0]);
      expect(viewpoint.target[2]).toBeGreaterThanOrEqual(min[2]);
      expect(viewpoint.target[2]).toBeLessThanOrEqual(max[2]);
      expect(viewpoint.target[1]).toBeGreaterThanOrEqual(0);
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
