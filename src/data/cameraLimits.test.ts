import { describe, expect, it } from 'vitest';
import { CAMERA_LIMITS, ISO_POLAR, zoomForSpan } from './cameraLimits';
import { SLAB_SIZE } from './yard';

describe('ISO_POLAR', () => {
  it('is the isometric angle, about 54.74 degrees from the vertical', () => {
    expect((ISO_POLAR * 180) / Math.PI).toBeCloseTo(54.7356, 3);
  });
});

describe('zoomForSpan', () => {
  it('divides the viewport width by the span', () => {
    expect(zoomForSpan(60, 1200)).toBeCloseTo(20);
  });

  it('keeps a narrow phone in portrait at a proportionally smaller zoom', () => {
    expect(zoomForSpan(60, 390)).toBeCloseTo(6.5);
  });

  it('limits a tiny span to the minimum span', () => {
    expect(zoomForSpan(1, 1200)).toBeCloseTo(1200 / CAMERA_LIMITS.minSpan);
  });

  it('limits a huge span to the maximum span', () => {
    expect(zoomForSpan(1000, 1300)).toBeCloseTo(1300 / CAMERA_LIMITS.maxSpan);
  });
});

describe('CAMERA_LIMITS.bounds', () => {
  it('stays inside the slab', () => {
    const { min, max } = CAMERA_LIMITS.bounds;
    expect(Math.abs(min[0])).toBeLessThanOrEqual(SLAB_SIZE.width / 2);
    expect(Math.abs(max[0])).toBeLessThanOrEqual(SLAB_SIZE.width / 2);
    expect(Math.abs(min[2])).toBeLessThanOrEqual(SLAB_SIZE.depth / 2);
    expect(Math.abs(max[2])).toBeLessThanOrEqual(SLAB_SIZE.depth / 2);
  });
});
