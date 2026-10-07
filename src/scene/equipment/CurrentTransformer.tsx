import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const PEDESTAL = 0.5;
const HEAD_HEIGHT = 0.6;

export function CurrentTransformer({ position, rotationY = 0 }: EquipmentProps) {
  const headY = TERMINALS.ct.in[1];
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[1, PEDESTAL, 1]} position={[0, PEDESTAL / 2, 0]} material={MATERIALS.steel} />
      <Insulator position={[0, PEDESTAL, 0]} height={headY - HEAD_HEIGHT / 2 - PEDESTAL} radius={0.28} />
      <Block size={[1, HEAD_HEIGHT, 0.7]} position={[0, headY, 0]} material={MATERIALS.accent} radius={0.12} />
    </group>
  );
}
