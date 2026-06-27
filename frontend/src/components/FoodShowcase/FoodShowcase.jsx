import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState, useMemo } from 'react';
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

/* ─── 3D Plate with Food ─── */
function LuxuryPlate({ position, color, hovered, onClick }) {
  const groupRef = useRef();
  const foodRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += hovered ? 0.02 : 0.005;
    }
    if (foodRef.current) {
      foodRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.35;
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* Plate Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.3, 0.12, 64]} />
        <meshPhysicalMaterial
          color="#f5f5f5"
          metalness={0.1}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Gold Rim */}
      <mesh position={[0, 0.07, 0]}>
        <torusGeometry args={[1.2, 0.03, 16, 64]} />
        <meshStandardMaterial color="#D4A017" metalness={0.9} roughness={0.1} emissive="#D4A017" emissiveIntensity={0.2} />
      </mesh>

      {/* Inner Plate */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.9, 0.95, 0.04, 64]} />
        <meshPhysicalMaterial color="#ffffff" metalness={0.05} roughness={0.15} clearcoat={0.8} />
      </mesh>

      {/* Food Item (Sphere-based) */}
      <mesh ref={foodRef} position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={hovered ? 0.4 : 0.2}
          radius={1}
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>

      {/* Garnish elements */}
      <mesh position={[0.4, 0.25, 0.3]} rotation={[0.3, 0, 0.5]}>
        <boxGeometry args={[0.15, 0.02, 0.4]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
      <mesh position={[-0.3, 0.25, -0.2]} rotation={[-0.2, 0.8, 0.3]}>
        <boxGeometry args={[0.12, 0.02, 0.35]} />
        <meshStandardMaterial color="#3a7a33" />
      </mesh>

      {/* Sauce drizzle */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.02, 8, 32, Math.PI * 1.2]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} transparent opacity={0.7} />
      </mesh>

      {/* Selection Ring (on hover) */}
      {hovered && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.35, 1.5, 64]} />
          <meshStandardMaterial color="#D4A017" emissive="#FFD700" emissiveIntensity={0.8} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

/* ─── Floating Particles ─── */
function FloatingSpices({ count = 40 }) {
  const meshRef = useRef();
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        pos: [(Math.random() - 0.5) * 10, Math.random() * 4 - 1, (Math.random() - 0.5) * 6],
        speed: Math.random() * 0.5 + 0.2,
        size: Math.random() * 0.06 + 0.02,
      });
    }
    return arr;
  }, [count]);

  return (
    <>
      {particles.map((p, i) => (
        <Float key={i} speed={p.speed} floatIntensity={0.5} rotationIntensity={1}>
          <mesh position={p.pos}>
            <octahedronGeometry args={[p.size]} />
            <meshStandardMaterial color="#D4A017" emissive="#D4A017" emissiveIntensity={0.3} transparent opacity={0.5} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/* ─── Main Component ─── */
const dishes = [
  { name: 'Truffle Risotto', color: '#E8D5B7', desc: 'Black truffle & aged parmesan risotto' },
  { name: 'Wagyu Steak', color: '#8B4513', desc: 'A5 Wagyu with gold leaf & jus' },
  { name: 'Lobster Thermidor', color: '#FF6347', desc: 'Classic French lobster preparation' },
  { name: 'Chocolate Soufflé', color: '#3C1414', desc: 'Valrhona chocolate with crème anglaise' },
];

export default function FoodShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [selectedDish, setSelectedDish] = useState(0);

  return (
    <section className="relative py-24 overflow-hidden" id="food-showcase">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-obsidian-950" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-gold-500 font-accent text-sm tracking-[0.4em] uppercase">
            Culinary Masterpieces
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Signature <span className="text-gold-400">Creations</span>
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto" />
        </motion.div>

        {/* 3D Canvas + Info Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* 3D Scene */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-obsidian-700/30"
          >
            <Canvas camera={{ position: [0, 3, 6], fov: 45 }} dpr={[1, 2]}>
              <color attach="background" args={['#0a0a12']} />
              <ambientLight intensity={0.3} />
              <directionalLight position={[5, 8, 5]} intensity={1} color="#ffffff" />
              <pointLight position={[-3, 3, 2]} intensity={0.8} color="#D4A017" distance={15} />
              <pointLight position={[3, 3, -2]} intensity={0.5} color="#FFE4A0" distance={12} />
              <spotLight position={[0, 6, 0]} angle={0.5} penumbra={1} intensity={0.8} color="#FFD700" />
              <fog attach="fog" args={['#0a0a12', 6, 20]} />

              {dishes.map((dish, i) => {
                const angle = (i / dishes.length) * Math.PI * 2;
                const radius = 2.2;
                const x = Math.cos(angle + (selectedDish * Math.PI * 2) / dishes.length) * radius;
                const z = Math.sin(angle + (selectedDish * Math.PI * 2) / dishes.length) * radius;
                return (
                  <LuxuryPlate
                    key={i}
                    position={[x, 0, z]}
                    color={dish.color}
                    hovered={hoveredIndex === i}
                    onClick={() => setSelectedDish(i)}
                  />
                );
              })}

              <FloatingSpices count={30} />
            </Canvas>
          </motion.div>

          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {dishes.map((dish, i) => (
              <motion.div
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(-1)}
                onClick={() => setSelectedDish(i)}
                className={`p-5 rounded-xl cursor-pointer transition-all duration-300 border ${
                  selectedDish === i
                    ? 'bg-obsidian-900/80 border-gold-500/40 shadow-[0_0_30px_rgba(212,160,23,0.1)]'
                    : 'bg-obsidian-900/30 border-obsidian-700/20 hover:border-gold-500/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex-shrink-0 transition-all duration-300 ${
                      selectedDish === i ? 'shadow-[0_0_20px_rgba(212,160,23,0.3)]' : ''
                    }`}
                    style={{ backgroundColor: dish.color }}
                  />
                  <div>
                    <h3
                      className={`font-display text-lg font-semibold transition-colors ${
                        selectedDish === i ? 'text-gold-400' : 'text-white'
                      }`}
                    >
                      {dish.name}
                    </h3>
                    <p className="text-platinum-400 text-sm">{dish.desc}</p>
                  </div>
                  {selectedDish === i && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-2 h-2 rounded-full bg-gold-500 shadow-[0_0_8px_rgba(212,160,23,0.6)]"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
