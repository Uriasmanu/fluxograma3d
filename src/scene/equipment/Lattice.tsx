import type { Material } from 'three';
import { Block } from '../primitives';

interface LatticeProps {
  length: number;
  width: number;
  segments: number;
  material: Material;
}

export function Lattice({ length, width, segments, material }: LatticeProps) {
  const step = length / segments;
  const diagonal = Math.hypot(width, step);
  const tilt = Math.atan2(width, step);
  return (
    <group>
      {[-1, 1].map((side) => (
        <Block key={side} size={[0.14, length, 0.14]} position={[(side * width) / 2, length / 2, 0]} material={material} />
      ))}
      {Array.from({ length: segments + 1 }, (_, index) => (
        <Block key={`rung${index}`} size={[width, 0.08, 0.08]} position={[0, index * step, 0]} material={material} />
      ))}
      {Array.from({ length: segments }, (_, index) => (
        <Block
          key={`diag${index}`}
          size={[0.07, diagonal, 0.07]}
          position={[0, (index + 0.5) * step, 0]}
          rotation={[0, 0, (index % 2 === 0 ? -1 : 1) * tilt]}
          material={material}
        />
      ))}
    </group>
  );
}
