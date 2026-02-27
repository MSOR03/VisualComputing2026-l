import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './App.css'

const CONTROL_CONFIG = [
  { key: 'fov', label: 'FOV', min: 20, max: 120, step: 1 },
  { key: 'near', label: 'Near', min: 0.1, max: 5, step: 0.1 },
  { key: 'far', label: 'Far', min: 10, max: 60, step: 1 },
  { key: 'cameraX', label: 'Cam X', min: -10, max: 10, step: 0.1 },
  { key: 'cameraY', label: 'Cam Y', min: 1, max: 12, step: 0.1 },
  { key: 'cameraZ', label: 'Cam Z', min: -10, max: 10, step: 0.1 },
  { key: 'lookX', label: 'Look X', min: -4, max: 4, step: 0.1 },
  { key: 'lookY', label: 'Look Y', min: -2, max: 4, step: 0.1 },
  { key: 'lookZ', label: 'Look Z', min: -4, max: 4, step: 0.1 },
  { key: 'k1', label: 'k1', min: -0.8, max: 0.8, step: 0.01 },
  { key: 'k2', label: 'k2', min: -0.8, max: 0.8, step: 0.01 },
]

const INITIAL_PARAMS = {
  fov: 55,
  near: 0.3,
  far: 35,
  cameraX: 6,
  cameraY: 5,
  cameraZ: 7,
  lookX: 0,
  lookY: 1,
  lookZ: 0,
  k1: 0.15,
  k2: -0.08,
}

function projectWorldToScreen(point, camera, width, height) {
  const ndc = point.clone().project(camera)
  const x = (ndc.x * 0.5 + 0.5) * width
  const y = (-ndc.y * 0.5 + 0.5) * height
  const visible = ndc.z >= -1 && ndc.z <= 1 && Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1
  return { x, y, ndc, visible }
}

function App() {
  const mountRef = useRef(null)
  const distortionCanvasRef = useRef(null)
  const [params, setParams] = useState(INITIAL_PARAMS)
  const paramsRef = useRef(INITIAL_PARAMS)
  const [projectedPoints, setProjectedPoints] = useState([])
  const [selectedPoint, setSelectedPoint] = useState('CubeCenter')
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    paramsRef.current = params
  }, [params])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) {
      return
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const observerCamera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)
    observerCamera.position.set(13, 10, 12)
    observerCamera.lookAt(0, 0.5, 0)

    const projectionCamera = new THREE.PerspectiveCamera(paramsRef.current.fov, 1, paramsRef.current.near, paramsRef.current.far)

    const controls = new OrbitControls(observerCamera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0, 1, 0)

    const grid = new THREE.GridHelper(24, 24, 0x334155, 0x1f2937)
    const axes = new THREE.AxesHelper(3)
    scene.add(grid)
    scene.add(axes)

    const ambient = new THREE.AmbientLight(0xffffff, 0.65)
    const directional = new THREE.DirectionalLight(0xffffff, 1.1)
    directional.position.set(5, 8, 5)
    scene.add(ambient, directional)

    const objectMaterial = new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.4, metalness: 0.15 })
    const objectMaterial2 = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.1 })

    const cube = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.7, 1.7), objectMaterial)
    cube.position.set(-3, 1, -1.5)
    scene.add(cube)

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), objectMaterial2)
    sphere.position.set(2.7, 1.2, -2)
    scene.add(sphere)

    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 24), objectMaterial)
    cone.position.set(2.8, 1.1, 2.8)
    scene.add(cone)

    const torus = new THREE.Mesh(new THREE.TorusKnotGeometry(0.75, 0.25, 120, 16), objectMaterial2)
    torus.position.set(-2.4, 1.4, 2.2)
    scene.add(torus)

    const knownPoints = [
      { name: 'CubeCenter', obj: cube, local: new THREE.Vector3(0, 0, 0) },
      { name: 'CubeTop', obj: cube, local: new THREE.Vector3(0, 0.85, 0) },
      { name: 'SphereCenter', obj: sphere, local: new THREE.Vector3(0, 0, 0) },
      { name: 'ConeTip', obj: cone, local: new THREE.Vector3(0, 1.1, 0) },
      { name: 'TorusCenter', obj: torus, local: new THREE.Vector3(0, 0, 0) },
    ]

    const markerGeometry = new THREE.SphereGeometry(0.09, 12, 8)
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    knownPoints.forEach((entry) => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)
      entry.obj.add(marker)
      marker.position.copy(entry.local)
    })

    const frustumHelper = new THREE.CameraHelper(projectionCamera)
    scene.add(frustumHelper)

    const resize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      renderer.setSize(width, height)
      observerCamera.aspect = width / height
      observerCamera.updateProjectionMatrix()
      setScreenSize({ width, height })
    }

    resize()
    window.addEventListener('resize', resize)

    const worldPoint = new THREE.Vector3()
    const target = new THREE.Vector3()
    let frameCounter = 0
    let animationId = 0

    const drawDistortion = (pointsToDraw, width, height) => {
      const canvas = distortionCanvasRef.current
      if (!canvas) {
        return
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return
      }

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#020617'
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(width / 2, 0)
      ctx.lineTo(width / 2, height)
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      pointsToDraw.forEach((entry) => {
        const { ndc, visible } = entry
        if (!visible) {
          return
        }

        const x = ndc.x
        const y = ndc.y
        const r2 = x * x + y * y
        const distortionFactor = 1 + paramsRef.current.k1 * r2 + paramsRef.current.k2 * r2 * r2
        const xd = x * distortionFactor
        const yd = y * distortionFactor

        const undX = (x * 0.5 + 0.5) * width
        const undY = (-y * 0.5 + 0.5) * height
        const disX = (xd * 0.5 + 0.5) * width
        const disY = (-yd * 0.5 + 0.5) * height

        ctx.strokeStyle = '#64748b'
        ctx.beginPath()
        ctx.moveTo(undX, undY)
        ctx.lineTo(disX, disY)
        ctx.stroke()

        ctx.fillStyle = '#fbbf24'
        ctx.beginPath()
        ctx.arc(undX, undY, 3, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#22d3ee'
        ctx.beginPath()
        ctx.arc(disX, disY, 4, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      controls.update()

      const p = paramsRef.current
      projectionCamera.fov = p.fov
      projectionCamera.near = p.near
      projectionCamera.far = p.far
      projectionCamera.position.set(p.cameraX, p.cameraY, p.cameraZ)
      target.set(p.lookX, p.lookY, p.lookZ)
      projectionCamera.lookAt(target)
      projectionCamera.updateProjectionMatrix()
      projectionCamera.updateMatrixWorld()
      frustumHelper.update()

      const width = mount.clientWidth
      const height = mount.clientHeight

      const projected = knownPoints.map((entry) => {
        entry.obj.updateMatrixWorld()
        worldPoint.copy(entry.local)
        entry.obj.localToWorld(worldPoint)
        const screen = projectWorldToScreen(worldPoint, projectionCamera, width, height)
        return {
          name: entry.name,
          world: worldPoint.clone(),
          ...screen,
        }
      })

      frameCounter += 1
      if (frameCounter % 8 === 0) {
        setProjectedPoints(projected)
      }

      renderer.setScissorTest(false)
      renderer.setViewport(0, 0, width, height)
      renderer.render(scene, observerCamera)

      const insetWidth = Math.floor(width * 0.36)
      const insetHeight = Math.floor(height * 0.36)
      const insetX = width - insetWidth - 16
      const insetY = 16
      projectionCamera.aspect = insetWidth / insetHeight
      projectionCamera.updateProjectionMatrix()

      renderer.clearDepth()
      renderer.setScissorTest(true)
      renderer.setScissor(insetX, insetY, insetWidth, insetHeight)
      renderer.setViewport(insetX, insetY, insetWidth, insetHeight)
      renderer.render(scene, projectionCamera)
      renderer.setScissorTest(false)

      drawDistortion(projected, 320, 200)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      controls.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      scene.traverse((node) => {
        if (!node.isMesh) {
          return
        }
        node.geometry?.dispose?.()
        if (Array.isArray(node.material)) {
          node.material.forEach((material) => material.dispose?.())
        } else {
          node.material?.dispose?.()
        }
      })
    }
  }, [])

  const onParamChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const selectedProjection = projectedPoints.find((point) => point.name === selectedPoint)

  return (
    <div className="app-layout">
      <aside className="panel">
        <h1>Pinhole Camera Lab</h1>
        <p className="panel-text">
          Scene with known 3D objects, perspective camera controls, 3D→2D projection, frustum preview, and radial distortion simulation.
        </p>

        <div className="controls">
          {CONTROL_CONFIG.map((control) => (
            <label key={control.key} className="control-row">
              <span>{control.label}: {params[control.key].toFixed(control.step < 1 ? 2 : 1)}</span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={params[control.key]}
                onChange={(event) => onParamChange(control.key, Number(event.target.value))}
              />
            </label>
          ))}
        </div>

        <div className="projection-card">
          <h2>Projection Function</h2>
          <label className="select-row">
            <span>Point:</span>
            <select value={selectedPoint} onChange={(event) => setSelectedPoint(event.target.value)}>
              {projectedPoints.map((point) => (
                <option key={point.name} value={point.name}>{point.name}</option>
              ))}
            </select>
          </label>
          {selectedProjection && (
            <ul>
              <li>3D: ({selectedProjection.world.x.toFixed(2)}, {selectedProjection.world.y.toFixed(2)}, {selectedProjection.world.z.toFixed(2)})</li>
              <li>NDC: ({selectedProjection.ndc.x.toFixed(3)}, {selectedProjection.ndc.y.toFixed(3)}, {selectedProjection.ndc.z.toFixed(3)})</li>
              <li>2D Screen: ({selectedProjection.x.toFixed(1)}, {selectedProjection.y.toFixed(1)}) px</li>
              <li>Visible: {selectedProjection.visible ? 'Yes' : 'No'}</li>
              <li>Viewport: {screenSize.width} × {screenSize.height}</li>
            </ul>
          )}
        </div>

        <div className="distortion-card">
          <h2>Radial Distortion</h2>
          <p className="panel-text small">Yellow = ideal projection, Cyan = distorted with k1/k2.</p>
          <canvas ref={distortionCanvasRef} className="distortion-canvas" />
        </div>
      </aside>

      <main className="scene-container">
        <div ref={mountRef} className="viewport" />
        <div className="inset-label">Inset: projection camera view</div>
      </main>
    </div>
  )
}

export default App
