import type { Viewpoint } from './types';

export const VIEWPOINTS: Viewpoint[] = [
  { id: 'overview', label: 'Visão geral', position: [-53, 80, 56], target: [3, 0, 0] },
  { id: 'line-entry', label: 'Entrada de linha', position: [-12, 20, -2], target: [0, 3, -14] },
  { id: 'transformers', label: 'Transformadores', position: [-18, 32, 21], target: [0, 2, 3] },
  { id: 'monitoring-room', label: 'Sala de monitoramento', position: [24, 20, 14], target: [38, 0, 0], openRoof: true },
];
