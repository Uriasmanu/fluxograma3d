import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import type { EquipmentProps } from './props';

const BEAM_THICKNESS = 0.5;

export function Gantry({ position, rotationY = 0 }: EquipmentProps) {
  const { left, right } = TERMINALS.gantry;
  const height = left[1];
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[0.5, height, 0.5]} position={[left[0], height / 2, 0]} material={MATERIALS.steel} outline />
      <Block size={[0.5, height, 0.5]} position={[right[0], height / 2, 0]} material={MATERIALS.steel} outline />
      <Block
        size={[right[0] - left[0] + 0.5, BEAM_THICKNESS, BEAM_THICKNESS]}
        position={[0, height - BEAM_THICKNESS / 2, 0]}
        material={MATERIALS.steel}
        outline
      />
    </group>
  );
}
