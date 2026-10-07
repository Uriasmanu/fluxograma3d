import { MATERIALS } from '../materials';
import { Block } from '../primitives';

export function Ground() {
  return (
    <>
      <Block size={[240, 0.1, 240]} position={[0, -0.1, 0]} material={MATERIALS.grass} />
      <Block size={[60, 0.1, 40]} position={[0, -0.05, 0]} material={MATERIALS.gravel} />
    </>
  );
}
