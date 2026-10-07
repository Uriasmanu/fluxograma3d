import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { Cylinder } from '../primitives';

interface InsulatorProps {
  position?: Vec3;
  height: number;
  radius?: number;
  discs?: number;
}

export function Insulator({ position = [0, 0, 0], height, radius = 0.22, discs = 4 }: InsulatorProps) {
  const step = height / (discs + 1);
  return (
    <group position={position}>
      <Cylinder radius={radius} height={height} position={[0, height / 2, 0]} material={MATERIALS.porcelain} segments={10} />
      {Array.from({ length: discs }, (_, index) => (
        <Cylinder
          key={index}
          radius={radius * 2}
          height={step * 0.35}
          position={[0, step * (index + 1), 0]}
          material={MATERIALS.porcelain}
          segments={10}
        />
      ))}
    </group>
  );
}
