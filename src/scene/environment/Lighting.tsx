import { PALETTE } from '../materials';

export function Lighting() {
  return (
    <>
      <color attach="background" args={[PALETTE.background]} />
      <hemisphereLight args={['#ffffff', PALETTE.grass, 0.9]} />
      <directionalLight
        position={[-30, 50, 30]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-camera-near={1}
        shadow-camera-far={160}
      />
    </>
  );
}
