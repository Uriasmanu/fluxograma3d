import { Instance, Instances } from '@react-three/drei';
import type { Vec3 } from '../../data/types';
import { YARD_SIZE } from '../../data/yard';
import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { fencePosts } from './fencePosts';

const POSTS = fencePosts(YARD_SIZE.width, YARD_SIZE.depth, 3);
const POST_HEIGHT = 1.8;
const RAIL_HEIGHTS = [0.8, 1.6];
const PANEL_HEIGHT = 1.2;
const PANEL_Y = 1;

function FencePanel({ size, position }: { size: Vec3; position: Vec3 }) {
  return (
    <mesh position={position} material={MATERIALS.fencePanel}>
      <boxGeometry args={size} />
    </mesh>
  );
}

export function Fence() {
  const halfX = YARD_SIZE.width / 2;
  const halfZ = YARD_SIZE.depth / 2;
  return (
    <>
      <Instances limit={POSTS.length} material={MATERIALS.fence} castShadow>
        <boxGeometry args={[0.2, POST_HEIGHT, 0.2]} />
        {POSTS.map(([x, z]) => (
          <Instance key={`${x}:${z}`} position={[x, POST_HEIGHT / 2, z]} />
        ))}
      </Instances>
      {RAIL_HEIGHTS.flatMap((y) => [
        <Block key={`n${y}`} size={[YARD_SIZE.width, 0.08, 0.08]} position={[0, y, -halfZ]} material={MATERIALS.fence} />,
        <Block key={`s${y}`} size={[YARD_SIZE.width, 0.08, 0.08]} position={[0, y, halfZ]} material={MATERIALS.fence} />,
        <Block key={`w${y}`} size={[0.08, 0.08, YARD_SIZE.depth]} position={[-halfX, y, 0]} material={MATERIALS.fence} />,
        <Block key={`e${y}`} size={[0.08, 0.08, YARD_SIZE.depth]} position={[halfX, y, 0]} material={MATERIALS.fence} />,
      ])}
      <FencePanel size={[YARD_SIZE.width, PANEL_HEIGHT, 0.04]} position={[0, PANEL_Y, -halfZ]} />
      <FencePanel size={[YARD_SIZE.width, PANEL_HEIGHT, 0.04]} position={[0, PANEL_Y, halfZ]} />
      <FencePanel size={[0.04, PANEL_HEIGHT, YARD_SIZE.depth]} position={[-halfX, PANEL_Y, 0]} />
      <FencePanel size={[0.04, PANEL_HEIGHT, YARD_SIZE.depth]} position={[halfX, PANEL_Y, 0]} />
    </>
  );
}
