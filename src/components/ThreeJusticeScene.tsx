import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeJusticeSceneProps {
  className?: string;
}

export default function ThreeJusticeScene({ className = '' }: ThreeJusticeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070d1e, 0.04);

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.75);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setWebglSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Group for the entire 3D Justice Installation - centered vertically
    const justiceGroup = new THREE.Group();
    justiceGroup.position.set(0, -0.12, 0);
    scene.add(justiceGroup);

    // Materials: Luxury Polished Brass & Neoclassical Dark Slate
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.88,
      roughness: 0.22,
      envMapIntensity: 1.5,
    });

    const polishedGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5d77f,
      metalness: 0.95,
      roughness: 0.15,
    });

    const darkPillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x111c38,
      metalness: 0.35,
      roughness: 0.45,
    });

    const marbleBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c142b,
      metalness: 0.2,
      roughness: 0.6,
    });

    // 1. Plinth / Base
    const baseGeometry = new THREE.CylinderGeometry(1.6, 1.8, 0.25, 32);
    const baseMesh = new THREE.Mesh(baseGeometry, marbleBaseMaterial);
    baseMesh.position.y = -1.2;
    justiceGroup.add(baseMesh);

    const baseRingGeo = new THREE.TorusGeometry(1.6, 0.04, 16, 64);
    const baseRing = new THREE.Mesh(baseRingGeo, goldMaterial);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = -1.08;
    justiceGroup.add(baseRing);

    // 2. Central Fluted Column of Law
    const columnGeo = new THREE.CylinderGeometry(0.18, 0.22, 2.2, 24);
    const columnMesh = new THREE.Mesh(columnGeo, darkPillarMaterial);
    columnMesh.position.y = 0.05;
    justiceGroup.add(columnMesh);

    // Gold rings on column
    [-0.8, -0.2, 0.4, 1.1].forEach((yPos) => {
      const ringGeo = new THREE.TorusGeometry(0.22, 0.03, 16, 32);
      const ring = new THREE.Mesh(ringGeo, goldMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = yPos;
      justiceGroup.add(ring);
    });

    // Capital / Head of the pillar
    const capitalGeo = new THREE.ConeGeometry(0.4, 0.3, 16);
    const capital = new THREE.Mesh(capitalGeo, goldMaterial);
    capital.position.y = 1.25;
    justiceGroup.add(capital);

    // Finial Sphere at top
    const finialGeo = new THREE.SphereGeometry(0.15, 24, 24);
    const finial = new THREE.Mesh(finialGeo, polishedGoldMaterial);
    finial.position.y = 1.45;
    justiceGroup.add(finial);

    // 3. Balance Scales System (Interactive beam with pans)
    const beamGroup = new THREE.Group();
    beamGroup.position.set(0, 1.25, 0);
    justiceGroup.add(beamGroup);

    // Horizontal Beam
    const beamGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.6, 24);
    const beamMesh = new THREE.Mesh(beamGeo, goldMaterial);
    beamMesh.rotation.z = Math.PI / 2;
    beamGroup.add(beamMesh);

    // Pivot center sphere
    const pivotGeo = new THREE.SphereGeometry(0.12, 20, 20);
    const pivot = new THREE.Mesh(pivotGeo, polishedGoldMaterial);
    beamGroup.add(pivot);

    // Helper function to build a hanging pan
    const createPan = (xOffset: number) => {
      const panGroup = new THREE.Group();
      panGroup.position.set(xOffset, 0, 0);

      // Chains (3 thin cords)
      const chainMaterial = new THREE.MeshStandardMaterial({
        color: 0xc5a880,
        metalness: 0.8,
        roughness: 0.3,
      });

      const chainLength = 1.1;
      const numCords = 3;
      for (let i = 0; i < numCords; i++) {
        const angle = (i * (Math.PI * 2)) / numCords;
        const cordRadius = 0.4;
        const cordEnd = new THREE.Vector3(Math.cos(angle) * cordRadius, -chainLength, Math.sin(angle) * cordRadius);

        const curve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), cordEnd);
        const tubeGeo = new THREE.TubeGeometry(curve, 12, 0.015, 8, false);
        const chainMesh = new THREE.Mesh(tubeGeo, chainMaterial);
        panGroup.add(chainMesh);
      }

      // Hanging pan dish
      const panDishGeo = new THREE.CylinderGeometry(0.48, 0.25, 0.12, 32);
      const panDish = new THREE.Mesh(panDishGeo, polishedGoldMaterial);
      panDish.position.y = -chainLength;
      panGroup.add(panDish);

      // Inner rim
      const panRimGeo = new THREE.TorusGeometry(0.48, 0.02, 16, 32);
      const panRim = new THREE.Mesh(panRimGeo, goldMaterial);
      panRim.rotation.x = Math.PI / 2;
      panRim.position.y = -chainLength + 0.06;
      panGroup.add(panRim);

      return { panGroup, panDish };
    };

    const leftPanObj = createPan(-1.25);
    const rightPanObj = createPan(1.25);
    beamGroup.add(leftPanObj.panGroup);
    beamGroup.add(rightPanObj.panGroup);

    // 4. Subtle Floating Motes of Legal Justice (Light Particles)
    const particleCount = 65;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      scales[i] = Math.random() * 0.03 + 0.01;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xebd8ba,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 5. Sophisticated Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const warmKeyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    warmKeyLight.position.set(3, 4, 4);
    scene.add(warmKeyLight);

    const coolRimLight = new THREE.DirectionalLight(0x7395d9, 1.5);
    coolRimLight.position.set(-4, -1, -3);
    scene.add(coolRimLight);

    const pointLight = new THREE.PointLight(0xd4af37, 2, 8);
    pointLight.position.set(0, 0.5, 2);
    scene.add(pointLight);

    // Mouse Tracking & Interaction
    let targetRotationY = 0;
    let targetRotationX = 0;
    let currentRotationY = 0;
    let currentRotationX = 0;
    let beamOscillation = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      setIsInteracting(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);

      targetRotationY = x * 0.45;
      targetRotationX = -y * 0.18;
      beamOscillation = x * 0.12;
    };

    const handlePointerLeave = () => {
      setIsInteracting(false);
      targetRotationY = 0;
      targetRotationX = 0;
      beamOscillation = 0;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousemove', handlePointerMove);
    domElement.addEventListener('mouseleave', handlePointerLeave);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth lerping towards cursor
        currentRotationY += (targetRotationY - currentRotationY) * 0.05;
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;

        // Idle floating oscillation
        const idleSway = Math.sin(elapsedTime * 0.8) * 0.05;
        justiceGroup.rotation.y = currentRotationY + idleSway;
        justiceGroup.rotation.x = currentRotationX + Math.sin(elapsedTime * 0.6) * 0.02;

        // Beam balance tilt (slight judicial equilibrium float)
        const targetBeamTilt = beamOscillation + Math.sin(elapsedTime * 1.5) * 0.035;
        beamGroup.rotation.z += (targetBeamTilt - beamGroup.rotation.z) * 0.08;

        // Counter-tilt for pans so they always hang vertically with gravity
        leftPanObj.panGroup.rotation.z = -beamGroup.rotation.z;
        rightPanObj.panGroup.rotation.z = -beamGroup.rotation.z;

        // Gentle particle motion
        const positionAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          let y = positionAttr.getY(i) + delta * 0.2;
          if (y > 2.5) y = -2.5;
          positionAttr.setY(i, y);
        }
        positionAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousemove', handlePointerMove);
      domElement.removeEventListener('mouseleave', handlePointerLeave);

      if (container && domElement.parentNode === container) {
        container.removeChild(domElement);
      }

      // Dispose Three.js objects
      scene.clear();
      renderer.dispose();
      goldMaterial.dispose();
      polishedGoldMaterial.dispose();
      darkPillarMaterial.dispose();
      marbleBaseMaterial.dispose();
      particleMaterial.dispose();
      particleGeometry.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-700"
        aria-label="Interactive 3D Scales of Justice and Judicial Pillar"
      />

      {/* Fallback if WebGL fails */}
      {!webglSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0a1128]/80 border border-[#c5a880]/20 rounded-2xl">
          <div className="w-20 h-20 rounded-full border border-[#c5a880]/30 flex items-center justify-center mb-4 text-[#c5a880]">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l9-4 9 4m-9-4v20m-9-4l9 4 9-4" />
            </svg>
          </div>
          <h4 className="text-lg font-serif text-[#ebd8ba] mb-1">Pillars of Justice</h4>
          <p className="text-xs text-slate-400">Varun Law Firm · Equity, Integrity & Advocacy</p>
        </div>
      )}

      {/* Subtle interaction affordance note */}
      <div className="absolute bottom-4 right-4 pointer-events-none hidden sm:flex items-center gap-2 text-[11px] text-[#c5a880]/70 font-sans tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]/80"></span>
        <span>Interactive 3D · Move to tilt equilibrium</span>
      </div>
    </div>
  );
}
