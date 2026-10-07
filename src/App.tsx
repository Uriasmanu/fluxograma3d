import { Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useCallback, useState } from 'react';
import { CAMERA_LIMITS } from './data/cameraLimits';
import type { Viewpoint } from './data/types';
import { VIEWPOINTS } from './data/viewpoints';
import { CameraRig, type TourRequest } from './scene/camera/CameraRig';
import { Scene } from './scene/Scene';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { TourControls } from './ui/TourControls';
import { supportsWebGL2 } from './ui/webgl';

const WEBGL_MESSAGE = 'Não foi possível iniciar a cena 3D. Verifique se o seu navegador suporta WebGL2.';
const INITIAL_REQUEST: TourRequest = { viewpoint: VIEWPOINTS[0], nonce: 0 };

export function App() {
  const [roofOpen, setRoofOpen] = useState(false);
  const [request, setRequest] = useState(INITIAL_REQUEST);
  const [activeId, setActiveId] = useState<string | null>(VIEWPOINTS[0].id);

  const goTo = useCallback((viewpoint: Viewpoint) => {
    setRequest((current) => ({ viewpoint, nonce: current.nonce + 1 }));
    setActiveId(viewpoint.id);
    if (viewpoint.openRoof) setRoofOpen(true);
  }, []);

  const toggleRoof = useCallback(() => setRoofOpen((open) => !open), []);

  if (!supportsWebGL2()) return <p className="fallback">{WEBGL_MESSAGE}</p>;

  return (
    <ErrorBoundary fallback={<p className="fallback">{WEBGL_MESSAGE}</p>}>
      <Canvas
        shadows="percentage"
        dpr={[1, 2]}
        frameloop="always"
        camera={{ fov: CAMERA_LIMITS.fov, near: 1, far: 400, position: VIEWPOINTS[0].position }}
      >
        <Scene roofOpen={roofOpen} onToggleRoof={toggleRoof} />
        <CameraRig request={request} />
        {new URLSearchParams(window.location.search).has('stats') && <Stats />}
      </Canvas>
      <TourControls viewpoints={VIEWPOINTS} activeId={activeId} onSelect={goTo} />
    </ErrorBoundary>
  );
}
