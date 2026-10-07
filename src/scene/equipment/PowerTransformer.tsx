import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block, Cylinder } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const BASE_HEIGHT = 0.4;
const TANK_TOP = 3.4;

export const CONSERVATOR = { radius: 0.6, length: 2.6, y: TANK_TOP + 0.8 } as const;

export function PowerTransformer({ position, rotationY = 0 }: EquipmentProps) {
  const { hv1, lv1 } = TERMINALS.transformer;
  return (
    <group position={position} rotation-y={rotationY}>
      <Block size={[5.6, BASE_HEIGHT, 4.2]} position={[0, BASE_HEIGHT / 2, 0]} material={MATERIALS.steel} />
      <Block
        size={[5, TANK_TOP - BASE_HEIGHT, 3.5]}
        position={[0, (BASE_HEIGHT + TANK_TOP) / 2, 0]}
        material={MATERIALS.transformer}
        radius={0.25}
        outline
      />
      {[-1, 1].map((side) => (
        <Block
          key={side}
          size={[3.6, 2.2, 0.6]}
          position={[0, 1.9, side * 2.05]}
          material={MATERIALS.transformer}
          radius={0.1}
        />
      ))}
      <Cylinder
        radius={CONSERVATOR.radius}
        height={CONSERVATOR.length}
        position={[0, CONSERVATOR.y, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={MATERIALS.accent}
      />
      <Insulator position={[hv1[0], TANK_TOP, hv1[2]]} height={hv1[1] - TANK_TOP} />
      <Insulator position={[lv1[0], TANK_TOP, lv1[2]]} height={lv1[1] - TANK_TOP} />
    </group>
  );
}
