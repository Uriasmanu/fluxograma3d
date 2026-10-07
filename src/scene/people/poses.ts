export type Pose = 'walk' | 'inspect' | 'maintain' | 'sit';

export interface PoseAngles {
  leftArm: number;
  rightArm: number;
  leftLeg: number;
  rightLeg: number;
  lean: number;
  crouch: number;
  headNod: number;
}

const STILL: PoseAngles = { leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, lean: 0, crouch: 0, headNod: 0 };
const STEP_RATE = 7;

export function poseAt(pose: Pose, time: number, moving: boolean): PoseAngles {
  switch (pose) {
    case 'walk': {
      if (!moving) {
        const sway = Math.sin(time * 1.5) * 0.05;
        return { ...STILL, leftArm: sway, rightArm: -sway };
      }
      const swing = Math.sin(time * STEP_RATE) * 0.7;
      return { ...STILL, leftLeg: swing, rightLeg: -swing, leftArm: -swing * 0.8, rightArm: swing * 0.8, lean: 0.05 };
    }
    case 'inspect':
      return { ...STILL, rightArm: -1.1 + Math.sin(time * 2) * 0.15, lean: 0.1, headNod: Math.sin(time * 0.8) * 0.1 };
    case 'maintain':
      return {
        ...STILL,
        leftArm: -0.4,
        rightArm: -0.6 + Math.sin(time * 5) * 0.5,
        leftLeg: -0.9,
        rightLeg: -0.9,
        lean: 0.4,
        crouch: 0.9,
      };
    case 'sit':
      return {
        ...STILL,
        leftArm: -1 + Math.sin(time * 9) * 0.08,
        rightArm: -1 + Math.sin(time * 9 + 1.3) * 0.08,
        leftLeg: -1.45,
        rightLeg: -1.45,
        lean: 0.05,
        crouch: 0.7,
        headNod: Math.sin(time * 0.7) * 0.08,
      };
  }
}
