import { describe, expect, it } from 'vitest';
import { TREE_POSITIONS } from './trees';
import { SLAB_SIZE, YARD, YARD_SIZE } from './yard';

const FOLIAGE_MARGIN = 3;

describe('TREE_POSITIONS', () => {
  it('keeps every tree on the slab with room for the foliage', () => {
    for (const [x, , z] of TREE_POSITIONS) {
      expect(Math.abs(x)).toBeLessThanOrEqual(SLAB_SIZE.width / 2 - FOLIAGE_MARGIN);
      expect(Math.abs(z)).toBeLessThanOrEqual(SLAB_SIZE.depth / 2 - FOLIAGE_MARGIN);
    }
  });

  it('keeps every tree outside the fence', () => {
    for (const [x, , z] of TREE_POSITIONS) {
      const insideFence = Math.abs(x) <= YARD_SIZE.width / 2 + 1 && Math.abs(z) <= YARD_SIZE.depth / 2 + 1;
      expect(insideFence).toBe(false);
    }
  });

  it('keeps every tree away from the admin building', () => {
    const [bx, , bz] = YARD.building.position;
    for (const [x, , z] of TREE_POSITIONS) {
      expect(Math.hypot(x - bx, z - bz)).toBeGreaterThanOrEqual(10);
    }
  });
});
