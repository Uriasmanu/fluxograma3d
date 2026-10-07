import { TERMINALS } from './terminals';
import type { Connection, Equipment, EquipmentType, TerminalRef, Vec3, WorkerSpec, Yard } from './types';

export interface YardValidation {
  equipment: Equipment[];
  validConnections: Connection[];
  workers: WorkerSpec[];
  errors: string[];
}

const MIN_ROUTE_POINTS = 2;

function terminalsOf(type: string): Record<string, Vec3> | undefined {
  return Object.hasOwn(TERMINALS, type) ? TERMINALS[type as EquipmentType] : undefined;
}

export function validateYard(yard: Yard): YardValidation {
  const errors: string[] = [];
  const byId = new Map<string, Equipment>();

  for (const item of yard.equipment) {
    if (byId.has(item.id)) {
      errors.push(`Duplicate equipment id "${item.id}"`);
      continue;
    }
    byId.set(item.id, item);
    if (!terminalsOf(item.type)) errors.push(`Unknown equipment type "${item.type}" on "${item.id}"`);
  }

  const endpointProblem = (ref: TerminalRef): string | null => {
    const item = byId.get(ref.equipmentId);
    if (!item) return `unknown equipment "${ref.equipmentId}"`;
    const terminals = terminalsOf(item.type);
    if (!terminals) return `equipment "${item.id}" has unknown type "${item.type}"`;
    if (!Object.hasOwn(terminals, ref.terminal)) return `equipment "${item.id}" has no terminal "${ref.terminal}"`;
    return null;
  };

  const validConnections = yard.connections.filter((connection) => {
    const label = `${connection.from.equipmentId}.${connection.from.terminal} -> ${connection.to.equipmentId}.${connection.to.terminal}`;
    const problems = [endpointProblem(connection.from), endpointProblem(connection.to)].filter(
      (problem): problem is string => problem !== null,
    );
    for (const problem of problems) errors.push(`Connection ${label}: ${problem}`);
    return problems.length === 0;
  });

  const workers = yard.workers.filter((worker) => {
    const needsRoute = worker.role === 'walker' && (worker.route?.length ?? 0) < MIN_ROUTE_POINTS;
    if (needsRoute) errors.push(`Walker "${worker.id}" needs a route with at least ${MIN_ROUTE_POINTS} points`);
    return !needsRoute;
  });

  return { equipment: [...byId.values()], validConnections, workers, errors };
}
