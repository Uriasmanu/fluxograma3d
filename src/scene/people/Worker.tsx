import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BoxGeometry, SphereGeometry, type Group } from 'three';
import type { Vec3, WorkerRole } from '../../data/types';
import { MATERIALS, vestMaterial } from '../materials';
import { poseAt, type Pose } from './poses';
import { headingBetween, sampleRoute } from './routes';

export type WorkerKind = WorkerRole | 'operator';

const POSE_BY_KIND: Record<WorkerKind, Pose> = {
  walker: 'walk',
  inspector: 'inspect',
  maintainer: 'maintain',
  operator: 'sit',
};

const HIP_HEIGHT = 0.9;
const CROUCH_DROP = 0.5;
const WALK_SPEED = 1.2;
const WALK_PAUSE = 2.5;

const GEOMETRY = {
  torso: new BoxGeometry(0.42, 0.55, 0.26),
  head: new SphereGeometry(0.15, 12, 10),
  helmet: new SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  arm: new BoxGeometry(0.12, 0.5, 0.12),
  leg: new BoxGeometry(0.15, 0.9, 0.15),
};

interface WorkerProps {
  kind: WorkerKind;
  position: Vec3;
  facing?: Vec3;
  heading?: number;
  route?: readonly Vec3[];
  vestColor?: string;
  phase?: number;
  scale?: number;
}

export function Worker({
  kind,
  position,
  facing,
  heading,
  route,
  vestColor = '#ff7a1a',
  phase = 0,
  scale = 1.4,
}: WorkerProps) {
  const root = useRef<Group>(null);
  const hip = useRef<Group>(null);
  const torso = useRef<Group>(null);
  const head = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);

  const vest = useMemo(() => vestMaterial(vestColor), [vestColor]);
  const initialHeading = heading ?? (facing ? headingBetween(position, facing) : 0);
  const pose = POSE_BY_KIND[kind];

  useFrame((state) => {
    const time = state.clock.elapsedTime + phase;
    let moving = false;

    if (route && route.length > 1 && root.current) {
      const sample = sampleRoute(route, { speed: WALK_SPEED, pause: WALK_PAUSE }, time);
      root.current.position.set(sample.position[0], sample.position[1], sample.position[2]);
      root.current.rotation.y = sample.heading;
      moving = sample.moving;
    }

    const parts = [hip, torso, head, leftArm, rightArm, leftLeg, rightLeg].map((part) => part.current);
    const [h, t, hd, la, ra, ll, rl] = parts;
    if (!h || !t || !hd || !la || !ra || !ll || !rl) return;

    const angles = poseAt(pose, time, moving);
    h.position.y = HIP_HEIGHT - angles.crouch * CROUCH_DROP;
    t.rotation.x = angles.lean;
    hd.rotation.x = angles.headNod;
    la.rotation.x = angles.leftArm;
    ra.rotation.x = angles.rightArm;
    ll.rotation.x = angles.leftLeg;
    rl.rotation.x = angles.rightLeg;
  });

  return (
    <group ref={root} position={position} rotation-y={initialHeading} scale={scale}>
      <group ref={hip} position-y={HIP_HEIGHT}>
        <group ref={leftLeg} position={[-0.1, 0, 0]}>
          <mesh geometry={GEOMETRY.leg} material={MATERIALS.pants} position-y={-0.45} castShadow />
        </group>
        <group ref={rightLeg} position={[0.1, 0, 0]}>
          <mesh geometry={GEOMETRY.leg} material={MATERIALS.pants} position-y={-0.45} castShadow />
        </group>
        <group ref={torso}>
          <mesh geometry={GEOMETRY.torso} material={vest} position-y={0.3} castShadow />
          <group ref={leftArm} position={[-0.29, 0.52, 0]}>
            <mesh geometry={GEOMETRY.arm} material={vest} position-y={-0.25} castShadow />
          </group>
          <group ref={rightArm} position={[0.29, 0.52, 0]}>
            <mesh geometry={GEOMETRY.arm} material={vest} position-y={-0.25} castShadow />
          </group>
          <group ref={head} position={[0, 0.62, 0]}>
            <mesh geometry={GEOMETRY.head} material={MATERIALS.skin} position-y={0.12} castShadow />
            <mesh geometry={GEOMETRY.helmet} material={MATERIALS.helmet} position-y={0.14} castShadow />
          </group>
        </group>
      </group>
    </group>
  );
}
