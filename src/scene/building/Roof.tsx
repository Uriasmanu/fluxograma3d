import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import type { Mesh } from 'three';
import { MATERIALS } from '../materials';
import { BUILDING } from './layout';

interface RoofProps {
  openAmount: MutableRefObject<number>;
}

export function Roof({ openAmount }: RoofProps) {
  const mesh = useRef<Mesh>(null);
  const material = useMemo(() => MATERIALS.roof.clone(), []);

  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    const amount = openAmount.current;
    const fading = amount > 0 && amount < 1;
    if (material.transparent !== fading) {
      material.transparent = fading;
      material.needsUpdate = true;
    }
    material.opacity = 1 - amount;
    if (mesh.current) mesh.current.visible = amount < 1;
  });

  return (
    <mesh ref={mesh} material={material} position={[0, BUILDING.floorHeight + BUILDING.wallHeight + 0.2, 0]} castShadow>
      <boxGeometry args={[BUILDING.width + 0.8, 0.4, BUILDING.depth + 0.8]} />
    </mesh>
  );
}
