import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Anillo holográfico animado
function HoloRing({ radius, speed, color, tilt }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed
  })
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, 0.055, 8, 72]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.9}
        transparent
        opacity={0.85}
      />
    </mesh>
  )
}

// Esfera holográfica pulsante
function CoreSphere({ dayMode }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const pulse = 0.6 + 0.4 * Math.sin(state.clock.elapsedTime * 2.1)
    ref.current.material.emissiveIntensity = dayMode ? 0.1 : pulse
    ref.current.scale.setScalar(1 + 0.05 * Math.sin(state.clock.elapsedTime * 3))
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.3, 32, 32]} />
      <meshStandardMaterial
        color="#00ffff"
        emissive="#00ffff"
        emissiveIntensity={0.8}
        transparent
        opacity={0.55}
        metalness={0.2}
        roughness={0.1}
      />
    </mesh>
  )
}

export default function CityCore({ animPaused, dayMode }) {
  return (
    <group position={[0, 6, 0]}>
      <CoreSphere dayMode={dayMode} />

      {/* 3 anillos con inclinaciones y velocidades distintas */}
      {!animPaused && (
        <>
          <HoloRing radius={3.0} speed={ 0.45} color="#00ffff" tilt={[Math.PI / 3,  0, 0]} />
          <HoloRing radius={4.0} speed={-0.30} color="#ff00ff" tilt={[0, 0, Math.PI / 4]} />
          <HoloRing radius={2.4} speed={ 0.65} color="#aa44ff" tilt={[Math.PI / 6, Math.PI / 3, 0]} />
        </>
      )}

      {/* Luz puntual central del core */}
      <pointLight
        intensity={dayMode ? 0.5 : 3.5}
        color="#00ffff"
        distance={28}
      />
    </group>
  )
}
