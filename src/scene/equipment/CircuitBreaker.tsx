import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const BASE_TOP = 0.5;

export function CircuitBreaker({ position, rotationY = 0 }: EquipmentProps) {
  const { in: inlet, out: outlet } = TERMINALS.breaker;
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[2.4, BASE_TOP, 1]} position={[0, BASE_TOP / 2, 0]} material={MATERIALS.steel} />
      <Insulator position={[inlet[0], BASE_TOP, inlet[2]]} height={inlet[1] - BASE_TOP} />
      <Insulator position={[outlet[0], BASE_TOP, outlet[2]]} height={outlet[1] - BASE_TOP} />
      <Block size={[0.8, 0.9, 0.6]} position={[0, 0.95, -0.8]} material={MATERIALS.accent} radius={0.08} />
    </group>
  );
}
