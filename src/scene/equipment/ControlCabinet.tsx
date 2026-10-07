import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import type { EquipmentProps } from './props';

export function ControlCabinet({ position, rotationY = 0 }: EquipmentProps) {
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[1.1, 0.2, 0.9]} position={[0, 0.1, 0]} material={MATERIALS.steel} />
      <Block size={[1, 2, 0.8]} position={[0, 1.2, 0]} material={MATERIALS.cabinet} radius={0.04} />
      <Block size={[0.02, 1.7, 0.7]} position={[0.51, 1.2, 0]} material={MATERIALS.steel} />
      <Block size={[0.02, 0.25, 0.25]} position={[0.52, 1.8, 0.2]} material={MATERIALS.accent} />
    </group>
  );
}
