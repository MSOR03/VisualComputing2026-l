/**
 * Jerarquía visual del dron (4 niveles):
 *
 *  groupRef  (nivel 0 – órbita + bob vertical)
 *  ├─ cuerpo central          (nivel 1 – PBR metalness, glow principal)
 *  ├─ anillo de estado        (nivel 1 – pulsa cuando activo)
 *  ├─ indicador LED superior  (nivel 1 – estrobo blanco/rojo)
 *  ├─ domo de cámara inferior (nivel 1 – cristal oscuro)
 *  └─ Arm × 4                 (nivel 2)
 *      ├─ varilla del brazo
 *      ├─ tira LED
 *      ├─ luz de navegación (parpadea)
 *      └─ group motor        (nivel 3)
 *          ├─ carcasa motor
 *          ├─ Rotor           (nivel 4)
 *          │   ├─ pala A
 *          │   └─ pala B
 *          └─ aro de seguridad emisivo
 *
 * Animaciones:
 *  - activeLevelRef (0→1): sube rápido (lerp δ×3.5), baja rápido → brillo cuerpo y anillo
 *  - rpmRef en Rotor       : lerp δ×1.2 más lento → las aspas se frenan DESPUÉS del brillo
 *  - flashRef              : pulso de 1 frame al hacer clic
 *  - Órbita inactiva       : 15% de la velocidad nominal (no se detiene completamente)
 */

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Nivel 3-4: Rotor ──────────────────────────────────────────────────────────
function Rotor({ activeLevelRef, color }) {
  const bladesRef  = useRef()
  const ringMatRef = useRef()
  const rpmRef     = useRef(22)

  useFrame((_, delta) => {
    const a      = activeLevelRef.current
    const target = a * 22
    // Las aspas se frenan MÁS LENTO que el brillo del cuerpo (rate 1.2 vs 3.5)
    rpmRef.current = THREE.MathUtils.lerp(rpmRef.current, target, delta * 1.2)

    if (bladesRef.current)  bladesRef.current.rotation.y  += delta * rpmRef.current
    if (ringMatRef.current) ringMatRef.current.emissiveIntensity = 0.12 + a * 0.78
  })

  return (
    <group>
      {/* Carcasa del motor (nivel 3) */}
      <mesh>
        <cylinderGeometry args={[0.13, 0.13, 0.17, 10]} />
        <meshStandardMaterial color="#232333" metalness={0.93} roughness={0.1} />
      </mesh>

      {/* Aspas – giran en torno a Y (nivel 4) */}
      <group ref={bladesRef} position={[0, 0.11, 0]}>
        <mesh>
          <boxGeometry args={[1.12, 0.024, 0.10]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.07} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.12, 0.024, 0.10]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.07} />
        </mesh>
      </group>

      {/* Aro de seguridad (nivel 3, brilla con activeLevelRef) */}
      <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.60, 0.042, 8, 36]} />
        <meshStandardMaterial ref={ringMatRef} color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

// ── Nivel 2: Brazo ────────────────────────────────────────────────────────────
function Arm({ endX, endZ, activeLevelRef, droneColor, navColor, blinkPhase }) {
  const ledMatRef = useRef()
  const navMatRef = useRef()
  const atan = Math.atan2(endZ, endX)
  const len  = Math.sqrt(endX * endX + endZ * endZ) * 1.1

  useFrame((state) => {
    const a = activeLevelRef.current
    if (ledMatRef.current) ledMatRef.current.emissiveIntensity = a * 0.48

    // Luz de navegación: parpadea a 5 Hz con fase propia por brazo
    if (navMatRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 5 + blinkPhase) > 0.15 ? 1 : 0
      navMatRef.current.emissiveIntensity = a * blink * 1.9
    }
  })

  return (
    <group>
      {/* Varilla del brazo (nivel 2) */}
      <mesh position={[endX / 2, 0, endZ / 2]} rotation={[0, -atan, 0]}>
        <boxGeometry args={[len, 0.074, 0.092]} />
        <meshStandardMaterial color="#383848" metalness={0.92} roughness={0.18} />
      </mesh>

      {/* Tira LED sobre el brazo */}
      <mesh position={[endX / 2, 0.048, endZ / 2]} rotation={[0, -atan, 0]}>
        <boxGeometry args={[len * 0.80, 0.018, 0.026]} />
        <meshStandardMaterial ref={ledMatRef} color={droneColor} emissive={droneColor} emissiveIntensity={0.45} />
      </mesh>

      {/* Luz de navegación en la punta del brazo */}
      <mesh position={[endX * 0.84, 0.13, endZ * 0.84]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial ref={navMatRef} color={navColor} emissive={navColor} emissiveIntensity={1.8} />
      </mesh>

      {/* Motor + Rotor al final del brazo (niveles 3-4) */}
      <group position={[endX, 0, endZ]}>
        <Rotor activeLevelRef={activeLevelRef} color={droneColor} />
      </group>
    </group>
  )
}

// ── Nivel 1: Dron completo ────────────────────────────────────────────────────
export default function Drone({
  orbitRadius  = 12,
  orbitSpeed   = 0.3,
  height       = 10,
  size         = 1,
  color        = '#00ffff',
  animPaused   = false,
  initialAngle = 0,
}) {
  const groupRef     = useRef()
  const bodyMatRef   = useRef()
  const statusMatRef = useRef()
  const topMatRef    = useRef()
  const lightRef     = useRef()
  const angle        = useRef(initialAngle)

  // Valor 0-1 que se interpola suavemente; lo leen todos los hijos por referencia
  const activeLevelRef = useRef(1)
  // Flash momentáneo al hacer clic
  const flashRef = useRef(0)

  const [active, setActive] = useState(true)

  // 4 brazos: rojo izquierda, verde derecha (convención náutica port/starboard)
  const ARMS = [
    { x:  0.90, z:  0.90, nav: '#ff3333', phase: 0 },
    { x: -0.90, z:  0.90, nav: '#33ff88', phase: Math.PI },
    { x:  0.90, z: -0.90, nav: '#ff3333', phase: Math.PI / 2 },
    { x: -0.90, z: -0.90, nav: '#33ff88', phase: 3 * Math.PI / 2 },
  ]

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // ── Transición suave del nivel de actividad ───────────────────────────
    activeLevelRef.current = THREE.MathUtils.lerp(
      activeLevelRef.current, active ? 1 : 0, delta * 3.5
    )
    const a = activeLevelRef.current

    // Flash decae rápido (rate 5)
    if (flashRef.current > 0) flashRef.current = Math.max(0, flashRef.current - delta * 5)
    const f = flashRef.current

    // ── Materiales del nivel 1 ────────────────────────────────────────────
    if (bodyMatRef.current) {
      bodyMatRef.current.emissiveIntensity = a * 0.65 + f * 2.0
    }
    if (statusMatRef.current) {
      // Pulsa lentamente cuando activo, apagado cuando inactivo
      const pulse = active ? 0.50 + 0.50 * Math.sin(state.clock.elapsedTime * 2.8) : 0
      statusMatRef.current.emissiveIntensity = a * pulse + f * 1.4
    }
    if (topMatRef.current) {
      // Estrobo rápido blanco = activo; rojo fijo = inactivo
      const strobe = active && Math.sin(state.clock.elapsedTime * 9) > 0.25
      topMatRef.current.emissiveIntensity = strobe ? 2.2 : (a * 0.35 + f)
      topMatRef.current.color.setStyle(active || a > 0.5 ? '#ffffff' : '#ff2200')
      topMatRef.current.emissive.setStyle(active || a > 0.5 ? '#ffffff' : '#ff2200')
    }
    if (lightRef.current) {
      lightRef.current.intensity = a * 2.2 + f * 3.5
    }

    if (animPaused) return

    // ── Órbita ────────────────────────────────────────────────────────────
    // Inactivo → 15% de velocidad (sigue moviendose pero más despacio)
    const speedMul = 0.15 + a * 0.85
    angle.current += delta * orbitSpeed * speedMul

    const x   = Math.cos(angle.current) * orbitRadius
    const z   = Math.sin(angle.current) * orbitRadius
    const bob = height + Math.sin(state.clock.elapsedTime * 1.6 + initialAngle) * (0.12 + a * 0.32)

    groupRef.current.position.set(x, bob, z)
    // El dron siempre apunta en la dirección de movimiento
    groupRef.current.rotation.y = -angle.current + Math.PI / 2
  })

  const handleClick = (e) => {
    e.stopPropagation()
    setActive(v => !v)
    flashRef.current = 1  // dispara el pulso visual
  }

  return (
    <group
      ref={groupRef}
      position={[orbitRadius, height, 0]}
      scale={size}
      onClick={handleClick}
      onPointerEnter={() => (document.body.style.cursor = 'pointer')}
      onPointerLeave={() => (document.body.style.cursor = 'auto')}
    >
      {/* ── Nivel 1: cuerpo central ─────────────────────────────────────── */}
      <mesh castShadow>
        <boxGeometry args={[0.70, 0.32, 0.70]} />
        <meshStandardMaterial
          ref={bodyMatRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.65}
          metalness={0.82}
          roughness={0.18}
        />
      </mesh>

      {/* Anillo de estado (nivel 1) – pulsa mientras el dron esté activo */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.60, 0.058, 8, 52]} />
        <meshStandardMaterial
          ref={statusMatRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Indicador LED superior (nivel 1) */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.078, 10, 10]} />
        <meshStandardMaterial ref={topMatRef} color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} />
      </mesh>

      {/* Domo de cámara inferior (nivel 1) */}
      <mesh position={[0, -0.26, 0]}>
        <sphereGeometry args={[0.21, 14, 14]} />
        <meshStandardMaterial
          color="#111122"
          metalness={0.93}
          roughness={0.06}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* ── Niveles 2-4: brazos con tiras LED, motores y rotores ─────────── */}
      {ARMS.map((arm, i) => (
        <Arm
          key={i}
          endX={arm.x}
          endZ={arm.z}
          activeLevelRef={activeLevelRef}
          droneColor={color}
          navColor={arm.nav}
          blinkPhase={arm.phase}
        />
      ))}

      {/* Luz puntual ventral (nivel 1) */}
      <pointLight ref={lightRef} position={[0, -0.42, 0]} intensity={2.2} color={color} distance={10} />
    </group>
  )
}
