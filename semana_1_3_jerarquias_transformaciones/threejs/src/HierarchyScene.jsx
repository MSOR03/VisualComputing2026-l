import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useControls, folder } from 'leva'
import * as THREE from 'three'

// Grandparent (Root/Father) - Large Cube
function Grandparent() {
  const groupRef = useRef()
  
  const grandparentControls = useControls('Grandparent (Root)', {
    position: folder({
      posX: { value: 0, min: -10, max: 10, step: 0.1, label: 'Position X' },
      posY: { value: 0, min: -10, max: 10, step: 0.1, label: 'Position Y' },
      posZ: { value: 0, min: -10, max: 10, step: 0.1, label: 'Position Z' },
    }),
    rotation: folder({
      rotX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation X (rad)' },
      rotY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Y (rad)' },
      rotZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Z (rad)' },
    }),
    scale: { value: 1, min: 0.1, max: 3, step: 0.1, label: 'Scale' },
    autoRotate: { value: false, label: 'Auto Rotate' }
  })
  
  useFrame((state, delta) => {
    if (grandparentControls.autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5
    }
  })
  
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        grandparentControls.posX,
        grandparentControls.posY,
        grandparentControls.posZ
      )
      groupRef.current.rotation.set(
        grandparentControls.rotX,
        grandparentControls.rotY,
        grandparentControls.rotZ
      )
      groupRef.current.scale.setScalar(grandparentControls.scale)
    }
  }, [grandparentControls])
  
  return (
    <group ref={groupRef}>
      {/* Grandparent visual representation - Large Red Cube */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#ff4444" />
      </mesh>
      
      {/* Local axes helper for grandparent */}
      <axesHelper args={[2.5]} />
      
      {/* Child group */}
      <Child />
    </group>
  )
}

// Child (Middle Level) - Medium Cube
function Child() {
  const groupRef = useRef()
  
  const childControls = useControls('Child (Level 1)', {
    position: folder({
      posX: { value: 3, min: -10, max: 10, step: 0.1, label: 'Position X' },
      posY: { value: 1, min: -10, max: 10, step: 0.1, label: 'Position Y' },
      posZ: { value: 0, min: -10, max: 10, step: 0.1, label: 'Position Z' },
    }),
    rotation: folder({
      rotX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation X (rad)' },
      rotY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Y (rad)' },
      rotZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Z (rad)' },
    }),
    scale: { value: 0.7, min: 0.1, max: 3, step: 0.1, label: 'Scale' },
    autoRotate: { value: false, label: 'Auto Rotate' }
  })
  
  useFrame((state, delta) => {
    if (childControls.autoRotate && groupRef.current) {
      groupRef.current.rotation.z += delta * 0.8
    }
  })
  
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        childControls.posX,
        childControls.posY,
        childControls.posZ
      )
      groupRef.current.rotation.set(
        childControls.rotX,
        childControls.rotY,
        childControls.rotZ
      )
      groupRef.current.scale.setScalar(childControls.scale)
    }
  }, [childControls])
  
  return (
    <group ref={groupRef}>
      {/* Child visual representation - Medium Green Cube */}
      <mesh>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#44ff44" />
      </mesh>
      
      {/* Local axes helper for child */}
      <axesHelper args={[1.8]} />
      
      {/* Grandchild group */}
      <Grandchild />
    </group>
  )
}

// Grandchild (Third Level) - Small Sphere
function Grandchild() {
  const groupRef = useRef()
  
  const grandchildControls = useControls('Grandchild (Level 2)', {
    position: folder({
      posX: { value: 2, min: -10, max: 10, step: 0.1, label: 'Position X' },
      posY: { value: 0.5, min: -10, max: 10, step: 0.1, label: 'Position Y' },
      posZ: { value: 0, min: -10, max: 10, step: 0.1, label: 'Position Z' },
    }),
    rotation: folder({
      rotX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation X (rad)' },
      rotY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Y (rad)' },
      rotZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Z (rad)' },
    }),
    scale: { value: 0.5, min: 0.1, max: 3, step: 0.1, label: 'Scale' },
    autoRotate: { value: false, label: 'Auto Rotate' }
  })
  
  useFrame((state, delta) => {
    if (grandchildControls.autoRotate && groupRef.current) {
      groupRef.current.rotation.x += delta * 1.2
    }
  })
  
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        grandchildControls.posX,
        grandchildControls.posY,
        grandchildControls.posZ
      )
      groupRef.current.rotation.set(
        grandchildControls.rotX,
        grandchildControls.rotY,
        grandchildControls.rotZ
      )
      groupRef.current.scale.setScalar(grandchildControls.scale)
    }
  }, [grandchildControls])
  
  return (
    <group ref={groupRef}>
      {/* Grandchild visual representation - Small Blue Sphere */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#4444ff" />
      </mesh>
      
      {/* Local axes helper for grandchild */}
      <axesHelper args={[1]} />
    </group>
  )
}

// Main Scene Component
function HierarchyScene() {
  const sceneControls = useControls('Scene', {
    showGrid: { value: true, label: 'Show Grid' },
    backgroundColor: { value: '#1a1a2e', label: 'Background Color' }
  })
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [10, 8, 10], fov: 50 }}
        style={{ background: sceneControls.backgroundColor }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Grid Helper */}
        {sceneControls.showGrid && (
          <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6b6b6b"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9d9d9d"
            fadeDistance={50}
            fadeStrength={1}
            infiniteGrid
          />
        )}
        
        {/* World axes */}
        <axesHelper args={[5]} />
        
        {/* Hierarchy */}
        <Grandparent />
        
        {/* Camera Controls */}
        <OrbitControls makeDefault />
      </Canvas>
      
      {/* Instructions Overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
        maxWidth: '260px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>🎯 Hierarchical Transformations</h3>
        <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
          <strong>Structure:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li><span style={{ color: '#ff4444' }}>■</span> Red Cube: Grandparent (Root)</li>
            <li><span style={{ color: '#44ff44' }}>■</span> Green Cube: Child</li>
            <li><span style={{ color: '#4444ff' }}>■</span> Blue Sphere: Grandchild</li>
          </ul>
          <strong>Instructions:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Use the controls panel (top-right) to manipulate each object</li>
            <li>Parent transformations affect all children</li>
            <li>Try rotating the Grandparent to see the chain effect</li>
            <li>Enable "Auto Rotate" for each level</li>
            <li>Axes show local coordinate systems</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HierarchyScene
