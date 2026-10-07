import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { Insulator } from './Insulator';
import { PHASE_OFFSETS, PHASE_PITCH } from './phases';
import type { EquipmentProps } from './props';

const BASE_TOP = 0.5;
const BASE_DEPTH = PHASE_PITCH * 2 + 1.2;

export function CircuitBreaker({ position, rotationY = 0 }: EquipmentProps) {
  const { in: inlet, out: outlet } = TERMINALS.breaker;
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[2.4, BASE_TOP, BASE_DEPTH]} position={[0, BASE_TOP / 2, 0]} material={MATERIALS.steel} />
      {PHASE_OFFSETS.map((z) => (
        <group key={z}>
          <Insulator position={[inlet[0], BASE_TOP, inlet[2] + z]} height={inlet[1] - BASE_TOP} radius={0.2} />
          <Insulator position={[outlet[0], BASE_TOP, outlet[2] + z]} height={outlet[1] - BASE_TOP} radius={0.2} />
        </group>
      ))}
      <Block size={[0.8, 0.9, 0.6]} position={[0, 0.45, -(BASE_DEPTH / 2 + 0.6)]} material={MATERIALS.cabinet} radius={0.05} />
    </group>
  );
}
