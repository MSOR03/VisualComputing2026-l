import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import Scene from './components/Scene'
import UIPanel from './components/UIPanel'

export default function App() {
  const [dayMode, setDayMode]       = useState(false)
  const [gridVisible, setGridVisible] = useState(true)
  const [animPaused, setAnimPaused] = useState(false)

  // Teclado: D = día/noche | G = grid | P = pausar
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase()
      if (k === 'd') setDayMode(v => !v)
      if (k === 'g') setGridVisible(v => !v)
      if (k === 'p') setAnimPaused(v => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [0, 28, 50], fov: 58 }}
        gl={{ antialias: true }}
      >
        {/* Niebla atmosférica */}
        <fog attach="fog" args={[dayMode ? '#c8d8f0' : '#050510', 55, 160]} />

        {/* Estrellas (solo de noche) */}
        {!dayMode && (
          <Stars radius={110} depth={60} count={4500} factor={4} saturation={0} fade />
        )}

        {/* Controles de cámara */}
        <OrbitControls
          maxPolarAngle={Math.PI / 2.08}
          minDistance={8}
          maxDistance={110}
          enablePan={true}
        />

        <Scene dayMode={dayMode} gridVisible={gridVisible} animPaused={animPaused} />
      </Canvas>

      <UIPanel
        dayMode={dayMode}       onDayToggle={() => setDayMode(v => !v)}
        gridVisible={gridVisible} onGridToggle={() => setGridVisible(v => !v)}
        animPaused={animPaused} onAnimToggle={() => setAnimPaused(v => !v)}
      />
    </div>
  )
}
