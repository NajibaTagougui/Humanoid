import { HumanoidKeyframe, HumanoidSequence, ValidityMetrics } from '../types';

// Linear interpolation
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Smoothstep interpolation (3t^2 - 2t^3) for organic deceleration and acceleration
function smoothstep(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
}

/**
 * Interpolates full humanoid kinematic frame at arbitrary time `t` (seconds)
 */
export function sampleKeyframes(keyframes: HumanoidKeyframe[], timeSeconds: number): HumanoidKeyframe {
  if (!keyframes || keyframes.length === 0) {
    throw new Error('Keyframes array cannot be empty');
  }

  if (keyframes.length === 1) {
    return keyframes[0];
  }

  const duration = keyframes[keyframes.length - 1].timestamp;
  const loopTime = timeSeconds % duration;

  // Find surrounding keyframe indices
  let prevIndex = 0;
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (keyframes[i].timestamp <= loopTime && keyframes[i + 1].timestamp >= loopTime) {
      prevIndex = i;
      break;
    }
  }

  const nextIndex = Math.min(prevIndex + 1, keyframes.length - 1);
  const prevFrame = keyframes[prevIndex];
  const nextFrame = keyframes[nextIndex];

  const segDuration = nextFrame.timestamp - prevFrame.timestamp;
  const rawT = segDuration > 0 ? (loopTime - prevFrame.timestamp) / segDuration : 0;
  const t = smoothstep(rawT);

  return {
    timestamp: loopTime,
    phase: rawT < 0.5 ? prevFrame.phase : nextFrame.phase,
    pelvis: {
      x: lerp(prevFrame.pelvis.x, nextFrame.pelvis.x, t),
      y: lerp(prevFrame.pelvis.y, nextFrame.pelvis.y, t),
      z: lerp(prevFrame.pelvis.z, nextFrame.pelvis.z, t),
      pitch: lerp(prevFrame.pelvis.pitch, nextFrame.pelvis.pitch, t),
      roll: lerp(prevFrame.pelvis.roll, nextFrame.pelvis.roll, t),
      yaw: lerp(prevFrame.pelvis.yaw, nextFrame.pelvis.yaw, t),
    },
    torso: {
      pitch: lerp(prevFrame.torso.pitch, nextFrame.torso.pitch, t),
      yaw: lerp(prevFrame.torso.yaw, nextFrame.torso.yaw, t),
      roll: lerp(prevFrame.torso.roll, nextFrame.torso.roll, t),
    },
    head: {
      pitch: lerp(prevFrame.head.pitch, nextFrame.head.pitch, t),
      yaw: lerp(prevFrame.head.yaw, nextFrame.head.yaw, t),
      roll: lerp(prevFrame.head.roll, nextFrame.head.roll, t),
    },
    leftArm: {
      shoulderPitch: lerp(prevFrame.leftArm.shoulderPitch, nextFrame.leftArm.shoulderPitch, t),
      shoulderRoll: lerp(prevFrame.leftArm.shoulderRoll, nextFrame.leftArm.shoulderRoll, t),
      shoulderYaw: lerp(prevFrame.leftArm.shoulderYaw, nextFrame.leftArm.shoulderYaw, t),
      elbowPitch: lerp(prevFrame.leftArm.elbowPitch, nextFrame.leftArm.elbowPitch, t),
      wristPitch: lerp(prevFrame.leftArm.wristPitch, nextFrame.leftArm.wristPitch, t),
      wristYaw: lerp(prevFrame.leftArm.wristYaw, nextFrame.leftArm.wristYaw, t),
    },
    rightArm: {
      shoulderPitch: lerp(prevFrame.rightArm.shoulderPitch, nextFrame.rightArm.shoulderPitch, t),
      shoulderRoll: lerp(prevFrame.rightArm.shoulderRoll, nextFrame.rightArm.shoulderRoll, t),
      shoulderYaw: lerp(prevFrame.rightArm.shoulderYaw, nextFrame.rightArm.shoulderYaw, t),
      elbowPitch: lerp(prevFrame.rightArm.elbowPitch, nextFrame.rightArm.elbowPitch, t),
      wristPitch: lerp(prevFrame.rightArm.wristPitch, nextFrame.rightArm.wristPitch, t),
      wristYaw: lerp(prevFrame.rightArm.wristYaw, nextFrame.rightArm.wristYaw, t),
    },
    leftLeg: {
      hipPitch: lerp(prevFrame.leftLeg.hipPitch, nextFrame.leftLeg.hipPitch, t),
      hipRoll: lerp(prevFrame.leftLeg.hipRoll, nextFrame.leftLeg.hipRoll, t),
      hipYaw: lerp(prevFrame.leftLeg.hipYaw, nextFrame.leftLeg.hipYaw, t),
      kneePitch: lerp(prevFrame.leftLeg.kneePitch, nextFrame.leftLeg.kneePitch, t),
      anklePitch: lerp(prevFrame.leftLeg.anklePitch, nextFrame.leftLeg.anklePitch, t),
      ankleRoll: lerp(prevFrame.leftLeg.ankleRoll, nextFrame.leftLeg.ankleRoll, t),
      footGrounded: t < 0.5 ? prevFrame.leftLeg.footGrounded : nextFrame.leftLeg.footGrounded,
      contactPressure: lerp(prevFrame.leftLeg.contactPressure, nextFrame.leftLeg.contactPressure, t),
    },
    rightLeg: {
      hipPitch: lerp(prevFrame.rightLeg.hipPitch, nextFrame.rightLeg.hipPitch, t),
      hipRoll: lerp(prevFrame.rightLeg.hipRoll, nextFrame.rightLeg.hipRoll, t),
      hipYaw: lerp(prevFrame.rightLeg.hipYaw, nextFrame.rightLeg.hipYaw, t),
      kneePitch: lerp(prevFrame.rightLeg.kneePitch, nextFrame.rightLeg.kneePitch, t),
      anklePitch: lerp(prevFrame.rightLeg.anklePitch, nextFrame.rightLeg.anklePitch, t),
      ankleRoll: lerp(prevFrame.rightLeg.ankleRoll, nextFrame.rightLeg.ankleRoll, t),
      footGrounded: t < 0.5 ? prevFrame.rightLeg.footGrounded : nextFrame.rightLeg.footGrounded,
      contactPressure: lerp(prevFrame.rightLeg.contactPressure, nextFrame.rightLeg.contactPressure, t),
    },
    facialExpression: {
      smileAU12: lerp(prevFrame.facialExpression.smileAU12, nextFrame.facialExpression.smileAU12, t),
      browRaiseAU1_2: lerp(prevFrame.facialExpression.browRaiseAU1_2, nextFrame.facialExpression.browRaiseAU1_2, t),
      browFurrowAU4: lerp(prevFrame.facialExpression.browFurrowAU4, nextFrame.facialExpression.browFurrowAU4, t),
      cheekRaiserAU6: lerp(prevFrame.facialExpression.cheekRaiserAU6, nextFrame.facialExpression.cheekRaiserAU6, t),
      lipDepressorAU15: lerp(prevFrame.facialExpression.lipDepressorAU15, nextFrame.facialExpression.lipDepressorAU15, t),
      mouthOpenAU25_26: lerp(prevFrame.facialExpression.mouthOpenAU25_26, nextFrame.facialExpression.mouthOpenAU25_26, t),
      lipPuckerAU18: lerp(prevFrame.facialExpression.lipPuckerAU18, nextFrame.facialExpression.lipPuckerAU18, t),
      blinkAU45: lerp(prevFrame.facialExpression.blinkAU45, nextFrame.facialExpression.blinkAU45, t),
      gazeX: lerp(prevFrame.facialExpression.gazeX, nextFrame.facialExpression.gazeX, t),
      gazeY: lerp(prevFrame.facialExpression.gazeY, nextFrame.facialExpression.gazeY, t),
    },
  };
}

/**
 * Calculates real-time Center of Mass (CoM) and Zero Moment Point (ZMP) stability
 */
export function calculateBiomechanicalState(frame: HumanoidKeyframe) {
  // Approximate standard anthropometric mass distribution:
  // Pelvis + Torso + Head: 60%, Arms: 10%, Legs: 30%
  const pelvisY = 0.95 + frame.pelvis.y;
  const torsoY = pelvisY + 0.35 * Math.cos((frame.torso.pitch * Math.PI) / 180);
  const headY = torsoY + 0.3 * Math.cos((frame.head.pitch * Math.PI) / 180);

  const comX = frame.pelvis.x * 0.7 + frame.torso.roll * 0.003;
  const comY = pelvisY * 0.5 + torsoY * 0.35 + headY * 0.15;
  const comZ = frame.pelvis.z * 0.7 + (frame.torso.pitch * 0.004);

  // Foot support polygon bounds
  const leftGrounded = frame.leftLeg.footGrounded;
  const rightGrounded = frame.rightLeg.footGrounded;

  let supportWidth = 0.28;
  let supportCenter = 0;

  if (leftGrounded && rightGrounded) {
    supportWidth = 0.34;
    supportCenter = 0;
  } else if (leftGrounded) {
    supportWidth = 0.14;
    supportCenter = -0.12;
  } else if (rightGrounded) {
    supportWidth = 0.14;
    supportCenter = 0.12;
  }

  const distanceToCenter = Math.abs(comX - supportCenter);
  const isBalanced = distanceToCenter <= supportWidth / 2;
  const zmpStabilityMargin = Math.max(0, (supportWidth / 2 - distanceToCenter));

  return {
    com: { x: comX, y: comY, z: comZ },
    zmpStabilityMargin,
    isBalanced,
    leftGrounded,
    rightGrounded,
    supportWidth,
  };
}

/**
 * Generates BioVision Hierarchy (BVH) text representation for humanoid animation
 */
export function exportToBVH(sequence: HumanoidSequence): string {
  let bvh = `HIERARCHY
ROOT Hips
{
  OFFSET 0.00 0.00 0.00
  CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation
  JOINT Spine
  {
    OFFSET 0.00 0.40 0.00
    CHANNELS 3 Zrotation Xrotation Yrotation
    JOINT Head
    {
      OFFSET 0.00 0.30 0.00
      CHANNELS 3 Zrotation Xrotation Yrotation
      End Site
      {
        OFFSET 0.00 0.15 0.00
      }
    }
  }
}
MOTION
Frames: ${sequence.keyframes.length}
Frame Time: ${(sequence.duration / sequence.keyframes.length).toFixed(4)}
`;

  sequence.keyframes.forEach((kf) => {
    bvh += `${kf.pelvis.x.toFixed(3)} ${(0.95 + kf.pelvis.y).toFixed(3)} ${kf.pelvis.z.toFixed(3)} ${kf.pelvis.roll.toFixed(2)} ${kf.pelvis.pitch.toFixed(2)} ${kf.pelvis.yaw.toFixed(2)} ${kf.torso.roll.toFixed(2)} ${kf.torso.pitch.toFixed(2)} ${kf.torso.yaw.toFixed(2)} ${kf.head.roll.toFixed(2)} ${kf.head.pitch.toFixed(2)} ${kf.head.yaw.toFixed(2)}\n`;
  });

  return bvh;
}
