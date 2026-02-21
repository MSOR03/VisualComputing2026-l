import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Box, Sphere } from '@react-three/drei'
import { useControls, folder } from 'leva'
import * as THREE from 'three'

// Animated 3D Object with Transformations
function AnimatedObject() {
  const meshRef = useRef()
  const matrixRef = useRef({
    translation: new THREE.Matrix4(),
    rotation: new THREE.Matrix4(),
    scale: new THREE.Matrix4(),
    combined: new THREE.Matrix4()
  })
  
  const controls = useControls('Transformations', {
    trajectory: folder({
      trajectoryType: {
        value: 'circular',
        options: ['circular', 'sinusoidal', 'lemniscate', 'none'],
        label: 'Trajectory Type'
      },
      radius: { value: 3, min: 0, max: 5, step: 0.1, label: 'Radius' },
      speed: { value: 1, min: 0, max: 5, step: 0.1, label: 'Speed' }
    }),
    rotation: folder({
      rotateX: { value: true, label: 'Rotate X-axis' },
      rotateY: { value: true, label: 'Rotate Y-axis' },
      rotateZ: { value: false, label: 'Rotate Z-axis' },
      rotationSpeed: { value: 1, min: 0, max: 5, step: 0.1, label: 'Rotation Speed' }
    }),
    scale: folder({
      enablePulse: { value: true, label: 'Enable Pulsing Scale' },
      baseScale: { value: 1, min: 0.1, max: 2, step: 0.1, label: 'Base Scale' },
      pulseAmplitude: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Pulse Amplitude' },
      pulseFrequency: { value: 2, min: 0.1, max: 5, step: 0.1, label: 'Pulse Frequency' }
    }),
    object: folder({
      objectType: {
        value: 'sphere',
        options: ['sphere', 'cube'],
        label: 'Object Type'
      },
      color: { value: '#3b82f6', label: 'Color' },
      wireframe: { value: false, label: 'Wireframe' }
    }),
    showMatrices: { value: true, label: 'Show Matrices (Console)' }
  })
  
  // Format matrix for console display
  const formatMatrix = (matrix) => {
    const m = matrix.elements
    return `
    [${m[0].toFixed(3)}, ${m[4].toFixed(3)}, ${m[8].toFixed(3)}, ${m[12].toFixed(3)}]
    [${m[1].toFixed(3)}, ${m[5].toFixed(3)}, ${m[9].toFixed(3)}, ${m[13].toFixed(3)}]
    [${m[2].toFixed(3)}, ${m[6].toFixed(3)}, ${m[10].toFixed(3)}, ${m[14].toFixed(3)}]
    [${m[3].toFixed(3)}, ${m[7].toFixed(3)}, ${m[11].toFixed(3)}, ${m[15].toFixed(3)}]`
  }
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    const time = state.clock.elapsedTime * controls.speed
    
    // === TRANSLATION ===
    let x = 0, y = 0, z = 0
    
    switch (controls.trajectoryType) {
      case 'circular':
        x = controls.radius * Math.cos(time)
        z = controls.radius * Math.sin(time)
        y = 0
        break
      case 'sinusoidal':
        x = time % (controls.radius * 2) - controls.radius
        y = controls.radius * Math.sin(time * 2)
        z = 0
        break
      case 'lemniscate': {
        // Lemniscate (figure-8)
        const scale = controls.radius / (1 + Math.sin(time) ** 2)
        x = scale * Math.cos(time)
        z = scale * Math.sin(time) * Math.cos(time)
        y = 0
        break
      }
      case 'none':
        x = 0
        y = 0
        z = 0
        break
    }
    
    meshRef.current.position.set(x, y, z)
    
    // Store translation matrix
    matrixRef.current.translation.makeTranslation(x, y, z)
    
    // === ROTATION ===
    const rotSpeed = controls.rotationSpeed * delta
    
    if (controls.rotateX) {
      meshRef.current.rotation.x += rotSpeed
    }
    if (controls.rotateY) {
      meshRef.current.rotation.y += rotSpeed
    }
    if (controls.rotateZ) {
      meshRef.current.rotation.z += rotSpeed
    }
    
    // Store rotation matrix
    matrixRef.current.rotation.makeRotationFromEuler(meshRef.current.rotation)
    
    // === SCALE ===
    let scaleValue = controls.baseScale
    
    if (controls.enablePulse) {
      scaleValue += Math.sin(state.clock.elapsedTime * controls.pulseFrequency) * controls.pulseAmplitude
      scaleValue = Math.max(0.1, scaleValue) // Prevent negative scale
    }
    
    meshRef.current.scale.setScalar(scaleValue)
    
    // Store scale matrix
    matrixRef.current.scale.makeScale(scaleValue, scaleValue, scaleValue)
    
    // === COMBINED MATRIX ===
    matrixRef.current.combined.identity()
    matrixRef.current.combined.multiply(matrixRef.current.translation)
    matrixRef.current.combined.multiply(matrixRef.current.rotation)
    matrixRef.current.combined.multiply(matrixRef.current.scale)
    
    // Log matrices periodically
    if (controls.showMatrices && state.clock.elapsedTime % 2 < delta * 2) {
      console.clear()
      console.log('=== TRANSFORMATION MATRICES ===')
      console.log('Time:', state.clock.elapsedTime.toFixed(2), 's')
      console.log('\n📍 Translation Matrix:')
      console.log(formatMatrix(matrixRef.current.translation))
      console.log('\n🔄 Rotation Matrix:')
      console.log(formatMatrix(matrixRef.current.rotation))
      console.log('\n📏 Scale Matrix:')
      console.log(formatMatrix(matrixRef.current.scale))
      console.log('\n🎯 Combined Matrix (T × R × S):')
      console.log(formatMatrix(matrixRef.current.combined))
      console.log('\n💡 Position:', { x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) })
      console.log('💡 Rotation:', {
        x: (meshRef.current.rotation.x % (2 * Math.PI)).toFixed(2),
        y: (meshRef.current.rotation.y % (2 * Math.PI)).toFixed(2),
        z: (meshRef.current.rotation.z % (2 * Math.PI)).toFixed(2)
      })
      console.log('💡 Scale:', scaleValue.toFixed(2))
    }
  })
  
  return (
    <mesh ref={meshRef}>
      {controls.objectType === 'sphere' ? (
        <sphereGeometry args={[1, 32, 32]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
      <meshStandardMaterial 
        color={controls.color} 
        wireframe={controls.wireframe}
      />
    </mesh>
  )
}

// Trail effect to visualize path
function Trail({ trajectoryType, radius }) {
  const points = []
  const segments = 200
  
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2
    let x, y, z
    
    switch (trajectoryType) {
      case 'circular':
        x = radius * Math.cos(t)
        z = radius * Math.sin(t)
        y = 0
        break
      case 'sinusoidal':
        x = (t / (Math.PI * 2)) * (radius * 2) - radius
        y = radius * Math.sin(t * 2)
        z = 0
        break
      case 'lemniscate': {
        const scale = radius / (1 + Math.sin(t) ** 2)
        x = scale * Math.cos(t)
        z = scale * Math.sin(t) * Math.cos(t)
        y = 0
        break
      }
      default:
        return null
    }
    
    points.push(new THREE.Vector3(x, y, z))
  }
  
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
  
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#666666" opacity={0.4} transparent />
    </line>
  )
}

// Main Scene Component
function TransformationScene() {
  const sceneControls = useControls('Scene', {
    showGrid: { value: true, label: 'Show Grid' },
    showAxes: { value: true, label: 'Show World Axes' },
    backgroundColor: { value: '#0f172a', label: 'Background Color' }
  })
  
  const trajectoryControls = useControls('Transformations', {
    trajectory: folder({
      trajectoryType: { value: 'circular' },
      radius: { value: 3 },
      speed: { value: 1 }
    })
  })
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [8, 6, 8], fov: 50 }}
        style={{ background: sceneControls.backgroundColor }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4444ff" />
        <pointLight position={[10, -10, 5]} intensity={0.5} color="#ff4444" />
        
        {/* Grid */}
        {sceneControls.showGrid && (
          <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#374151"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#4b5563"
            fadeDistance={50}
            fadeStrength={1}
            infiniteGrid
          />
        )}
        
        {/* World axes */}
        {sceneControls.showAxes && <axesHelper args={[6]} />}
        
        {/* Trajectory path */}
        <Trail 
          trajectoryType={trajectoryControls.trajectoryType}
          radius={trajectoryControls.radius}
          speed={trajectoryControls.speed}
        />
        
        {/* Animated object */}
        <AnimatedObject />
        
        {/* Camera Controls */}
        <OrbitControls makeDefault />
      </Canvas>
      
      {/* Instructions Overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '5px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '10px',
        maxWidth: '260px',
        backdropFilter: 'blur(5px)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#3b82f6' }}>
          🎬 3D Transformations Demo
        </h3>
        <div style={{ fontSize: '10px', lineHeight: '1.6' }}>
          <strong>Controls (Top-Right Panel):</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li><strong>Trajectory:</strong> Movement path type</li>
            <li><strong>Rotation:</strong> Axis rotation toggles</li>
            <li><strong>Scale:</strong> Pulsing effect</li>
            <li><strong>Object:</strong> Shape & appearance</li>
          </ul>
          <strong>Features:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>🔄 Continuous rotation on own axis</li>
            <li>📍 Dynamic translation (circular/sine)</li>
            <li>📏 Smooth scaling with time</li>
            <li>🎯 Transformation matrices in console</li>
          </ul>
          <strong>Camera:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Left-click + drag: Rotate</li>
            <li>Right-click + drag: Pan</li>
            <li>Scroll: Zoom</li>
          </ul>
          <div style={{
            marginTop: '10px',
            padding: '8px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '4px',
            border: '1px solid #3b82f6'
          }}>
            💡 <strong>Tip:</strong> Open the browser console (F12) to see the transformation matrices updated in real-time!
          </div>
        </div>
      </div>
      
      {/* Matrix Info Badge */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '10px 15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '11px',
        backdropFilter: 'blur(5px)'
      }}>
        <strong>📐 Matrix Order:</strong> Combined = T × R × S
        <br />
        <span style={{ color: '#888', fontSize: '10px' }}>
          Translation → Rotation → Scale
        </span>
      </div>
    </div>
  )
}

export default TransformationScene
