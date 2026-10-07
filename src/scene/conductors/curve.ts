import { TERMINALS } from '../../data/terminals';
import type { Equipment, Vec3 } from '../../data/types';

export function terminalWorldPosition(equipment: Equipment, terminal: string): Vec3 {
  const terminals = TERMINALS[equipment.type];
  if (!Object.hasOwn(terminals, terminal)) {
    throw new Error(`Equipment "${equipment.id}" has no terminal "${terminal}"`);
  }
  const [x, y, z] = terminals[terminal];
  const [px, py, pz] = equipment.position;
  const angle = equipment.rotationY ?? 0;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [px + x * cos + z * sin, py + y, pz - x * sin + z * cos];
}

export function sagPoints(from: Vec3, to: Vec3, sag: number, segments = 24): Vec3[] {
  const count = Math.max(1, Math.floor(segments));
  const points: Vec3[] = [];
  for (let i = 0; i <= count; i += 1) {
    const t = i / count;
    const drop = 4 * sag * t * (1 - t);
    points.push([
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t - drop,
      from[2] + (to[2] - from[2]) * t,
    ]);
  }
  return points;
}
