import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { Block, Cylinder } from '../primitives';

export function Chair({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Cylinder radius={0.05} height={0.45} position={[0, 0.225, 0]} material={MATERIALS.steel} />
      <Block size={[0.55, 0.08, 0.55]} position={[0, 0.45, 0]} material={MATERIALS.chair} radius={0.03} />
      <Block size={[0.55, 0.6, 0.07]} position={[0, 0.8, 0.25]} material={MATERIALS.chair} radius={0.03} />
    </group>
  );
}
