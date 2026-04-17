"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshDistortMaterial, Float, Line } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function TopographicPlane() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.1) * 0.05;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2.3, 0, 0]} position={[0, -0.6, 0]}>
      <planeGeometry args={[9, 9, 64, 64]} />
      <MeshDistortMaterial
        color="#1E3A2B"
        wireframe
        distort={0.35}
        speed={0.6}
      />
    </mesh>
  );
}

function ContourRings() {
  const rings = useMemo(() => {
    const out: THREE.Vector3[][] = [];
    for (let r = 0.6; r < 4; r += 0.4) {
      const pts: THREE.Vector3[] = [];
      const seg = 64;
      for (let i = 0; i <= seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        const jitter = 1 + Math.sin(a * 3 + r * 2) * 0.06;
        pts.push(new THREE.Vector3(Math.cos(a) * r * jitter, 0, Math.sin(a) * r * jitter));
      }
      out.push(pts);
    }
    return out;
  }, []);

  const group = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.05;
  });

  return (
    <group ref={group} position={[0, -0.58, 0]}>
      {rings.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#4A6B7A"
          lineWidth={1}
          transparent
          opacity={0.35 - i * 0.03}
        />
      ))}
    </group>
  );
}

function GolfBall() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = 0.2 + Math.sin(clock.elapsedTime * 1.4) * 0.04;
    ref.current.rotation.y = clock.elapsedTime * 0.35;
    ref.current.rotation.x = clock.elapsedTime * 0.15;
  });
  return (
    <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.2}>
      <mesh ref={ref} position={[0, 0.2, 0]} castShadow>
        <icosahedronGeometry args={[0.32, 3]} />
        <meshPhysicalMaterial
          color="#FFFDF7"
          roughness={0.25}
          metalness={0.05}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          flatShading
        />
      </mesh>
    </Float>
  );
}

function PinFlag() {
  return (
    <group position={[1.6, -0.55, -0.8]}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.4, 8]} />
        <meshStandardMaterial color="#0E120F" />
      </mesh>
      <mesh position={[0.18, 1.15, 0]}>
        <planeGeometry args={[0.32, 0.2]} />
        <meshStandardMaterial color="#FF6B1A" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function HeroCourse() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [2.2, 1.8, 3.4], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#F2EEE4"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 5, 2]} intensity={1.1} castShadow />
      <Suspense fallback={null}>
        <TopographicPlane />
        <ContourRings />
        <GolfBall />
        <PinFlag />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
