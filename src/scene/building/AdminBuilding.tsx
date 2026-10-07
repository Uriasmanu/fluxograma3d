import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { stepFade } from './fade';
import { BUILDING } from './layout';
import { MonitoringRoom } from './MonitoringRoom';
import { Roof } from './Roof';

const FADE_SECONDS = 0.4;
const LOWERED_WALL_SCALE = 0.3;
const CLICK_DRAG_TOLERANCE = 4;
const WINDOW_XS = [-4.4, -2.2, 2.2, 4.4];

interface AdminBuildingProps {
  position: Vec3;
  rotationY?: number;
  operators: number;
  roofOpen: boolean;
  onToggleRoof: () => void;
}

export function AdminBuilding({ position, rotationY = 0, operators, roofOpen, onToggleRoof }: AdminBuildingProps) {
  const openAmount = useRef(0);
  const walls = useRef<Group>(null);
  const { width, depth, wallHeight, wallThickness, floorHeight } = BUILDING;

  useFrame((_, delta) => {
    openAmount.current = stepFade(openAmount.current, roofOpen ? 1 : 0, delta, FADE_SECONDS);
    walls.current?.scale.setY(1 - (1 - LOWERED_WALL_SCALE) * openAmount.current);
  });

  return (
    <group
      position={position}
      rotation-y={rotationY}
      onClick={(event) => {
        if (event.delta > CLICK_DRAG_TOLERANCE) return;
        event.stopPropagation();
        onToggleRoof();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
    >
      <Block size={[width, floorHeight, depth]} position={[0, floorHeight / 2, 0]} material={MATERIALS.floor} />
      <group ref={walls} position={[0, floorHeight, 0]}>
        <Block
          size={[width, wallHeight, wallThickness]}
          position={[0, wallHeight / 2, -depth / 2 + wallThickness / 2]}
          material={MATERIALS.wall}
          outline
        />
        <Block
          size={[width, wallHeight, wallThickness]}
          position={[0, wallHeight / 2, depth / 2 - wallThickness / 2]}
          material={MATERIALS.wall}
          outline
        />
        <Block
          size={[wallThickness, wallHeight, depth]}
          position={[-width / 2 + wallThickness / 2, wallHeight / 2, 0]}
          material={MATERIALS.wall}
          outline
        />
        <Block
          size={[wallThickness, wallHeight, depth]}
          position={[width / 2 - wallThickness / 2, wallHeight / 2, 0]}
          material={MATERIALS.wall}
          outline
        />
        {WINDOW_XS.map((x) => (
          <Block key={x} size={[1.6, 1.1, 0.1]} position={[x, 2, depth / 2 + 0.02]} material={MATERIALS.window} />
        ))}
        <Block size={[1.2, 2.2, 0.12]} position={[0, 1.1, depth / 2 + 0.03]} material={MATERIALS.accent} />
      </group>
      <MonitoringRoom operators={operators} />
      <Roof openAmount={openAmount} />
    </group>
  );
}
