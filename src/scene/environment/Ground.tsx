import { SLAB_SIZE, YARD_SIZE } from '../../data/yard';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';

const GRASS_THICKNESS = 0.6;
const SOIL_THICKNESS = 2.4;
const PAD_THICKNESS = 0.1;

export function Ground() {
  const grassTop = -0.05;
  return (
    <>
      <Block
        size={[SLAB_SIZE.width, SOIL_THICKNESS, SLAB_SIZE.depth]}
        position={[0, grassTop - GRASS_THICKNESS - SOIL_THICKNESS / 2, 0]}
        material={MATERIALS.soil}
      />
      <Block
        size={[SLAB_SIZE.width, GRASS_THICKNESS, SLAB_SIZE.depth]}
        position={[0, grassTop - GRASS_THICKNESS / 2, 0]}
        material={MATERIALS.grass}
      />
      <Block
        size={[YARD_SIZE.width, PAD_THICKNESS, YARD_SIZE.depth]}
        position={[0, -PAD_THICKNESS / 2, 0]}
        material={MATERIALS.gravel}
      />
    </>
  );
}
