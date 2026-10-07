import { TREE_POSITIONS } from '../../data/trees';
import { MATERIALS } from '../materials';
import { Cylinder } from '../primitives';

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
