import { useEffect, useMemo } from 'react';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import type { Vec3 } from '../../data/types';
import { MATERIALS } from '../materials';
import { sagPoints } from './curve';

export const DEFAULT_SAG = 0.6;

const MIN_LENGTH = 0.001;
const TUBE_RADIUS = 0.07;

interface ConductorProps {
  from: Vec3;
  to: Vec3;
  sag?: number;
}

export function Conductor({ from, to, sag = DEFAULT_SAG }: ConductorProps) {
  const geometry = useMemo(() => {
    if (Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]) < MIN_LENGTH) return null;
    const curve = new CatmullRomCurve3(sagPoints(from, to, sag).map(([x, y, z]) => new Vector3(x, y, z)));
    return new TubeGeometry(curve, 32, TUBE_RADIUS, 6, false);
  }, [from, to, sag]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  if (!geometry) return null;
  return <mesh geometry={geometry} material={MATERIALS.aluminum} castShadow />;
}
