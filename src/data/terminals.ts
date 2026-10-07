import type { EquipmentType, Vec3 } from './types';

export const TERMINALS: Record<EquipmentType, Record<string, Vec3>> = {
  transformer: { hv1: [-1.5, 5.4, 0], lv1: [1.5, 4.4, 0] },
  breaker: { in: [-0.8, 3.4, 0], out: [0.8, 3.4, 0] },
  disconnector: { in: [-1, 3, 0], out: [1, 3, 0] },
  ct: { in: [-0.4, 3.2, 0], out: [0.4, 3.2, 0] },
  pt: { top: [0, 3.2, 0] },
  arrester: { top: [0, 3.4, 0] },
  gantry: { left: [-4, 6, 0], mid: [0, 6, 0], right: [4, 6, 0] },
  busbar: { a: [-12, 4, 0], tap1: [-8, 4, 0], tap2: [8, 4, 0], b: [12, 4, 0] },
};
