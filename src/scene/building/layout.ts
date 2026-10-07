import type { Vec3 } from '../../data/types';

export const BUILDING = {
  width: 12,
  depth: 8,
  wallHeight: 3.6,
  wallThickness: 0.3,
  floorHeight: 0.2,
} as const;

export const OPERATOR_SEATS: readonly Vec3[] = [
  [-3, 0, -0.4],
  [-1.8, 0, -0.4],
  [1.8, 0, -0.4],
  [3, 0, -0.4],
];

export function operatorSeats(count: number): Vec3[] {
  return OPERATOR_SEATS.slice(0, Math.max(0, Math.floor(count)));
}
