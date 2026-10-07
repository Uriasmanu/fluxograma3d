import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block, Cylinder } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const PEDESTAL = 0.5;
const CAP_HEIGHT = 0.3;

export function PotentialTransformer({ position, rotationY = 0 }: EquipmentProps) {
  const topY = TERMINALS.pt.top[1];
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[1.2, PEDESTAL, 1.2]} position={[0, PEDESTAL / 2, 0]} material={MATERIALS.steel} />
      <Insulator position={[0, PEDESTAL, 0]} height={topY - PEDESTAL - CAP_HEIGHT} radius={0.3} />
      <Cylinder radius={0.4} height={CAP_HEIGHT} position={[0, topY - CAP_HEIGHT / 2, 0]} material={MATERIALS.accent} />
    </group>
  );
}
