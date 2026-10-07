import type { Vec3 } from './types';

interface CameraLimits {
  polar: number;
  minSpan: number;
  maxSpan: number;
  bounds: { min: Vec3; max: Vec3 };
}

export const ISO_POLAR = Math.acos(1 / Math.sqrt(3));

export const CAMERA_LIMITS: CameraLimits = {
  polar: ISO_POLAR,
  minSpan: 24,
  maxSpan: 130,
  bounds: { min: [-48, 0, -30], max: [48, 0, 30] },
};

export function zoomForSpan(span: number, viewportWidth: number): number {
  const clamped = Math.min(Math.max(span, CAMERA_LIMITS.minSpan), CAMERA_LIMITS.maxSpan);
  return viewportWidth / clamped;
}
