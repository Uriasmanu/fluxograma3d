import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';

export function Monitor({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Block size={[0.1, 0.25, 0.1]} position={[0, 0.125, 0]} material={MATERIALS.chair} />
      <Block size={[0.9, 0.55, 0.06]} position={[0, 0.5, 0]} material={MATERIALS.screenOn} />
    </group>
  );
}
