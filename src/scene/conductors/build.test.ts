import { describe, expect, it } from 'vitest';
import type { Yard } from '../../data/types';
import { YARD } from '../../data/yard';
import { buildYardScene } from './build';

const duplicateYard: Yard = {
  equipment: [
    { id: 't1', type: 'transformer', position: [0, 0, 0] },
    { id: 't1', type: 'busbar', position: [0, 0, 10] },
    { id: 'bb1', type: 'busbar', position: [0, 0, 10] },
  ],
  connections: [{ from: { equipmentId: 't1', terminal: 'lv1' }, to: { equipmentId: 'bb1', terminal: 'tap1' } }],
  workers: [],
  building: { position: [40, 0, 0], operators: 0 },
};

describe('buildYardScene', () => {
  it('does not throw on duplicated ids and anchors conductors to the first entry', () => {
    const scene = buildYardScene(duplicateYard);
    expect(scene.equipment.map((item) => item.type)).toEqual(['transformer', 'busbar']);
    expect(scene.conductors).toHaveLength(1);
    expect(scene.conductors[0].from).toEqual([1.5, 4.4, 0]);
    expect(scene.errors).toContain('Duplicate equipment id "t1"');
  });

  it('builds one conductor with a unique key per connection of the real yard', () => {
    const scene = buildYardScene(YARD);
    expect(scene.conductors).toHaveLength(YARD.connections.length);
    expect(new Set(scene.conductors.map((conductor) => conductor.key)).size).toBe(scene.conductors.length);
  });
});
