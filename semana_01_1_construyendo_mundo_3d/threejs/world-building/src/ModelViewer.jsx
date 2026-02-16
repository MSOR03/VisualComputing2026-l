import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function Model({ visualizationMode }) {
  const { scene } = useGLTF('/media/kratos/scene.gltf');
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    // Calculate model information
    let totalVertices = 0;
    let totalFaces = 0;
    let totalEdges = 0;
    let meshCount = 0;

    scene.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
        const geometry = child.geometry;
        
        if (geometry.attributes.position) {
          totalVertices += geometry.attributes.position.count;
        }
        
        if (geometry.index) {
          totalFaces += geometry.index.count / 3;
          totalEdges += geometry.index.count / 2;
        } else if (geometry.attributes.position) {
          totalFaces += geometry.attributes.position.count / 3;
          totalEdges += geometry.attributes.position.count * 1.5;
        }
      }
    });

    setModelInfo({
      meshCount,
      vertices: totalVertices,
      faces: Math.floor(totalFaces),
      edges: Math.floor(totalEdges),
    });
  }, [scene]);

  // Clone the scene for manipulation
  const modelClone = scene.clone();

  // Apply visualization mode
  modelClone.traverse((child) => {
    if (child.isMesh) {
      const originalMaterial = child.material;

      switch (visualizationMode) {
        case 'faces':
          // Show solid faces with standard material
          child.material = originalMaterial;
          child.material.wireframe = false;
          break;

        case 'wireframe':
          // Show wireframe representation
          if (Array.isArray(child.material)) {
            child.material = child.material.map(mat => {
              const newMat = mat.clone();
              newMat.wireframe = true;
              newMat.color = new THREE.Color(0x00ff00);
              return newMat;
            });
          } else {
            child.material = originalMaterial.clone();
            child.material.wireframe = true;
            child.material.color = new THREE.Color(0x00ff00);
          }
          break;

        case 'vertices': {
          // Replace mesh with points geometry
          const pointsGeometry = new THREE.BufferGeometry().copy(child.geometry);
          const pointsMaterial = new THREE.PointsMaterial({
            color: 0xff0000,
            size: 0.05,
            sizeAttenuation: true,
          });
          const points = new THREE.Points(pointsGeometry, pointsMaterial);
          points.position.copy(child.position);
          points.rotation.copy(child.rotation);
          points.scale.copy(child.scale);
          
          // Replace the mesh with points in the parent
          if (child.parent) {
            child.parent.add(points);
            child.visible = false;
          }
          break;
        }

        case 'edges': {
          // Show edges using EdgesGeometry
          const edges = new THREE.EdgesGeometry(child.geometry, 15);
          const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x0000ff,
            linewidth: 2
          });
          const lineSegments = new THREE.LineSegments(edges, lineMaterial);
          lineSegments.position.copy(child.position);
          lineSegments.rotation.copy(child.rotation);
          lineSegments.scale.copy(child.scale);
          
          if (child.parent) {
            child.parent.add(lineSegments);
            child.visible = false;
          }
          break;
        }

        default:
          break;
      }
    }
  });

  return (
    <>
      <primitive object={modelClone} />
      {modelInfo && (
        <ModelInfo info={modelInfo} />
      )}
    </>
  );
}

function ModelInfo({ info }) {
  // This component passes info to parent via global state
  // We'll handle the display in the UI component
  useEffect(() => {
    window.modelInfo = info;
  }, [info]);

  return null;
}

function ModelViewer() {
  const [visualizationMode, setVisualizationMode] = useState('faces');
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    // Poll for model info
    const interval = setInterval(() => {
      if (window.modelInfo) {
        setModelInfo(window.modelInfo);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#1a1a1a' }}>
      {/* Canvas for 3D rendering */}
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Model visualizationMode={visualizationMode} />
        
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={20}
        />
        
        <gridHelper args={[10, 10]} />
        <axesHelper args={[5]} />
      </Canvas>

      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '20px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'monospace',
        minWidth: '250px',
        backdropFilter: 'blur(10px)',
      }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', borderBottom: '2px solid #4a9eff', paddingBottom: '10px' }}>
          Kratos Model Viewer
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4a9eff' }}>
            Visualization Mode
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setVisualizationMode('faces')}
              style={{
                padding: '10px',
                background: visualizationMode === 'faces' ? '#4a9eff' : '#333',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.3s',
              }}
            >
              🎭 Faces (Solid)
            </button>
            <button
              onClick={() => setVisualizationMode('wireframe')}
              style={{
                padding: '10px',
                background: visualizationMode === 'wireframe' ? '#4a9eff' : '#333',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.3s',
              }}
            >
              🕸️ Wireframe
            </button>
            <button
              onClick={() => setVisualizationMode('edges')}
              style={{
                padding: '10px',
                background: visualizationMode === 'edges' ? '#4a9eff' : '#333',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.3s',
              }}
            >
              📐 Edges
            </button>
            <button
              onClick={() => setVisualizationMode('vertices')}
              style={{
                padding: '10px',
                background: visualizationMode === 'vertices' ? '#4a9eff' : '#333',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.3s',
              }}
            >
              ⚫ Vertices (Points)
            </button>
          </div>
        </div>

        {modelInfo && (
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #444' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4a9eff' }}>
              Model Information
            </h3>
            <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#aaa' }}>Meshes:</span>
                <span style={{ fontWeight: 'bold' }}>{modelInfo.meshCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#aaa' }}>Vertices:</span>
                <span style={{ fontWeight: 'bold', color: '#ff6b6b' }}>{modelInfo.vertices.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#aaa' }}>Edges:</span>
                <span style={{ fontWeight: 'bold', color: '#4a9eff' }}>{modelInfo.edges.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Faces:</span>
                <span style={{ fontWeight: 'bold', color: '#51cf66' }}>{modelInfo.faces.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '20px', 
          paddingTop: '15px', 
          borderTop: '1px solid #444',
          fontSize: '11px',
          color: '#666',
          lineHeight: '1.6'
        }}>
          <div>💡 Use mouse to orbit</div>
          <div>🔍 Scroll to zoom</div>
          <div>✋ Right-click to pan</div>
        </div>
      </div>
    </div>
  );
}

// Preload the model
useGLTF.preload('/media/kratos/scene.gltf');

export default ModelViewer;
