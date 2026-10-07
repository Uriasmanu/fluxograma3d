import { describe, expect, it } from 'vitest';
import { fencePosts } from './fencePosts';

describe('fencePosts', () => {
  it('places 66 distinct posts around a 60 x 40 fence every 3 m', () => {
    const posts = fencePosts(60, 40, 3);
    expect(posts).toHaveLength(66);
    expect(new Set(posts.map(([x, z]) => `${x.toFixed(3)},${z.toFixed(3)}`)).size).toBe(66);
  });

  it('includes the four corners', () => {
    const posts = fencePosts(60, 40, 3).map(([x, z]) => `${x.toFixed(3)},${z.toFixed(3)}`);
    for (const corner of ['-30.000,-20.000', '30.000,-20.000', '30.000,20.000', '-30.000,20.000']) {
      expect(posts).toContain(corner);
    }
  });

  it('keeps every post on the perimeter', () => {
    for (const [x, z] of fencePosts(60, 40, 3)) {
      const onVertical = Math.abs(Math.abs(x) - 30) < 1e-9;
      const onHorizontal = Math.abs(Math.abs(z) - 20) < 1e-9;
      expect(onVertical || onHorizontal).toBe(true);
    }
  });

  it('still returns posts when the spacing is larger than the fence', () => {
    expect(fencePosts(4, 4, 100).length).toBeGreaterThanOrEqual(4);
  });
});
