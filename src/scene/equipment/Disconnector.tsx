import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const BASE_TOP = 0.4;

export function Disconnector({ position, rotationY = 0 }: EquipmentProps) {
  const { in: inlet, out: outlet } = TERMINALS.disconnector;
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[2.6, BASE_TOP, 0.6]} position={[0, BASE_TOP / 2, 0]} material={MATERIALS.steel} />
      <Insulator position={[inlet[0], BASE_TOP, inlet[2]]} height={inlet[1] - BASE_TOP} />
      <Insulator position={[outlet[0], BASE_TOP, outlet[2]]} height={outlet[1] - BASE_TOP} />
      <Block size={[outlet[0] - inlet[0], 0.12, 0.12]} position={[0, inlet[1] + 0.06, 0]} material={MATERIALS.aluminum} />
    </group>
  );
}
