export default function GridFloor({ dayMode }) {
  return (
    <group>
      {/* Plano del suelo con material PBR */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color={dayMode ? '#3a5a3a' : '#030310'}
          metalness={dayMode ? 0.05 : 0.15}
          roughness={dayMode ? 0.9  : 0.75}
        />
      </mesh>

      {/* Cuadrícula de neón sobre el suelo */}
      <gridHelper
        args={[120, 60, dayMode ? '#448844' : '#00cccc', dayMode ? '#224422' : '#003333']}
        position={[0, 0.012, 0]}
      />

      {/* Plataforma central elevada */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[8, 8, 0.12, 64]} />
        <meshStandardMaterial
          color={dayMode ? '#445544' : '#060618'}
          metalness={0.6}
          roughness={0.4}
          emissive={dayMode ? '#000000' : '#001a1a'}
          emissiveIntensity={dayMode ? 0 : 0.4}
        />
      </mesh>

      {/* Borde de la plataforma emisivo */}
      <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[8, 0.08, 8, 80]} />
        <meshStandardMaterial
          color={dayMode ? '#88cc88' : '#00ffff'}
          emissive={dayMode ? '#338833' : '#00ffff'}
          emissiveIntensity={dayMode ? 0.2 : 1.2}
        />
      </mesh>
    </group>
  )
}
