import type { Vec3 } from './types';

const degrees = (value: number) => (value * Math.PI) / 180;

interface CameraLimits {
  fov: number;
  minPolar: number;
  maxPolar: number;
  minDistance: number;
  maxDistance: number;
  bounds: { min: Vec3; max: Vec3 };
}

export const CAMERA_LIMITS: CameraLimits = {
  fov: 35,
  minPolar: degrees(25),
  maxPolar: degrees(60),
  minDistance: 10,
  maxDistance: 130,
  bounds: { min: [-45, 0, -28], max: [45, 0, 28] },
};
