import { describe, expect, it } from 'vitest';
import { stepFade } from './fade';

describe('stepFade', () => {
  it('moves toward a higher target by delta / duration', () => {
    expect(stepFade(0, 1, 0.1, 0.4)).toBeCloseTo(0.25);
  });

  it('moves toward a lower target', () => {
    expect(stepFade(1, 0, 0.2, 0.4)).toBeCloseTo(0.5);
  });

  it('does not change when already at the target', () => {
    expect(stepFade(1, 1, 0.5, 0.4)).toBe(1);
    expect(stepFade(0, 0, 0.5, 0.4)).toBe(0);
  });

  it('lands exactly on the target after a huge delta instead of overshooting', () => {
    expect(stepFade(0, 1, 1000, 0.4)).toBe(1);
    expect(stepFade(1, 0, 1000, 0.4)).toBe(0);
  });

  it('ignores a negative delta', () => {
    expect(stepFade(0.5, 1, -1, 0.4)).toBe(0.5);
  });

  it('jumps straight to the target when the duration is not positive', () => {
    expect(stepFade(0, 1, 0.01, 0)).toBe(1);
    expect(stepFade(1, 0, 0.01, -2)).toBe(0);
  });
});
