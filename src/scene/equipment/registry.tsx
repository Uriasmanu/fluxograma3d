import type { ComponentType } from 'react';
import type { EquipmentType } from '../../data/types';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { Busbar } from './Busbar';
import { CircuitBreaker } from './CircuitBreaker';
import { ControlCabinet } from './ControlCabinet';
import { CurrentTransformer } from './CurrentTransformer';
import { Disconnector } from './Disconnector';
import { Gantry } from './Gantry';
import { PotentialTransformer } from './PotentialTransformer';
import { PowerTransformer } from './PowerTransformer';
import type { EquipmentProps } from './props';
import { SurgeArrester } from './SurgeArrester';

export function PlaceholderEquipment({ position, rotationY = 0 }: EquipmentProps) {
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[2, 2, 2]} position={[0, 1, 0]} material={MATERIALS.accent} />
    </group>
  );
}

const EQUIPMENT_COMPONENTS: Record<EquipmentType, ComponentType<EquipmentProps>> = {
  transformer: PowerTransformer,
  breaker: CircuitBreaker,
  disconnector: Disconnector,
  ct: CurrentTransformer,
  pt: PotentialTransformer,
  arrester: SurgeArrester,
  gantry: Gantry,
  busbar: Busbar,
  cabinet: ControlCabinet,
};

const warned = new Set<string>();

export function resolveEquipmentComponent(type: string): ComponentType<EquipmentProps> {
  if (Object.hasOwn(EQUIPMENT_COMPONENTS, type)) return EQUIPMENT_COMPONENTS[type as EquipmentType];
  if (!warned.has(type)) {
    warned.add(type);
    console.warn(`No component for equipment type "${type}"; rendering a placeholder`);
  }
  return PlaceholderEquipment;
}
