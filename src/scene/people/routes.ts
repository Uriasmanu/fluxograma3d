import type { Vec3 } from '../../data/types';

export interface RouteSample {
  position: Vec3;
  heading: number;
  moving: boolean;
}

export interface RouteOptions {
  speed: number;
  pause: number;
}

export function headingBetween(from: Vec3, to: Vec3): number {
  return Math.atan2(to[0] - from[0], to[2] - from[2]);
}

function lerp(from: Vec3, to: Vec3, t: number): Vec3 {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t];
}

export function sampleRoute(route: readonly Vec3[], { speed, pause }: RouteOptions, time: number): RouteSample {
  if (route.length === 0) throw new Error('Route needs at least one point');
  if (!(speed > 0)) throw new Error('Route speed must be positive');
  if (route.length === 1) return { position: route[0], heading: 0, moving: false };

  const wait = Math.max(0, pause);
  const legs = route.map((from, index) => {
    const to = route[(index + 1) % route.length];
    const length = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    return { from, to, moveTime: length / speed, heading: headingBetween(from, to) };
  });

  const cycle = legs.reduce((total, leg) => total + wait + leg.moveTime, 0);
  if (cycle === 0) return { position: route[0], heading: 0, moving: false };

  let remaining = ((time % cycle) + cycle) % cycle;
  for (const leg of legs) {
    if (remaining < wait) return { position: leg.from, heading: leg.heading, moving: false };
    remaining -= wait;
    if (remaining < leg.moveTime) {
      return { position: lerp(leg.from, leg.to, remaining / leg.moveTime), heading: leg.heading, moving: true };
    }
    remaining -= leg.moveTime;
  }
  return { position: legs[0].from, heading: legs[0].heading, moving: false };
}
