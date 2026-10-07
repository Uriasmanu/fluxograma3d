import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Insulator } from './Insulator';
import { Lattice } from './Lattice';
import type { EquipmentProps } from './props';

const COLUMN_WIDTH = 0.7;
const BEAM_DEPTH = 0.6;
const STRING_XS = [-1.5, 0, 1.5];

export function Gantry({ position, rotationY = 0 }: EquipmentProps) {
  const { left, right, mid } = TERMINALS.gantry;
  const height = left[1];
  const span = right[0] - left[0];
  return (
    <group position={position} rotation-y={rotationY}>
      {[left[0], right[0]].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Lattice length={height} width={COLUMN_WIDTH} segments={5} material={MATERIALS.steel} />
        </group>
      ))}
      <group position={[right[0], height - BEAM_DEPTH / 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <Lattice length={span} width={BEAM_DEPTH} segments={8} material={MATERIALS.steel} />
      </group>
      {STRING_XS.map((x) => (
        <Insulator key={x} position={[x, mid[1], 0]} height={height - BEAM_DEPTH - mid[1]} radius={0.1} discs={6} />
      ))}
    </group>
  );
}
