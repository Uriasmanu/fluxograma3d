import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Box3, Vector3 } from 'three';
import { CAMERA_LIMITS, zoomForSpan } from '../../data/cameraLimits';
import type { Viewpoint } from '../../data/types';

export interface TourRequest {
  viewpoint: Viewpoint;
  nonce: number;
}

const { ACTION } = CameraControlsImpl;

export function CameraRig({ request }: { request: TourRequest }) {
  const controls = useRef<CameraControlsImpl>(null);
  const width = useThree((state) => state.size.width);
  const widthRef = useRef(width);
  widthRef.current = width;

  useEffect(() => {
    const [minX, minY, minZ] = CAMERA_LIMITS.bounds.min;
    const [maxX, maxY, maxZ] = CAMERA_LIMITS.bounds.max;
    controls.current?.setBoundary(new Box3(new Vector3(minX, minY, minZ), new Vector3(maxX, maxY, maxZ)));
  }, []);

  useEffect(() => {
    const { position, target, span } = request.viewpoint;
    const animate = request.nonce > 0;
    controls.current?.setLookAt(...position, ...target, animate);
    controls.current?.zoomTo(zoomForSpan(span, widthRef.current), animate);
  }, [request]);

  return (
    <CameraControls
      ref={controls}
      minPolarAngle={CAMERA_LIMITS.polar}
      maxPolarAngle={CAMERA_LIMITS.polar}
      minZoom={width / CAMERA_LIMITS.maxSpan}
      maxZoom={width / CAMERA_LIMITS.minSpan}
      smoothTime={0.25}
      touches={{ one: ACTION.TOUCH_TRUCK, two: ACTION.TOUCH_DOLLY_ROTATE, three: ACTION.TOUCH_TRUCK }}
    />
  );
}
