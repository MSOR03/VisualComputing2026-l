import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function ModelViewer() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const currentModelRef = useRef(null);
  const mountedRef = useRef(false);
  
  const [format, setFormat] = useState('stl');
  const [info, setInfo] = useState({ 
    vertices: 0, 
    faces: 0, 
    format: '', 
    fileSize: '',
    boundingBox: { x: 0, y: 0, z: 0 },
    meshCount: 0,
    hasTextures: false,
    hasMaterials: false
  });
  const [loading, setLoading] = useState(false);

  // Inicializar escena Three.js
  useEffect(() => {
    if (!containerRef.current || mountedRef.current) return;
    mountedRef.current = true;

    // Escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Cámara
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(8, 5, 15); // Movida a la derecha para evitar el panel UI
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(5, 0, 0); // Target hacia la derecha
    controls.update();
    controlsRef.current = controls;

    // Luces
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(10, 10, 10);
    scene.add(light);

    // Grid
    scene.add(new THREE.GridHelper(50, 20));

    // Animación
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountedRef.current = false;
      if (rendererRef.current && containerRef.current) {
        const canvas = rendererRef.current.domElement;
        if (canvas.parentNode === containerRef.current) {
          containerRef.current.removeChild(canvas);
        }
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, []);

  // Limpiar modelo anterior
  const clearModel = () => {
    if (currentModelRef.current) {
      sceneRef.current.remove(currentModelRef.current);
      currentModelRef.current.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      currentModelRef.current = null;
    }
  };

  // Centrar y escalar modelo
  const fitModel = (object) => {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 10 / maxDim;
    object.scale.multiplyScalar(scale);
    
    const center = box.getCenter(new THREE.Vector3()).multiplyScalar(scale);
    object.position.sub(center);
    object.position.x += 10 //Center the object
    // Retornar información del bounding box escalado
    const scaledSize = {
      x: parseFloat((size.x * scale).toFixed(2)),
      y: parseFloat((size.y * scale).toFixed(2)),
      z: parseFloat((size.z * scale).toFixed(2))
    };
    
    return { object, boundingBox: scaledSize };
  };

  // Contar geometría
  const countGeometry = (object) => {
    let vertices = 0;
    let faces = 0;
    let meshCount = 0;
    let hasTextures = false;
    let hasMaterials = false;
    
    object.traverse((child) => {
      if (child.isMesh && child.geometry) {
        meshCount++;
        vertices += child.geometry.attributes.position.count;
        if (child.geometry.index) {
          faces += child.geometry.index.count / 3;
        } else {
          faces += child.geometry.attributes.position.count / 3;
        }
        
        if (child.material) {
          hasMaterials = true;
          const mat = Array.isArray(child.material) ? child.material[0] : child.material;
          if (mat.map || mat.normalMap || mat.bumpMap) {
            hasTextures = true;
          }
        }
      }
    });
    return { vertices, faces, meshCount, hasTextures, hasMaterials };
  };

  // Cargar modelos
  useEffect(() => {
    if (!sceneRef.current || !mountedRef.current) return;
    
    setLoading(true);
    clearModel();

    if (format === 'obj') {
      const mtlLoader = new MTLLoader();
      mtlLoader.setPath('/models/');
      mtlLoader.load('Free-Scifi-Fighter.mtl', (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('/models/');
        objLoader.load('Free-Scifi-Fighter.obj', (object) => {
          if (!mountedRef.current || !sceneRef.current) return;
          const { object: model, boundingBox } = fitModel(object);
          sceneRef.current.add(model);
          currentModelRef.current = model;
          const stats = countGeometry(model);
          setInfo({ 
            ...stats, 
            format: 'OBJ + MTL',
            fileSize: '222 KB (.obj) + 1.2 KB (.mtl)',
            boundingBox,
            description: 'Formato Wavefront con materiales y texturas externas'
          });
          setLoading(false);
        });
      });
    } else if (format === 'stl') {
      const loader = new STLLoader();
      loader.load('/models/Free-Scifi-Fighter.stl', (geometry) => {
        if (!mountedRef.current || !sceneRef.current) return;
        geometry.computeVertexNormals();
        const material = new THREE.MeshPhongMaterial({ color: 0x00aaff, shininess: 100 });
        const mesh = new THREE.Mesh(geometry, material);
        const { object: model, boundingBox } = fitModel(mesh);
        sceneRef.current.add(model);
        currentModelRef.current = model;
        const stats = countGeometry(model);
        setInfo({ 
          ...stats, 
          format: 'STL',
          fileSize: '128 KB',
          boundingBox,
          description: 'Formato de estereolitografía, solo geometría (sin materiales)'
        });
        setLoading(false);
      });
    } else if (format === 'glb') {
      const loader = new GLTFLoader();
      loader.load('/models/Free-Scifi-Fighter.glb', (gltf) => {
        if (!mountedRef.current || !sceneRef.current) return;
        const { object: model, boundingBox } = fitModel(gltf.scene);
        sceneRef.current.add(model);
        currentModelRef.current = model;
        const stats = countGeometry(model);
        setInfo({ 
          ...stats, 
          format: 'GLB',
          fileSize: '531 KB',
          boundingBox,
          description: 'Formato GL Transmission (binario), incluye geometría, texturas y materiales'
        });
        setLoading(false);
      });
    }
  }, [format]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div ref={containerRef} />
      
      {/* Panel de controles principal */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,46,0.95) 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        maxWidth: '320px',
        maxHeight: 'calc(100vh - 20px)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        <h2 style={{ 
          margin: '0 0 15px 0', 
          fontSize: '20px',
          background: 'linear-gradient(135deg, #00aaff 0%, #00ffaa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '600'
        }}>
          Visor 3D
        </h2>
        
        {/* Botones de formato */}
        <div style={{ 
          marginBottom: 15, 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px'
        }}>
          <button 
            onClick={() => setFormat('obj')} 
            disabled={loading}
            style={{ 
              padding: '10px 6px', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              background: format === 'obj' 
                ? 'linear-gradient(135deg, #00aaff 0%, #0088cc 100%)' 
                : 'rgba(255,255,255,0.1)',
              color: 'white', 
              border: format === 'obj' ? '2px solid #00aaff' : '2px solid transparent',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.3s',
              opacity: loading ? 0.5 : 1
            }}
          >
            OBJ
          </button>
          <button 
            onClick={() => setFormat('stl')} 
            disabled={loading}
            style={{ 
              padding: '10px 6px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              background: format === 'stl' 
                ? 'linear-gradient(135deg, #00aaff 0%, #0088cc 100%)' 
                : 'rgba(255,255,255,0.1)',
              color: 'white', 
              border: format === 'stl' ? '2px solid #00aaff' : '2px solid transparent',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.3s',
              opacity: loading ? 0.5 : 1
            }}
          >
            STL
          </button>
          <button 
            onClick={() => setFormat('glb')} 
            disabled={loading}
            style={{ 
              padding: '10px 6px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              background: format === 'glb' 
                ? 'linear-gradient(135deg, #00aaff 0%, #0088cc 100%)' 
                : 'rgba(255,255,255,0.1)',
              color: 'white', 
              border: format === 'glb' ? '2px solid #00aaff' : '2px solid transparent',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.3s',
              opacity: loading ? 0.5 : 1
            }}
          >
            GLB
          </button>
        </div>

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '15px',
            background: 'rgba(0,170,255,0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(0,170,255,0.3)'
          }}>
            <div style={{ 
              display: 'inline-block',
              width: '20px',
              height: '20px',
              border: '3px solid rgba(0,170,255,0.3)',
              borderTop: '3px solid #00aaff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ margin: '10px 0 0 0' }}>Cargando modelo...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
          </div>
        )}
        
        {!loading && info.format && (
          <div>
            {/* Información básica */}
            <div style={{ 
              background: 'rgba(0,170,255,0.1)', 
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid rgba(0,170,255,0.3)'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '6px',
                color: '#00aaff'
              }}>
                📄 {info.format}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8, lineHeight: '1.5' }}>
                {info.description}
              </div>
            </div>

            {/* Estadísticas del modelo */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.05)',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '3px' }}>VÉRTICES</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#00ffaa' }}>
                  {info.vertices.toLocaleString()}
                </div>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.05)',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '3px' }}>CARAS</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#00ffaa' }}>
                  {Math.floor(info.faces).toLocaleString()}
                </div>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.05)',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '3px' }}>MESHES</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#00ffaa' }}>
                  {info.meshCount}
                </div>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.05)',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '3px' }}>TAMAÑO</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#00ffaa' }}>
                  {info.fileSize}
                </div>
              </div>
            </div>

            {/* Bounding Box */}
            <div style={{ 
              background: 'rgba(255,255,255,0.05)',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '6px' }}>DIMENSIONES</div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '6px',
                fontSize: '12px'
              }}>
                <div>
                  <span style={{ opacity: 0.6 }}>X:</span> 
                  <span style={{ fontWeight: '600', marginLeft: '4px' }}>{info.boundingBox.x}</span>
                </div>
                <div>
                  <span style={{ opacity: 0.6 }}>Y:</span> 
                  <span style={{ fontWeight: '600', marginLeft: '4px' }}>{info.boundingBox.y}</span>
                </div>
                <div>
                  <span style={{ opacity: 0.6 }}>Z:</span> 
                  <span style={{ fontWeight: '600', marginLeft: '4px' }}>{info.boundingBox.z}</span>
                </div>
              </div>
            </div>

            {/* Características */}
            <div style={{ 
              display: 'flex', 
              gap: '6px',
              marginBottom: '12px'
            }}>
              <div style={{ 
                flex: 1,
                background: info.hasTextures 
                  ? 'rgba(0,255,170,0.15)' 
                  : 'rgba(255,255,255,0.05)',
                padding: '6px',
                borderRadius: '5px',
                fontSize: '11px',
                textAlign: 'center',
                border: `1px solid ${info.hasTextures ? 'rgba(0,255,170,0.3)' : 'rgba(255,255,255,0.1)'}`
              }}>
                {info.hasTextures ? '✓' : '✗'} Texturas
              </div>
              <div style={{ 
                flex: 1,
                background: info.hasMaterials 
                  ? 'rgba(0,255,170,0.15)' 
                  : 'rgba(255,255,255,0.05)',
                padding: '6px',
                borderRadius: '5px',
                fontSize: '11px',
                textAlign: 'center',
                border: `1px solid ${info.hasMaterials ? 'rgba(0,255,170,0.3)' : 'rgba(255,255,255,0.1)'}`
              }}>
                {info.hasMaterials ? '✓' : '✗'} Materiales
              </div>
            </div>
          </div>
        )}
        
        {/* Controles */}
        <div style={{ 
          marginTop: 12, 
          fontSize: '10px', 
          opacity: 0.6,
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ marginBottom: '4px' }}>🖱️ <strong>Clic izq:</strong> Rotar</div>
          <div style={{ marginBottom: '4px' }}>🖱️ <strong>Clic der:</strong> Mover</div>
          <div>🖱️ <strong>Scroll:</strong> Zoom</div>
        </div>
      </div>

      {/* Título flotante */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.85)',
        padding: '10px 20px',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: '11px', opacity: 0.7 }}>Proyecto</div>
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#00aaff' }}>
          Conversión de Formatos 3D
        </div>
      </div>
    </div>
  );
}

export default ModelViewer;
