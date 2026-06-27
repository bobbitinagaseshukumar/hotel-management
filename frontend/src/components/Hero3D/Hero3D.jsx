import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei';

/* ─── Procedural 3D Hotel Building ─── */
function HotelBuilding() {
  const groupRef = useRef();
  const windowsRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
    }
  });

  const windowPositions = useMemo(() => {
    const positions = [];
    const floors = 12;
    const windowsPerFloor = 6;
    for (let floor = 0; floor < floors; floor++) {
      for (let w = 0; w < windowsPerFloor; w++) {
        const x = (w - windowsPerFloor / 2 + 0.5) * 0.55;
        const y = floor * 0.65 + 0.5;
        const lit = Math.random() > 0.25;
        positions.push({ x, y, z: 1.81, lit });
      }
    }
    return positions;
  }, []);

  return (
    <group ref={groupRef} position={[0, -2.5, 0]}>
      {/* Main Tower */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[4, 9, 3.5]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Glass Facade */}
      <mesh position={[0, 4, 1.76]}>
        <planeGeometry args={[3.8, 8.8]} />
        <meshPhysicalMaterial
          color="#0a1628"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
          envMapIntensity={2}
        />
      </mesh>

      {/* Gold Trim Top */}
      <mesh position={[0, 8.6, 0]}>
        <boxGeometry args={[4.3, 0.15, 3.8]} />
        <meshStandardMaterial color="#D4A017" metalness={0.8} roughness={0.2} emissive="#D4A017" emissiveIntensity={0.3} />
      </mesh>

      {/* Gold Trim Base */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[4.6, 0.3, 4]} />
        <meshStandardMaterial color="#D4A017" metalness={0.8} roughness={0.2} emissive="#D4A017" emissiveIntensity={0.3} />
      </mesh>

      {/* Entrance Portico */}
      <mesh position={[0, -0.1, 2.3]}>
        <boxGeometry args={[2.5, 1.2, 1.2]} />
        <meshStandardMaterial color="#111122" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Entrance Gold Arch */}
      <mesh position={[0, 0.6, 2.8]}>
        <boxGeometry args={[2.6, 0.1, 0.1]} />
        <meshStandardMaterial color="#D4A017" metalness={0.9} roughness={0.1} emissive="#FFD700" emissiveIntensity={0.5} />
      </mesh>

      {/* Entrance Door */}
      <mesh position={[0, -0.1, 2.92]}>
        <planeGeometry args={[1.2, 1]} />
        <meshStandardMaterial color="#D4A017" metalness={0.9} roughness={0.1} emissive="#FFD700" emissiveIntensity={0.4} />
      </mesh>

      {/* Left Wing */}
      <mesh position={[-3.2, 2.5, 0]}>
        <boxGeometry args={[2.5, 6, 3]} />
        <meshStandardMaterial color="#16162a" metalness={0.6} roughness={0.35} />
      </mesh>

      {/* Right Wing */}
      <mesh position={[3.2, 2.5, 0]}>
        <boxGeometry args={[2.5, 6, 3]} />
        <meshStandardMaterial color="#16162a" metalness={0.6} roughness={0.35} />
      </mesh>

      {/* Penthouse */}
      <mesh position={[0, 9.2, 0]}>
        <boxGeometry args={[2.5, 1.2, 2.5]} />
        <meshPhysicalMaterial color="#0d0d1a" metalness={0.8} roughness={0.15} transparent opacity={0.7} />
      </mesh>

      {/* Penthouse Gold Crown */}
      <mesh position={[0, 9.9, 0]}>
        <boxGeometry args={[2.7, 0.1, 2.7]} />
        <meshStandardMaterial color="#D4A017" metalness={0.9} roughness={0.1} emissive="#FFD700" emissiveIntensity={0.6} />
      </mesh>

      {/* Rooftop Spire */}
      <mesh position={[0, 10.8, 0]}>
        <coneGeometry args={[0.15, 1.5, 8]} />
        <meshStandardMaterial color="#D4A017" metalness={0.95} roughness={0.05} emissive="#FFD700" emissiveIntensity={0.8} />
      </mesh>

      {/* Windows */}
      {windowPositions.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          <planeGeometry args={[0.4, 0.5]} />
          <meshStandardMaterial
            color={pos.lit ? '#FFE4A0' : '#0a0a1a'}
            emissive={pos.lit ? '#FFD700' : '#000000'}
            emissiveIntensity={pos.lit ? 0.4 : 0}
            transparent
            opacity={pos.lit ? 0.9 : 0.5}
          />
        </mesh>
      ))}

      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a12" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Fountain Base (in front) */}
      <mesh position={[0, -0.35, 4.5]}>
        <cylinderGeometry args={[0.8, 1, 0.4, 32]} />
        <meshStandardMaterial color="#D4A017" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Floating Particles ─── */
function GoldParticles({ count = 200 }) {
  const mesh = useRef();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = Math.random() * 15 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
      sizes[i] = Math.random() * 0.05 + 0.01;
    }
    return { positions, sizes };
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      const positions = mesh.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += 0.003;
        if (positions[i * 3 + 1] > 13) positions[i * 3 + 1] = -2;
      }
      mesh.current.geometry.attributes.position.needsUpdate = true;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#D4A017" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ─── Animated Camera ─── */
function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.1) * 2;
    state.camera.position.y = 3 + Math.sin(t * 0.15) * 0.5;
    state.camera.position.z = 10 + Math.sin(t * 0.08) * 1.5;
    state.camera.lookAt(0, 2, 0);
  });
  return null;
}

/* ─── Main Hero Component ─── */
export default function Hero3D() {
  return (
    <section className="relative w-full h-screen overflow-hidden" id="hero">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 3, 10], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#050507']} />

          {/* Lighting */}
          <ambientLight intensity={0.15} />
          <directionalLight position={[10, 15, 5]} intensity={0.8} color="#ffffff" />
          <directionalLight position={[-5, 8, -5]} intensity={0.3} color="#D4A017" />
          <pointLight position={[0, 0, 5]} intensity={1.5} color="#FFD700" distance={15} decay={2} />
          <pointLight position={[4, 6, 3]} intensity={0.5} color="#FFE4A0" distance={20} decay={2} />
          <pointLight position={[-4, 6, 3]} intensity={0.5} color="#FFE4A0" distance={20} decay={2} />
          <spotLight position={[0, 12, 8]} angle={0.3} penumbra={0.8} intensity={1} color="#D4A017" castShadow />

          {/* Fog */}
          <fog attach="fog" args={['#050507', 8, 30]} />

          {/* Scene */}
          <HotelBuilding />
          <GoldParticles count={300} />
          <Stars radius={50} depth={50} count={1000} factor={3} fade speed={0.5} />
          <CameraRig />
        </Canvas>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian-950 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950/60 via-transparent to-obsidian-950/60 pointer-events-none" />

      {/* Hero Text Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-4"
        >
          <span className="text-gold-500 font-accent text-lg md:text-xl tracking-[0.4em] uppercase">
            ★★★★★ Luxury Experience
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
        >
          <span className="block">The Grand</span>
          <span className="block bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">
            Palatial
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="font-accent text-lg md:text-2xl text-platinum-300 mb-10 max-w-2xl italic"
        >
          Where culinary artistry meets timeless elegance. An unforgettable dining experience awaits.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a
            href="#menu"
            className="group relative px-10 py-4 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-obsidian-950 font-semibold text-lg rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,160,23,0.5)] hover:scale-105"
          >
            <span className="relative z-10">Explore Our Menu</span>
            <div className="absolute inset-0 bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </a>
          <a
            href="#reservations"
            className="px-10 py-4 border-2 border-gold-500/50 text-gold-400 font-semibold text-lg rounded-full backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-gold-500/10 hover:shadow-[0_0_30px_rgba(212,160,23,0.2)] hover:scale-105"
          >
            Reserve a Table
          </a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-platinum-400 text-xs tracking-[0.3em] uppercase">Scroll</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-gold-500 to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
