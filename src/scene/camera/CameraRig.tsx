import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { Box3, Vector3 } from 'three';
import { CAMERA_LIMITS } from '../../data/cameraLimits';
import type { Viewpoint } from '../../data/types';

export interface TourRequest {
  viewpoint: Viewpoint;
  nonce: number;
}

const { ACTION } = CameraControlsImpl;

export function CameraRig({ request }: { request: TourRequest }) {
  const controls = useRef<CameraControlsImpl>(null);

  useEffect(() => {
    const [minX, minY, minZ] = CAMERA_LIMITS.bounds.min;
    const [maxX, maxY, maxZ] = CAMERA_LIMITS.bounds.max;
    controls.current?.setBoundary(new Box3(new Vector3(minX, minY, minZ), new Vector3(maxX, maxY, maxZ)));
  }, []);

  useEffect(() => {
    const { position, target } = request.viewpoint;
    controls.current?.setLookAt(...position, ...target, request.nonce > 0);
  }, [request]);

  return (
    <CameraControls
      ref={controls}
      minPolarAngle={CAMERA_LIMITS.minPolar}
      maxPolarAngle={CAMERA_LIMITS.maxPolar}
      minDistance={CAMERA_LIMITS.minDistance}
      maxDistance={CAMERA_LIMITS.maxDistance}
      smoothTime={0.25}
      touches={{ one: ACTION.TOUCH_TRUCK, two: ACTION.TOUCH_DOLLY_ROTATE, three: ACTION.TOUCH_TRUCK }}
    />
  );
}
