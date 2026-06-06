import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { Stars, Float } from "@react-three/drei";
import * as THREE from "three";

function SoccerBall() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.5;
      ref.current.rotation.x += dt * 0.18;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.35} floatIntensity={0.9}>
      <mesh ref={ref} position={[0, 1.15, 0]}>
        <icosahedronGeometry args={[1.3, 2]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.35} metalness={0.18} flatShading />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <icosahedronGeometry args={[1.34, 2]} />
        <meshBasicMaterial color="#0a0a0a" wireframe opacity={0.65} transparent />
      </mesh>
    </Float>
  );
}

function NeonRings() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.32;
  });

  return (
    <group ref={ref} position={[0, 1.15, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.05, 16, 120]} />
        <meshStandardMaterial color="#5cc5ff" emissive="#5cc5ff" emissiveIntensity={0.45} roughness={0.12} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <torusGeometry args={[3.6, 0.05, 16, 120]} />
        <meshStandardMaterial color="#a76cff" emissive="#a76cff" emissiveIntensity={0.28} roughness={0.18} />
      </mesh>
    </group>
  );
}

function ArenaPlate() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.05;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.95, 0]}>
      <cylinderGeometry args={[4.6, 4.6, 0.15, 64]} />
      <meshStandardMaterial color="#111827" roughness={0.2} metalness={0.82} />
    </mesh>
  );
}

function GlowHalo() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.92, 0]}>
      <ringGeometry args={[4.8, 5.4, 64]} />
      <meshBasicMaterial color="#5cc5ff" transparent opacity={0.12} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Decorative full-bleed 3D scene. Place as `absolute inset-0` behind content. */
export function FootballScene({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <directionalLight position={[5, 5, 5]} intensity={1.15} color="#fff5d6" />
          <pointLight position={[-4, -2, 3]} intensity={0.65} color="#5cc5ff" />
          <pointLight position={[4, 2, -3]} intensity={0.45} color="#a76cff" />
          <SoccerBall />
          <NeonRings />
          <ArenaPlate />
          <GlowHalo />
          <Stars radius={50} depth={30} count={1200} factor={2} fade speed={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}
