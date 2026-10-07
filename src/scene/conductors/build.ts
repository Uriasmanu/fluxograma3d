import type { Equipment, Vec3, WorkerSpec, Yard } from '../../data/types';
import { validateYard } from '../../data/validate';
import { terminalWorldPosition } from './curve';

export interface ConductorSpec {
  key: string;
  from: Vec3;
  to: Vec3;
  sag?: number;
}

export interface YardScene {
  equipment: Equipment[];
  workers: WorkerSpec[];
  conductors: ConductorSpec[];
  errors: string[];
}

export function buildYardScene(yard: Yard): YardScene {
  const { equipment, validConnections, workers, errors } = validateYard(yard);
  const byId = new Map(equipment.map((item) => [item.id, item]));
  const conductors = validConnections.map(({ from, to, sag }) => ({
    key: `${from.equipmentId}.${from.terminal}>${to.equipmentId}.${to.terminal}`,
    from: terminalWorldPosition(byId.get(from.equipmentId)!, from.terminal),
    to: terminalWorldPosition(byId.get(to.equipmentId)!, to.terminal),
    sag,
  }));
  return { equipment, workers, conductors, errors };
}
