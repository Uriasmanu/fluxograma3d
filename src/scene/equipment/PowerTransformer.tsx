import { TERMINALS } from '../../data/terminals';
import { MATERIALS } from '../materials';
import { Block, Cylinder } from '../primitives';
import { Insulator } from './Insulator';
import type { EquipmentProps } from './props';

const BASE_HEIGHT = 0.4;
const TANK_TOP = 3.4;
const HV_PITCH = 1.2;
const LV_PITCH = 1;
const PHASES = [-1, 0, 1];
const FIN_XS = [-1.6, -0.8, 0, 0.8, 1.6];

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
      {[-1, 1].flatMap((side) =>
        FIN_XS.map((x) => (
          <Block key={`${side}:${x}`} size={[0.2, 2.2, 0.9]} position={[x, 1.9, side * 2.2]} material={MATERIALS.steel} />
        )),
      )}
      <Cylinder
        radius={CONSERVATOR.radius}
        height={CONSERVATOR.length}
        position={[0, CONSERVATOR.y, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={MATERIALS.steel}
      />
      {[-0.8, 0.8].map((z) => (
        <Block key={z} size={[0.3, 0.3, 0.3]} position={[0, TANK_TOP + 0.1, z]} material={MATERIALS.steel} />
      ))}
      {PHASES.map((phase) => (
        <Insulator
          key={`hv${phase}`}
          position={[hv1[0], TANK_TOP, hv1[2] + phase * HV_PITCH]}
          height={hv1[1] - TANK_TOP}
          radius={0.2}
          discs={5}
        />
      ))}
      {PHASES.map((phase) => (
        <Insulator
          key={`lv${phase}`}
          position={[lv1[0], TANK_TOP, lv1[2] + phase * LV_PITCH]}
          height={lv1[1] - TANK_TOP}
          radius={0.16}
          discs={3}
        />
      ))}
      <Block size={[0.5, 1.2, 0.9]} position={[2.75, 1.7, -1]} material={MATERIALS.cabinet} radius={0.05} />
    </group>
  );
}
