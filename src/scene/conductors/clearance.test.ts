import { describe, expect, it } from 'vitest';
import { YARD } from '../../data/yard';
import { CONSERVATOR } from '../equipment/PowerTransformer';
import { buildYardScene } from './build';
import { DEFAULT_SAG } from './Conductor';
import { sagPoints } from './curve';

describe('conductor clearance', () => {
  it('keeps every conductor out of the transformer conservators', () => {
    const { conductors } = buildYardScene(YARD);
    for (const transformer of YARD.equipment.filter((item) => item.type === 'transformer')) {
      const angle = transformer.rotationY ?? 0;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      for (const { key, from, to, sag } of conductors) {
        for (const [x, y, z] of sagPoints(from, to, sag ?? DEFAULT_SAG, 48)) {
          const dx = x - transformer.position[0];
          const dz = z - transformer.position[2];
          const localZ = dx * sin + dz * cos;
          const localX = dx * cos - dz * sin;
          const alongAxis = Math.abs(localZ) <= CONSERVATOR.length / 2;
          const insideTank = alongAxis && Math.hypot(localX, y - CONSERVATOR.y) < CONSERVATOR.radius;
          expect(insideTank, `${key} crosses the conservator of ${transformer.id}`).toBe(false);
        }
      }
    }
  });
});
