import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { HumanoidKeyframe, ViewportSettings } from '../types';
import { calculateBiomechanicalState } from '../utils/motionMath';
import { Eye, Shield, Activity, Maximize2, RotateCcw, Play, Pause, FastForward, Sliders } from 'lucide-react';

interface Props {
  currentFrame: HumanoidKeyframe;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const HumanoidViewport3D: React.FC<Props> = ({
  currentFrame,
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  playbackSpeed,
  onChangeSpeed,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Character Mesh & Bone Refs
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const pelvisMeshRef = useRef<THREE.Group | null>(null);
  const torsoMeshRef = useRef<THREE.Group | null>(null);
  const headMeshRef = useRef<THREE.Group | null>(null);

  // Facial feature refs
  const leftEyeRef = useRef<THREE.Mesh | null>(null);
  const rightEyeRef = useRef<THREE.Mesh | null>(null);
  const leftEyelidRef = useRef<THREE.Mesh | null>(null);
  const rightEyelidRef = useRef<THREE.Mesh | null>(null);
  const leftEyebrowRef = useRef<THREE.Mesh | null>(null);
  const rightEyebrowRef = useRef<THREE.Mesh | null>(null);
  const mouthUpperRef = useRef<THREE.Mesh | null>(null);
  const mouthLowerRef = useRef<THREE.Mesh | null>(null);
  const jawRef = useRef<THREE.Group | null>(null);
  const cheekLeftRef = useRef<THREE.Mesh | null>(null);
  const cheekRightRef = useRef<THREE.Mesh | null>(null);

  // Limb refs
  const leftArmGroupRef = useRef<THREE.Group | null>(null);
  const leftForearmGroupRef = useRef<THREE.Group | null>(null);
  const rightArmGroupRef = useRef<THREE.Group | null>(null);
  const rightForearmGroupRef = useRef<THREE.Group | null>(null);

  const leftThighGroupRef = useRef<THREE.Group | null>(null);
  const leftShinGroupRef = useRef<THREE.Group | null>(null);
  const leftFootRef = useRef<THREE.Mesh | null>(null);

  const rightThighGroupRef = useRef<THREE.Group | null>(null);
  const rightShinGroupRef = useRef<THREE.Group | null>(null);
  const rightFootRef = useRef<THREE.Mesh | null>(null);

  // Visualizer elements
  const comIndicatorRef = useRef<THREE.Mesh | null>(null);
  const comPlumbLineRef = useRef<THREE.Line | null>(null);
  const supportPolygonRef = useRef<THREE.Mesh | null>(null);
  const skeletonLinesRef = useRef<THREE.LineSegments | null>(null);

  // Camera Orbit State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraPolarRef = useRef({ radius: 3.2, theta: 0.2, phi: 1.25 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 1.0, 0));

  // UI Viewport Settings
  const [settings, setSettings] = useState<ViewportSettings>({
    cameraMode: 'full',
    showBones: false,
    showCoM: true,
    showSupportPolygon: true,
    showFacialMesh: true,
    showJointLimits: true,
    wireframe: false,
  });

  const [fps, setFps] = useState(60);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  // Update Camera View Presets
  const setCameraPreset = (mode: 'full' | 'head' | 'biomechanics' | 'top') => {
    setSettings((prev) => ({ ...prev, cameraMode: mode }));
    if (mode === 'full') {
      cameraTargetRef.current.set(0, 1.0, 0);
      cameraPolarRef.current = { radius: 3.2, theta: 0.1, phi: 1.3 };
    } else if (mode === 'head') {
      cameraTargetRef.current.set(0, 1.48, 0);
      cameraPolarRef.current = { radius: 1.1, theta: 0.05, phi: 1.45 };
    } else if (mode === 'biomechanics') {
      cameraTargetRef.current.set(0, 0.9, 0);
      cameraPolarRef.current = { radius: 3.5, theta: Math.PI / 2, phi: 1.4 };
    } else if (mode === 'top') {
      cameraTargetRef.current.set(0, 0.2, 0);
      cameraPolarRef.current = { radius: 3.0, theta: 0.0, phi: 0.1 };
    }
  };

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0f17'); // Rich obsidian studio dark
    scene.fog = new THREE.FogExp2('#0b0f17', 0.12);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#e2e8f0', 1.8);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#94a3b8', 0.8);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 1.2);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Ground Grid & Floor
    const gridHelper = new THREE.GridHelper(10, 20, '#334155', '#1e293b');
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.8,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Humanoid Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: '#e2d5c8', // Natural warm tone
      roughness: 0.45,
      metalness: 0.05,
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8', // Cyan biomechanical articulation indicators
      roughness: 0.3,
      metalness: 0.4,
    });

    const suitMat = new THREE.MeshStandardMaterial({
      color: '#1e293b', // Modern athletic biomechanics suit
      roughness: 0.6,
      metalness: 0.2,
    });

    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: '#f8fafc' });
    const pupilMat = new THREE.MeshBasicMaterial({ color: '#0f172a' });
    const browMat = new THREE.MeshBasicMaterial({ color: '#334155' });
    const lipMat = new THREE.MeshStandardMaterial({ color: '#be7878', roughness: 0.5 });

    // --- Build Humanoid Hierarchy ---
    const characterGroup = new THREE.Group();
    characterGroupRef.current = characterGroup;
    scene.add(characterGroup);

    // Pelvis
    const pelvisGroup = new THREE.Group();
    pelvisMeshRef.current = pelvisGroup;
    characterGroup.add(pelvisGroup);

    const pelvisBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.16), suitMat);
    pelvisBody.castShadow = true;
    pelvisGroup.add(pelvisBody);

    // Torso / Spine
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.14, 0);
    torsoMeshRef.current = torsoGroup;
    pelvisGroup.add(torsoGroup);

    const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.32, 16), suitMat);
    chestMesh.position.set(0, 0.16, 0);
    chestMesh.castShadow = true;
    torsoGroup.add(chestMesh);

    // Neck & Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.36, 0);
    headMeshRef.current = headGroup;
    torsoGroup.add(headGroup);

    // Cranium
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), skinMat);
    headMesh.scale.set(1.0, 1.15, 1.05);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Jaw / Chin group
    const jawGroup = new THREE.Group();
    jawGroup.position.set(0, -0.06, 0.04);
    jawRef.current = jawGroup;
    headGroup.add(jawGroup);

    const chinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.08), skinMat);
    jawGroup.add(chinMesh);

    // Facial Eyes
    const createEye = (isLeft: boolean) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(isLeft ? -0.042 : 0.042, 0.025, 0.1);

      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 16), eyeWhiteMat);
      eyeGroup.add(sclera);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.011, 16, 16), pupilMat);
      pupil.position.set(0, 0, 0.016);
      eyeGroup.add(pupil);

      const eyelid = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.02, 0.02), skinMat);
      eyelid.position.set(0, 0.018, 0.01);
      eyelid.scale.set(1, 0.05, 1);
      eyeGroup.add(eyelid);

      return { eyeGroup, sclera, pupil, eyelid };
    };

    const leftEyeObj = createEye(true);
    const rightEyeObj = createEye(false);
    headGroup.add(leftEyeObj.eyeGroup);
    headGroup.add(rightEyeObj.eyeGroup);

    leftEyeRef.current = leftEyeObj.pupil;
    rightEyeRef.current = rightEyeObj.pupil;
    leftEyelidRef.current = leftEyeObj.eyelid;
    rightEyelidRef.current = rightEyeObj.eyelid;

    // Eyebrows
    const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.008, 0.012), browMat);
    leftBrow.position.set(-0.045, 0.058, 0.11);
    leftEyebrowRef.current = leftBrow;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.008, 0.012), browMat);
    rightBrow.position.set(0.045, 0.058, 0.11);
    rightEyebrowRef.current = rightBrow;
    headGroup.add(rightBrow);

    // Cheeks
    const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 12), skinMat);
    leftCheek.position.set(-0.065, -0.02, 0.085);
    cheekLeftRef.current = leftCheek;
    headGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 12), skinMat);
    rightCheek.position.set(0.065, -0.02, 0.085);
    cheekRightRef.current = rightCheek;
    headGroup.add(rightCheek);

    // Lips & Mouth
    const upperLip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, 0.015), lipMat);
    upperLip.position.set(0, -0.045, 0.115);
    mouthUpperRef.current = upperLip;
    headGroup.add(upperLip);

    const lowerLip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.01, 0.015), lipMat);
    lowerLip.position.set(0, -0.062, 0.112);
    mouthLowerRef.current = lowerLip;
    headGroup.add(lowerLip);

    // Arms
    const createArm = (isLeft: boolean) => {
      const shoulderX = isLeft ? -0.22 : 0.22;
      const armGroup = new THREE.Group();
      armGroup.position.set(shoulderX, 0.28, 0);

      const jointSphere = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), jointMat);
      armGroup.add(jointSphere);

      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.28, 12), suitMat);
      upperArm.position.set(0, -0.14, 0);
      upperArm.castShadow = true;
      armGroup.add(upperArm);

      const forearmGroup = new THREE.Group();
      forearmGroup.position.set(0, -0.28, 0);
      armGroup.add(forearmGroup);

      const elbowSphere = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 16), jointMat);
      forearmGroup.add(elbowSphere);

      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.26, 12), skinMat);
      forearm.position.set(0, -0.13, 0);
      forearm.castShadow = true;
      forearmGroup.add(forearm);

      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 0.025), skinMat);
      hand.position.set(0, -0.28, 0);
      forearmGroup.add(hand);

      return { armGroup, forearmGroup };
    };

    const leftArmObj = createArm(true);
    const rightArmObj = createArm(false);
    torsoGroup.add(leftArmObj.armGroup);
    torsoGroup.add(rightArmObj.armGroup);

    leftArmGroupRef.current = leftArmObj.armGroup;
    leftForearmGroupRef.current = leftArmObj.forearmGroup;
    rightArmGroupRef.current = rightArmObj.armGroup;
    rightForearmGroupRef.current = rightArmObj.forearmGroup;

    // Legs
    const createLeg = (isLeft: boolean) => {
      const hipX = isLeft ? -0.09 : 0.09;
      const legGroup = new THREE.Group();
      legGroup.position.set(hipX, -0.08, 0);

      const hipSphere = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), jointMat);
      legGroup.add(hipSphere);

      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.048, 0.42, 14), suitMat);
      thigh.position.set(0, -0.21, 0);
      thigh.castShadow = true;
      legGroup.add(thigh);

      const kneeGroup = new THREE.Group();
      kneeGroup.position.set(0, -0.42, 0);
      legGroup.add(kneeGroup);

      const kneeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), jointMat);
      kneeGroup.add(kneeSphere);

      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.038, 0.42, 14), suitMat);
      shin.position.set(0, -0.21, 0);
      shin.castShadow = true;
      kneeGroup.add(shin);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.18), suitMat);
      foot.position.set(0, -0.44, 0.04);
      foot.castShadow = true;
      kneeGroup.add(foot);

      return { legGroup, kneeGroup, foot };
    };

    const leftLegObj = createLeg(true);
    const rightLegObj = createLeg(false);
    pelvisGroup.add(leftLegObj.legGroup);
    pelvisGroup.add(rightLegObj.legGroup);

    leftThighGroupRef.current = leftLegObj.legGroup;
    leftShinGroupRef.current = leftLegObj.kneeGroup;
    leftFootRef.current = leftLegObj.foot;

    rightThighGroupRef.current = rightLegObj.legGroup;
    rightShinGroupRef.current = rightLegObj.kneeGroup;
    rightFootRef.current = rightLegObj.foot;

    // CoM Indicator & Plumb Line
    const comGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const comMat = new THREE.MeshBasicMaterial({ color: '#f59e0b', wireframe: true });
    const comMesh = new THREE.Mesh(comGeo, comMat);
    comIndicatorRef.current = comMesh;
    scene.add(comMesh);

    const plumbLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const plumbLineMat = new THREE.LineDashedMaterial({
      color: '#f59e0b',
      dashSize: 0.05,
      gapSize: 0.03,
    });
    const plumbLine = new THREE.Line(plumbLineGeo, plumbLineMat);
    plumbLine.computeLineDistances();
    comPlumbLineRef.current = plumbLine;
    scene.add(plumbLine);

    // Support Polygon
    const polyGeo = new THREE.RingGeometry(0.05, 0.22, 32);
    const polyMat = new THREE.MeshBasicMaterial({
      color: '#10b981',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const supportPoly = new THREE.Mesh(polyGeo, polyMat);
    supportPoly.rotation.x = -Math.PI / 2;
    supportPoly.position.y = 0.005;
    supportPolygonRef.current = supportPoly;
    scene.add(supportPoly);

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Render loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // FPS tracking
      const now = performance.now();
      frameCountRef.current++;
      if (now - lastTimeRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      // Update camera spherical coordinates
      const { radius, theta, phi } = cameraPolarRef.current;
      const target = cameraTargetRef.current;
      camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = target.y + radius * Math.cos(phi);
      camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(target);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Update Humanoid Poses and Facial Blendshapes on each frame
  useEffect(() => {
    if (!currentFrame || !pelvisMeshRef.current || !torsoMeshRef.current || !headMeshRef.current) return;

    const toRad = (deg: number) => (deg * Math.PI) / 180;

    // Pelvis Position & Orientation
    pelvisMeshRef.current.position.set(
      currentFrame.pelvis.x,
      0.95 + currentFrame.pelvis.y,
      currentFrame.pelvis.z
    );
    pelvisMeshRef.current.rotation.set(
      toRad(currentFrame.pelvis.pitch),
      toRad(currentFrame.pelvis.yaw),
      toRad(currentFrame.pelvis.roll)
    );

    // Torso Orientation
    torsoMeshRef.current.rotation.set(
      toRad(currentFrame.torso.pitch),
      toRad(currentFrame.torso.yaw),
      toRad(currentFrame.torso.roll)
    );

    // Head Orientation
    headMeshRef.current.rotation.set(
      toRad(currentFrame.head.pitch),
      toRad(currentFrame.head.yaw),
      toRad(currentFrame.head.roll)
    );

    // Left Arm Kinematics
    if (leftArmGroupRef.current && leftForearmGroupRef.current) {
      leftArmGroupRef.current.rotation.set(
        toRad(currentFrame.leftArm.shoulderPitch),
        toRad(currentFrame.leftArm.shoulderYaw),
        toRad(currentFrame.leftArm.shoulderRoll)
      );
      leftForearmGroupRef.current.rotation.x = toRad(-currentFrame.leftArm.elbowPitch);
    }

    // Right Arm Kinematics
    if (rightArmGroupRef.current && rightForearmGroupRef.current) {
      rightArmGroupRef.current.rotation.set(
        toRad(currentFrame.rightArm.shoulderPitch),
        toRad(currentFrame.rightArm.shoulderYaw),
        toRad(currentFrame.rightArm.shoulderRoll)
      );
      rightForearmGroupRef.current.rotation.x = toRad(-currentFrame.rightArm.elbowPitch);
    }

    // Left Leg Kinematics
    if (leftThighGroupRef.current && leftShinGroupRef.current) {
      leftThighGroupRef.current.rotation.set(
        toRad(currentFrame.leftLeg.hipPitch),
        toRad(currentFrame.leftLeg.hipYaw),
        toRad(currentFrame.leftLeg.hipRoll)
      );
      leftShinGroupRef.current.rotation.x = toRad(currentFrame.leftLeg.kneePitch);
    }

    // Right Leg Kinematics
    if (rightThighGroupRef.current && rightShinGroupRef.current) {
      rightThighGroupRef.current.rotation.set(
        toRad(currentFrame.rightLeg.hipPitch),
        toRad(currentFrame.rightLeg.hipYaw),
        toRad(currentFrame.rightLeg.hipRoll)
      );
      rightShinGroupRef.current.rotation.x = toRad(currentFrame.rightLeg.kneePitch);
    }

    // Facial Blendshapes & FACS Action Units
    const face = currentFrame.facialExpression;

    // Eyes: Gaze direction
    if (leftEyeRef.current && rightEyeRef.current) {
      const gazeXOffset = face.gazeX * 0.007;
      const gazeYOffset = face.gazeY * 0.006;
      leftEyeRef.current.position.set(gazeXOffset, gazeYOffset, 0.016);
      rightEyeRef.current.position.set(gazeXOffset, gazeYOffset, 0.016);
    }

    // Eyelids: Blink AU45
    if (leftEyelidRef.current && rightEyelidRef.current) {
      const lidScaleY = 0.05 + face.blinkAU45 * 1.8;
      leftEyelidRef.current.scale.set(1, lidScaleY, 1);
      rightEyelidRef.current.scale.set(1, lidScaleY, 1);
    }

    // Eyebrows: Brow raise AU1+AU2 & Furrow AU4
    if (leftEyebrowRef.current && rightEyebrowRef.current) {
      const browY = 0.058 + face.browRaiseAU1_2 * 0.016 - face.browFurrowAU4 * 0.008;
      const browZ = 0.11 + face.browFurrowAU4 * 0.005;
      const furrowRot = face.browFurrowAU4 * 0.25;

      leftEyebrowRef.current.position.set(-0.045, browY, browZ);
      leftEyebrowRef.current.rotation.z = furrowRot;

      rightEyebrowRef.current.position.set(0.045, browY, browZ);
      rightEyebrowRef.current.rotation.z = -furrowRot;
    }

    // Cheeks: Cheek Raiser AU6 (Duchenne smile)
    if (cheekLeftRef.current && cheekRightRef.current) {
      const cheekScale = 1.0 + face.cheekRaiserAU6 * 0.45;
      cheekLeftRef.current.scale.set(cheekScale, cheekScale, cheekScale);
      cheekRightRef.current.scale.set(cheekScale, cheekScale, cheekScale);
    }

    // Mouth: Smile AU12, Lips Part AU25, Jaw Drop AU26
    if (mouthUpperRef.current && mouthLowerRef.current && jawRef.current) {
      const mouthOpen = face.mouthOpenAU25_26;
      const smile = face.smileAU12;

      // Jaw rotation
      jawRef.current.rotation.x = mouthOpen * 0.22;

      // Lips
      mouthUpperRef.current.position.y = -0.045 + smile * 0.006;
      mouthUpperRef.current.scale.set(1 + smile * 0.25, 1, 1);

      mouthLowerRef.current.position.y = -0.062 - mouthOpen * 0.02 + smile * 0.004;
      mouthLowerRef.current.scale.set(1 + smile * 0.2, 1, 1);
    }

    // Biomechanical Calculation: CoM & Support Polygon
    const bio = calculateBiomechanicalState(currentFrame);

    if (comIndicatorRef.current && comPlumbLineRef.current) {
      comIndicatorRef.current.position.set(bio.com.x, bio.com.y, bio.com.z);
      comIndicatorRef.current.visible = settings.showCoM;

      // Plumb line down to floor
      const points = [
        new THREE.Vector3(bio.com.x, bio.com.y, bio.com.z),
        new THREE.Vector3(bio.com.x, 0.01, bio.com.z),
      ];
      comPlumbLineRef.current.geometry.setFromPoints(points);
      comPlumbLineRef.current.visible = settings.showCoM;
    }

    if (supportPolygonRef.current) {
      supportPolygonRef.current.visible = settings.showSupportPolygon;
      supportPolygonRef.current.position.set(currentFrame.pelvis.x, 0.005, currentFrame.pelvis.z);

      // Scale support polygon based on balance margin
      const scaleX = bio.supportWidth * 3.5;
      supportPolygonRef.current.scale.set(scaleX, 1, 1);

      // Color support polygon: green when balanced, red when unstable
      const mat = supportPolygonRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.color.set(bio.isBalanced ? '#10b981' : '#ef4444');
      }
    }
  }, [currentFrame, settings]);

  // Mouse Orbit Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    cameraPolarRef.current.theta -= deltaX * 0.008;
    cameraPolarRef.current.phi = Math.max(
      0.1,
      Math.min(Math.PI - 0.1, cameraPolarRef.current.phi - deltaY * 0.008)
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraPolarRef.current.radius = Math.max(
      0.6,
      Math.min(7.0, cameraPolarRef.current.radius + e.deltaY * 0.003)
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full flex-1 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* Left: Camera Angle Presets */}
        <div className="flex items-center space-x-1 bg-slate-900/90 backdrop-blur-md px-2 py-1.5 rounded-lg border border-slate-800 pointer-events-auto shadow-lg">
          <button
            id="camera-full-body-btn"
            onClick={() => setCameraPreset('full')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              settings.cameraMode === 'full'
                ? 'bg-sky-500 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Full Body
          </button>
          <button
            id="camera-head-expression-btn"
            onClick={() => setCameraPreset('head')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              settings.cameraMode === 'head'
                ? 'bg-sky-500 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Face / Expression
          </button>
          <button
            id="camera-biomechanics-btn"
            onClick={() => setCameraPreset('biomechanics')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              settings.cameraMode === 'biomechanics'
                ? 'bg-sky-500 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Side Sagittal
          </button>
          <button
            id="camera-top-down-btn"
            onClick={() => setCameraPreset('top')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              settings.cameraMode === 'top'
                ? 'bg-sky-500 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Top CoM
          </button>
        </div>

        {/* Right: Viewport Overlays & FPS Badge */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <button
              id="toggle-com-overlay-btn"
              onClick={() => setSettings((s) => ({ ...s, showCoM: !s.showCoM }))}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded ${
                settings.showCoM ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Center of Mass & Plumb Line"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>CoM</span>
            </button>
            <button
              id="toggle-support-polygon-btn"
              onClick={() => setSettings((s) => ({ ...s, showSupportPolygon: !s.showSupportPolygon }))}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded ${
                settings.showSupportPolygon ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Foot Support Polygon"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>ZMP Polygon</span>
            </button>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{fps} FPS</span>
          </div>
        </div>
      </div>

      {/* Real-time Movement & Expression HUD Pill */}
      <div className="absolute top-16 left-3 pointer-events-none flex flex-col space-y-1.5">
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-800 text-xs text-slate-300 flex items-center space-x-3">
          <span className="text-slate-400">Kinematic Phase:</span>
          <span className="font-semibold text-sky-400">{currentFrame.phase || 'Harmonic Movement'}</span>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-800 text-xs text-slate-300 flex items-center space-x-4 font-mono">
          <div>
            <span className="text-slate-400">Smile (AU12): </span>
            <span className="text-amber-300">{(currentFrame.facialExpression.smileAU12 * 100).toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-slate-400">Brow (AU1/2): </span>
            <span className="text-amber-300">{(currentFrame.facialExpression.browRaiseAU1_2 * 100).toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-slate-400">Blink (AU45): </span>
            <span className={currentFrame.facialExpression.blinkAU45 > 0.5 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {currentFrame.facialExpression.blinkAU45 > 0.5 ? 'CLOSED' : 'OPEN'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Playback & Scrubber Controls */}
      <div className="bg-slate-900/95 border-t border-slate-800 p-3 flex flex-col space-y-2">
        {/* Scrubber Bar */}
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-slate-400 w-12 text-right">
            {currentTime.toFixed(2)}s
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              id="timeline-scrubber-slider"
              type="range"
              min="0"
              max={duration}
              step="0.01"
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400 transition-all"
            />
          </div>
          <span className="text-xs font-mono text-slate-400 w-12">
            {duration.toFixed(2)}s
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <button
              id="playback-toggle-btn"
              onClick={onTogglePlay}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-md active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              id="reset-frame-btn"
              onClick={() => onSeek(0)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="Return to start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Playback speed selector */}
            <div className="flex items-center bg-slate-800/80 rounded-md p-0.5 text-xs text-slate-300">
              {[0.25, 0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeSpeed(s)}
                  className={`px-2 py-0.5 rounded ${
                    playbackSpeed === s ? 'bg-sky-500 text-white font-medium' : 'hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <span>Hold & drag to orbit • Scroll to zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
};
