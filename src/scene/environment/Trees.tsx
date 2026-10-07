import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { Cylinder } from '../primitives';

const TREE_POSITIONS: Vec3[] = [
  [-36, 0, -18],
  [-40, 0, -2],
  [-36, 0, 14],
  [-20, 0, 26],
  [0, 0, 28],
  [22, 0, 26],
  [36, 0, -22],
  [20, 0, -26],
  [-22, 0, -26],
  [42, 0, 16],
  [44, 0, -14],
  [-8, 0, -28],
];

export function Trees() {
  return (
    <>
      {TREE_POSITIONS.map((position, index) => {
        const scale = 0.9 + (index % 3) * 0.15;
        return (
          <group key={index} position={position} scale={scale}>
            <Cylinder radius={0.3} height={1.6} position={[0, 0.8, 0]} material={MATERIALS.trunk} segments={8} />
            <mesh position={[0, 2.8, 0]} material={MATERIALS.leaves} castShadow>
              <coneGeometry args={[1.6, 2.6, 8]} />
            </mesh>
            <mesh position={[0, 4.2, 0]} material={MATERIALS.leaves} castShadow>
              <coneGeometry args={[1.1, 2, 8]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
