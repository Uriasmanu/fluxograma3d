import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block, Cylinder } from '../primitives';
import { Insulator } from './Insulator';
import { PHASE_OFFSETS } from './phases';
import type { EquipmentProps } from './props';

const PEDESTAL = 0.3;
const CAP_HEIGHT = 0.2;

export function SurgeArrester({ position, rotationY = 0 }: EquipmentProps) {
  const topY = TERMINALS.arrester.top[1];
  return (
    <group position={position} rotation-y={rotationY}>
      {PHASE_OFFSETS.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <Block size={[0.8, PEDESTAL, 0.8]} position={[0, PEDESTAL / 2, 0]} material={MATERIALS.steel} />
          <Insulator position={[0, PEDESTAL, 0]} height={topY - PEDESTAL - CAP_HEIGHT / 2} radius={0.16} discs={6} />
          <Cylinder radius={0.12} height={CAP_HEIGHT} position={[0, topY - CAP_HEIGHT / 2, 0]} material={MATERIALS.aluminum} />
        </group>
      ))}
    </group>
  );
}
