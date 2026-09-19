/**
 * Types for Valid Humanoid VHH Generation & Biomechanical Synthesis
 */

export interface JointAngle3D {
  pitch: number; // X rotation in degrees
  yaw: number;   // Y rotation in degrees
  roll: number;  // Z rotation in degrees
}

export interface ArmKinematics {
  shoulderPitch: number;
  shoulderRoll: number;
  shoulderYaw: number;
  elbowPitch: number;
  wristPitch: number;
  wristYaw: number;
}

export interface LegKinematics {
  hipPitch: number;
  hipRoll: number;
  hipYaw: number;
  kneePitch: number;
  anklePitch: number;
  ankleRoll: number;
  footGrounded: boolean;
  contactPressure: number; // 0 to 1
}

export interface FacialBlendshapes {
  smileAU12: number;       // 0 to 1 (Lip Corner Puller)
  browRaiseAU1_2: number;  // 0 to 1 (Inner/Outer Brow Raiser)
  browFurrowAU4: number;   // 0 to 1 (Brow Lowerer)
  cheekRaiserAU6: number;  // 0 to 1 (Cheek Raiser - Duchenne smile)
  lipDepressorAU15: number;// 0 to 1 (Lip Corner Depressor)
  mouthOpenAU25_26: number;// 0 to 1 (Lips Part & Jaw Drop)
  lipPuckerAU18: number;   // 0 to 1 (Phoneme OO/W)
  blinkAU45: number;       // 0 to 1 (Eyelid closure)
  gazeX: number;           // -1 to 1 (Left / Right eye gaze)
  gazeY: number;           // -1 to 1 (Down / Up eye gaze)
}

export interface HumanoidKeyframe {
  timestamp: number; // seconds
  phase: string;     // e.g. "Stance", "Swing", "Gesture Peak", "Micro-nod"
  pelvis: {
    x: number;
    y: number; // vertical height offset (m)
    z: number;
    pitch: number;
    roll: number;
    yaw: number;
  };
  torso: JointAngle3D;
  head: JointAngle3D;
  leftArm: ArmKinematics;
  rightArm: ArmKinematics;
  leftLeg: LegKinematics;
  rightLeg: LegKinematics;
  facialExpression: FacialBlendshapes;
}

export interface ValidityMetrics {
  dynamicBalanceScore: number;       // 0 - 100%
  footContactFidelity: number;       // 0 - 100% (No foot skating)
  biomechanicalFeasibility: number;  // 0 - 100% (Joint limits & torques)
  naturalExpressionScore: number;    // 0 - 100% (FACS co-occurrence & natural micro-dynamics)
  overallValidityIndex: number;      // 0 - 100%
  validationNotes: string[];
}

export interface HumanoidSequence {
  id: string;
  title: string;
  description: string;
  duration: number; // seconds
  fps: number;
  architecture: string;
  emotion: string;
  style: string;
  validityMetrics: ValidityMetrics;
  keyframes: HumanoidKeyframe[];
}

export interface DeepLearningConfig {
  architecture: 'MDM + FaceDiff' | 'VHH-Transformer' | 'PINN-RL Controller' | 'Guided Latent Diffusion';
  diffusionSteps: number;
  guidanceScale: number;
  physicsLossWeight: number;
  facsSmoothness: number;
  emotionValence: number; // -1 to 1
  emotionArousal: number; // -1 to 1
}

export interface ViewportSettings {
  cameraMode: 'full' | 'head' | 'biomechanics' | 'top';
  showBones: boolean;
  showCoM: boolean;
  showSupportPolygon: boolean;
  showFacialMesh: boolean;
  showJointLimits: boolean;
  wireframe: boolean;
}
