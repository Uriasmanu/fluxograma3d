import type { Vec3, Viewpoint } from './types';

const ISO_OFFSET: Vec3 = [-57.735, 57.735, 57.735];

function isoViewpoint(id: string, label: string, target: Vec3, span: number, openRoof?: boolean): Viewpoint {
  const position: Vec3 = [target[0] + ISO_OFFSET[0], target[1] + ISO_OFFSET[1], target[2] + ISO_OFFSET[2]];
  return { id, label, position, target, span, openRoof };
}

export const VIEWPOINTS: Viewpoint[] = [
  isoViewpoint('overview', 'Visão geral', [3, 0, 0], 118),
  isoViewpoint('line-entry', 'Entrada de linha', [0, 0, -14], 36),
  isoViewpoint('transformers', 'Transformadores', [0, 0, 3], 50),
  isoViewpoint('monitoring-room', 'Sala de monitoramento', [38, 0, 0], 34, true),
];
