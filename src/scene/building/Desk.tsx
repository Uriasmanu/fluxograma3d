import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';

export function Desk({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Block size={[3.4, 0.1, 1]} position={[0, 0.75, 0]} material={MATERIALS.deskTop} radius={0.03} />
      <Block size={[0.1, 0.7, 0.9]} position={[-1.55, 0.35, 0]} material={MATERIALS.chair} />
      <Block size={[0.1, 0.7, 0.9]} position={[1.55, 0.35, 0]} material={MATERIALS.chair} />
    </group>
  );
}
