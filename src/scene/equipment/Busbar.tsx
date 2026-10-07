import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Cylinder } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const TUBE_RADIUS = 0.2;
const SUPPORT_COUNT = 7;

export function Busbar({ position, rotationY = 0 }: EquipmentProps) {
  const { a, b } = TERMINALS.busbar;
  const length = b[0] - a[0];
  return (
    <group position={position} rotation-y={rotationY}>
      <Cylinder
        radius={TUBE_RADIUS}
        height={length}
        position={[0, a[1], 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={MATERIALS.aluminum}
        segments={10}
      />
      {Array.from({ length: SUPPORT_COUNT }, (_, index) => (
        <Insulator
          key={index}
          position={[a[0] + (length * index) / (SUPPORT_COUNT - 1), 0, 0]}
          height={a[1] - TUBE_RADIUS}
          radius={0.2}
        />
      ))}
    </group>
  );
}
