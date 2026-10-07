import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { Insulator } from './Insulator';
import { PHASE_OFFSETS, PHASE_PITCH } from './phases';
import type { EquipmentProps } from './props';

const BASE_TOP = 0.3;
const FRAME_DEPTH = PHASE_PITCH * 2 + 0.3;

export function Disconnector({ position, rotationY = 0 }: EquipmentProps) {
  const { in: inlet, out: outlet } = TERMINALS.disconnector;
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[0.3, BASE_TOP, FRAME_DEPTH]} position={[inlet[0], BASE_TOP / 2, 0]} material={MATERIALS.steel} />
      <Block size={[0.3, BASE_TOP, FRAME_DEPTH]} position={[outlet[0], BASE_TOP / 2, 0]} material={MATERIALS.steel} />
      {PHASE_OFFSETS.map((z) => (
        <group key={z}>
          <Insulator position={[inlet[0], BASE_TOP, inlet[2] + z]} height={inlet[1] - BASE_TOP} radius={0.2} />
          <Insulator position={[outlet[0], BASE_TOP, outlet[2] + z]} height={outlet[1] - BASE_TOP} radius={0.2} />
          <Block
            size={[outlet[0] - inlet[0], 0.12, 0.12]}
            position={[0, inlet[1] + 0.06, z]}
            material={MATERIALS.aluminum}
          />
        </group>
      ))}
    </group>
  );
}
