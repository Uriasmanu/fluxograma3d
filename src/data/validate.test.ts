import { describe, expect, it } from 'vitest';
import type { EquipmentType, Yard } from './types';
import { validateYard } from './validate';

const baseYard = (overrides: Partial<Yard> = {}): Yard => ({
  equipment: [
    { id: 't1', type: 'transformer', position: [0, 0, 0] },
    { id: 'bb1', type: 'busbar', position: [0, 0, 10] },
  ],
  connections: [],
  workers: [],
  building: { position: [40, 0, 0], operators: 0 },
  ...overrides,
});

describe('validateYard', () => {
  it('keeps connections whose endpoints exist', () => {
    const yard = baseYard({
      connections: [{ from: { equipmentId: 't1', terminal: 'lv1' }, to: { equipmentId: 'bb1', terminal: 'tap1' } }],
    });
    const result = validateYard(yard);
    expect(result.errors).toEqual([]);
    expect(result.validConnections).toHaveLength(1);
  });

  it('drops a connection to unknown equipment', () => {
    const yard = baseYard({
      connections: [{ from: { equipmentId: 't1', terminal: 'lv1' }, to: { equipmentId: 'ghost', terminal: 'tap1' } }],
    });
    const result = validateYard(yard);
    expect(result.validConnections).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('unknown equipment "ghost"');
  });

  it('drops a connection to an unknown terminal', () => {
    const yard = baseYard({
      connections: [{ from: { equipmentId: 't1', terminal: 'nope' }, to: { equipmentId: 'bb1', terminal: 'tap1' } }],
    });
    const result = validateYard(yard);
    expect(result.validConnections).toHaveLength(0);
    expect(result.errors[0]).toContain('has no terminal "nope"');
  });

  it('does not accept prototype keys as terminals', () => {
    const yard = baseYard({
      connections: [{ from: { equipmentId: 't1', terminal: 'toString' }, to: { equipmentId: 'bb1', terminal: 'tap1' } }],
    });
    expect(validateYard(yard).validConnections).toHaveLength(0);
  });

  it('reports duplicate equipment ids', () => {
    const yard = baseYard({
      equipment: [
        { id: 't1', type: 'transformer', position: [0, 0, 0] },
        { id: 't1', type: 'busbar', position: [0, 0, 10] },
      ],
    });
    const result = validateYard(yard);
    expect(result.errors).toContain('Duplicate equipment id "t1"');
  });

  it('returns the equipment list without duplicates, keeping the first entry', () => {
    const yard = baseYard({
      equipment: [
        { id: 't1', type: 'transformer', position: [0, 0, 0] },
        { id: 't1', type: 'busbar', position: [0, 0, 10] },
      ],
    });
    const result = validateYard(yard);
    expect(result.equipment).toHaveLength(1);
    expect(result.equipment[0].type).toBe('transformer');
  });

  it('drops walkers without a usable route and reports them', () => {
    const yard = baseYard({
      workers: [
        { id: 'w1', role: 'walker', position: [0, 0, 0], route: [] },
        { id: 'w2', role: 'walker', position: [0, 0, 0] },
        { id: 'w3', role: 'walker', position: [0, 0, 0], route: [[0, 0, 0], [1, 0, 0]] },
        { id: 'w4', role: 'inspector', position: [0, 0, 0], facing: [1, 0, 0] },
      ],
    });
    const result = validateYard(yard);
    expect(result.workers.map((worker) => worker.id)).toEqual(['w3', 'w4']);
    expect(result.errors).toContain('Walker "w1" needs a route with at least 2 points');
    expect(result.errors).toContain('Walker "w2" needs a route with at least 2 points');
  });

  it('rejects a connection to equipment that has no terminals', () => {
    const yard = baseYard({
      equipment: [
        { id: 't1', type: 'transformer', position: [0, 0, 0] },
        { id: 'cb1', type: 'cabinet', position: [10, 0, 0] },
      ],
      connections: [{ from: { equipmentId: 't1', terminal: 'lv1' }, to: { equipmentId: 'cb1', terminal: 'top' } }],
    });
    const result = validateYard(yard);
    expect(result.validConnections).toHaveLength(0);
    expect(result.errors[0]).toContain('has no terminal "top"');
  });

  it('reports unknown equipment types and drops their connections', () => {
    const yard = baseYard({
      equipment: [
        { id: 'x', type: 'crane' as EquipmentType, position: [0, 0, 0] },
        { id: 'bb1', type: 'busbar', position: [0, 0, 10] },
      ],
      connections: [{ from: { equipmentId: 'x', terminal: 'top' }, to: { equipmentId: 'bb1', terminal: 'tap1' } }],
    });
    const result = validateYard(yard);
    expect(result.errors.some((error) => error.includes('Unknown equipment type "crane"'))).toBe(true);
    expect(result.validConnections).toHaveLength(0);
  });
});
