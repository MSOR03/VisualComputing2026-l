import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Building({ x, z, h, w = 4, d = 4, color, index, animPaused }) {
  const groupRef = useRef()

  // Ventanas generadas de forma determinista (sin Math.random en render)
  const windows = useMemo(() => {
    const wins  = []
    const cols  = Math.max(1, Math.floor(w / 1.5))
    const floors = Math.floor(h / 2.15)

    for (let f = 1; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        // pseudo-aleatoriedad estable usando seno con semilla por edificio
        const lit = Math.sin(index * 137.5 + f * 31.3 + c * 17.7) > -0.25
        if (!lit) continue
        wins.push({
          x: (c - (cols - 1) / 2) * 1.35,
          y: f * 2.1 + 1.0,               // desde la base del grupo (y = 0)
          intensity: 0.45 + 0.55 * Math.abs(Math.sin(index * 7 + f * 3 + c)),
        })
      }
    }
    return wins
  }, [h, w, index])

  // Animación de flotación suave: cada edificio tiene fase diferente
  useFrame((state) => {
    if (animPaused || !groupRef.current) return
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.32 + index * 1.12) * 0.07
  })

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {/* Cuerpo principal – PBR metálico */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={color}
          metalness={0.72}
          roughness={0.28}
          emissive={color}
          emissiveIntensity={0.04}
        />
      </mesh>

      {/* Ventanas emisivas en la fachada frontal */}
      {windows.map((win, i) => (
        <mesh key={i} position={[win.x, win.y, d / 2 + 0.06]}>
          <planeGeometry args={[0.52, 0.72]} />
          <meshStandardMaterial
            color="#b8e8ff"
            emissive="#00ccff"
            emissiveIntensity={win.intensity}
          />
        </mesh>
      ))}

      {/* Antena */}
      <mesh position={[0, h + 0.75, 0]}>
        <cylinderGeometry args={[0.042, 0.042, 1.5, 6]} />
        <meshStandardMaterial color="#777777" metalness={0.9} roughness={0.12} />
      </mesh>

      {/* Baliza roja de aviso aéreo */}
      <mesh position={[0, h + 1.6, 0]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshStandardMaterial emissive="#ff2200" emissiveIntensity={1.4} color="#ff2200" />
      </mesh>
    </group>
  )
}
