import type { Yard } from './types';

export const YARD_SIZE = { width: 60, depth: 40 } as const;

const CHAIN_ROTATION = -Math.PI / 2;
const HV_TOWARD_ENTRY = -Math.PI / 2;

export const YARD: Yard = {
  equipment: [
    { id: 'g1', type: 'gantry', position: [0, 0, -17] },
    { id: 'd1', type: 'disconnector', position: [0, 0, -11], rotationY: CHAIN_ROTATION },
    { id: 'pt1', type: 'pt', position: [3, 0, -9] },
    { id: 'b1', type: 'breaker', position: [0, 0, -7], rotationY: CHAIN_ROTATION },
    { id: 'ct1', type: 'ct', position: [0, 0, -3.5], rotationY: CHAIN_ROTATION },
    { id: 't1', type: 'transformer', position: [-8, 0, 3], rotationY: HV_TOWARD_ENTRY },
    { id: 't2', type: 'transformer', position: [8, 0, 3], rotationY: HV_TOWARD_ENTRY },
    { id: 'sa1', type: 'arrester', position: [-12, 0, 1] },
    { id: 'sa2', type: 'arrester', position: [12, 0, 1] },
    { id: 'bb1', type: 'busbar', position: [0, 0, 13] },
  ],
  connections: [
    { from: { equipmentId: 'g1', terminal: 'mid' }, to: { equipmentId: 'd1', terminal: 'in' }, sag: 1 },
    { from: { equipmentId: 'd1', terminal: 'out' }, to: { equipmentId: 'b1', terminal: 'in' }, sag: 0.3 },
    { from: { equipmentId: 'd1', terminal: 'out' }, to: { equipmentId: 'pt1', terminal: 'top' }, sag: 0.3 },
    { from: { equipmentId: 'b1', terminal: 'out' }, to: { equipmentId: 'ct1', terminal: 'in' }, sag: 0.3 },
    { from: { equipmentId: 'ct1', terminal: 'out' }, to: { equipmentId: 't1', terminal: 'hv1' }, sag: 0.8 },
    { from: { equipmentId: 'ct1', terminal: 'out' }, to: { equipmentId: 't2', terminal: 'hv1' }, sag: 0.8 },
    { from: { equipmentId: 't1', terminal: 'hv1' }, to: { equipmentId: 'sa1', terminal: 'top' }, sag: 0.2 },
    { from: { equipmentId: 't2', terminal: 'hv1' }, to: { equipmentId: 'sa2', terminal: 'top' }, sag: 0.2 },
    { from: { equipmentId: 't1', terminal: 'lv1' }, to: { equipmentId: 'bb1', terminal: 'tap1' }, sag: 0.8 },
    { from: { equipmentId: 't2', terminal: 'lv1' }, to: { equipmentId: 'bb1', terminal: 'tap2' }, sag: 0.8 },
  ],
  workers: [
    {
      id: 'w-walker-1',
      role: 'walker',
      position: [-14, 0, 9],
      route: [
        [-14, 0, 9],
        [14, 0, 9],
      ],
      vestColor: '#ff7a1a',
    },
    {
      id: 'w-walker-2',
      role: 'walker',
      position: [-6, 0, -14],
      route: [
        [-6, 0, -14],
        [6, 0, -14],
        [6, 0, -5],
        [-6, 0, -5],
      ],
      vestColor: '#ffd23f',
    },
    { id: 'w-inspector-1', role: 'inspector', position: [-8, 0, -0.3], facing: [-8, 0, 3], vestColor: '#ff7a1a' },
    { id: 'w-inspector-2', role: 'inspector', position: [8, 0, -0.3], facing: [8, 0, 3], vestColor: '#ffd23f' },
    { id: 'w-maintainer-1', role: 'maintainer', position: [-12, 0, -1.5], facing: [-12, 0, 1], vestColor: '#ff7a1a' },
  ],
  building: { position: [38, 0, 0], rotationY: -Math.PI / 2, operators: 3 },
};
