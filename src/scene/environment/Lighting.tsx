import { PALETTE } from '../materials';

export function Lighting() {
  return (
    <>
      <color attach="background" args={[PALETTE.sky]} />
      <fog attach="fog" args={[PALETTE.sky, 120, 220]} />
      <hemisphereLight args={['#ffffff', PALETTE.grass, 0.9]} />
      <directionalLight
        position={[-30, 50, 30]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={1}
        shadow-camera-far={160}
      />
    </>
  );
}
