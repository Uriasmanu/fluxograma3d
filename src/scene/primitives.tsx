import { Outlines } from '@react-three/drei';
import { BoxGeometry, type Material } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Vec3 } from '../data/types';
import { OUTLINE_COLOR, OUTLINES_ENABLED } from './flags';

const boxCache = new Map<string, BoxGeometry>();

function boxGeometry(size: Vec3, radius: number): BoxGeometry {
  const key = `${size.join('x')}@${radius}`;
  let geometry = boxCache.get(key);
  if (!geometry) {
    geometry =
      radius > 0 ? new RoundedBoxGeometry(size[0], size[1], size[2], 2, radius) : new BoxGeometry(size[0], size[1], size[2]);
    boxCache.set(key, geometry);
  }
  return geometry;
}

interface BlockProps {
  size: Vec3;
  position: Vec3;
  material: Material;
  radius?: number;
  rotation?: Vec3;
  outline?: boolean;
}

export function Block({ size, position, material, radius = 0, rotation, outline = false }: BlockProps) {
  return (
    <mesh
      geometry={boxGeometry(size, radius)}
      material={material}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      {outline && OUTLINES_ENABLED && <Outlines thickness={0.04} color={OUTLINE_COLOR} />}
    </mesh>
  );
}

interface CylinderProps {
  radius: number;
  height: number;
  position: Vec3;
  material: Material;
  rotation?: Vec3;
  segments?: number;
}

export function Cylinder({ radius, height, position, material, rotation, segments = 12 }: CylinderProps) {
  return (
    <mesh material={material} position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, segments]} />
    </mesh>
  );
}
