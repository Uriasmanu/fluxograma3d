export type Vec3 = [number, number, number];

export type EquipmentType =
  | 'transformer'
  | 'breaker'
  | 'disconnector'
  | 'ct'
  | 'pt'
  | 'arrester'
  | 'gantry'
  | 'busbar';

export interface Equipment {
  id: string;
  type: EquipmentType;
  position: Vec3;
  rotationY?: number;
}

export interface TerminalRef {
  equipmentId: string;
  terminal: string;
}

export interface Connection {
  from: TerminalRef;
  to: TerminalRef;
  sag?: number;
}

export type WorkerRole = 'walker' | 'inspector' | 'maintainer';

export interface WorkerSpec {
  id: string;
  role: WorkerRole;
  position: Vec3;
  route?: Vec3[];
  facing?: Vec3;
  vestColor?: string;
}

export interface Yard {
  equipment: Equipment[];
  connections: Connection[];
  workers: WorkerSpec[];
  building: {
    position: Vec3;
    rotationY?: number;
    operators: number;
  };
}

export interface Viewpoint {
  id: string;
  label: string;
  position: Vec3;
  target: Vec3;
  openRoof?: boolean;
}
