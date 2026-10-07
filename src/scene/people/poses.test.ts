import { describe, expect, it } from 'vitest';
import { poseAt, type Pose } from './poses';

const POSES: Pose[] = ['walk', 'inspect', 'maintain', 'sit'];

describe('poseAt', () => {
  it('swings opposite legs while walking', () => {
    const pose = poseAt('walk', 0.1, true);
    expect(Math.abs(pose.leftLeg)).toBeGreaterThan(0.1);
    expect(pose.leftLeg).toBeCloseTo(-pose.rightLeg);
  });

  it('keeps the legs still when a walker is paused', () => {
    const pose = poseAt('walk', 0.1, false);
    expect(pose.leftLeg).toBe(0);
    expect(pose.rightLeg).toBe(0);
  });

  it('repeats the walking cycle every 2*PI/7 seconds', () => {
    const period = (2 * Math.PI) / 7;
    expect(poseAt('walk', 0.3, true).leftLeg).toBeCloseTo(poseAt('walk', 0.3 + period, true).leftLeg, 8);
  });

  it('seats the operator with the legs forward and the hips lowered', () => {
    const pose = poseAt('sit', 0, false);
    expect(pose.leftLeg).toBeLessThan(-1.2);
    expect(pose.crouch).toBeGreaterThan(0.5);
  });

  it('crouches the maintainer', () => {
    expect(poseAt('maintain', 0, false).crouch).toBeGreaterThan(0.5);
  });

  it('keeps every angle finite for every pose, even at a huge elapsed time', () => {
    for (const pose of POSES) {
      for (const moving of [true, false]) {
        const angles = poseAt(pose, 1e6, moving);
        expect(Object.values(angles).every(Number.isFinite)).toBe(true);
      }
    }
  });
});
