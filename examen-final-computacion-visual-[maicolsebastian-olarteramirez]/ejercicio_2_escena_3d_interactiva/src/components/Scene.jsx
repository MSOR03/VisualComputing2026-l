import Building  from './Building'
import Drone     from './Drone'
import GridFloor from './GridFloor'
import CityCore  from './CityCore'

// Ciudad: cada edificio tiene posición [x,z], altura, ancho, profundidad y color base
const BUILDINGS = [
  // Anillo interior
  { x: -13, z: -9,  h: 26, w: 4.5, d: 4.5, color: '#0a1525' },
  { x:  11, z: -11, h: 18, w:   3, d:   3, color: '#0d1a28' },
  { x:  13, z:   9, h: 22, w:   4, d:   4, color: '#121f32' },
  { x: -11, z:  11, h: 15, w:   3, d:   3, color: '#0a1828' },
  // Anillo medio
  { x:  -6, z: -20, h: 30, w:   5, d:   5, color: '#0c1520' },
  { x:  19, z:  -7, h: 24, w:   4, d:   4, color: '#0e1c2f' },
  { x:   7, z:  20, h: 20, w: 4.5, d: 4.5, color: '#111f30' },
  { x: -19, z:   9, h: 28, w:   5, d:   5, color: '#0a1c2e' },
  // Anillo exterior
  { x: -26, z: -11, h: 13, w:   3, d:   3, color: '#0d1a24' },
  { x:  24, z:  17, h: 11, w:   3, d:   3, color: '#111c28' },
  { x:  16, z: -24, h: 16, w: 3.5, d: 3.5, color: '#0e1825' },
  { x: -22, z:  22, h: 12, w:   3, d:   3, color: '#0c1820' },
  // Rellenos pequeños
  { x:   4, z: -11, h:  9, w:   2, d:   2, color: '#0e1825' },
  { x:  -4, z:   7, h:  7, w:   2, d:   2, color: '#121e30' },
  { x:  -8, z: -14, h: 10, w: 2.5, d: 2.5, color: '#101c28' },
]

export default function Scene({ dayMode, gridVisible, animPaused }) {
  const nightIntensity = dayMode ? 0 : 1

  return (
    <>
      {/* ── Iluminación ───────────────────────────────────────────────────── */}
      <ambientLight
        intensity={dayMode ? 1.8 : 0.08}
        color={dayMode ? '#ffffff' : '#0a0a30'}
      />
      <directionalLight
        castShadow
        position={dayMode ? [60, 120, 60] : [25, 50, 25]}
        intensity={dayMode ? 2.2 : 0.25}
        color={dayMode ? '#fff5e0' : '#3355aa'}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      {/* Luces de neón de la ciudad */}
      <pointLight position={[-16, 18, 0]}  intensity={nightIntensity * 2.5} color="#00ffff" distance={50} />
      <pointLight position={[ 16, 12, 6]}  intensity={nightIntensity * 2.5} color="#ff00ff" distance={50} />
      <pointLight position={[  0,  9, 20]} intensity={nightIntensity * 2}   color="#8800ff" distance={45} />
      <pointLight position={[-10, 6, -15]} intensity={nightIntensity * 1.5} color="#0088ff" distance={40} />

      {/* ── Suelo con cuadrícula ──────────────────────────────────────────── */}
      {gridVisible && <GridFloor dayMode={dayMode} />}

      {/* ── Edificios ─────────────────────────────────────────────────────── */}
      {BUILDINGS.map((b, i) => (
        <Building key={i} {...b} index={i} animPaused={animPaused} />
      ))}

      {/* ── Drones (jerarquía: grupo órbita → cuerpo → brazos → rotores) ─── */}
      <Drone
        orbitRadius={15} orbitSpeed={0.28}  height={13} size={1.5}
        color="#00ffff"  animPaused={animPaused} initialAngle={0}
      />
      <Drone
        orbitRadius={22} orbitSpeed={-0.17} height={8}  size={1.0}
        color="#ff00ff"  animPaused={animPaused} initialAngle={Math.PI / 2}
      />
      <Drone
        orbitRadius={10} orbitSpeed={0.55}  height={19} size={0.7}
        color="#aa44ff"  animPaused={animPaused} initialAngle={Math.PI}
      />

      {/* ── Core holográfico central ──────────────────────────────────────── */}
      <CityCore animPaused={animPaused} dayMode={dayMode} />
    </>
  )
}
