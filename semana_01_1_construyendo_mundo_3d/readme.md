# Taller Construyendo Mundo 3D

**Nombre del estudiante:** Maicol Sebastian Olarte Ramirez  
**Fecha de entrega:** 15 de Febrero, 2026

---

## Descripción Breve

Este proyecto implementa un visualizador 3D interactivo del modelo "Kratos" utilizando React Three Fiber y Three.js. El objetivo principal es explorar y visualizar geometrías 3D mediante diferentes modos de renderizado (caras, wireframe, aristas y vértices), proporcionando una interfaz intuitiva para alternar entre estas visualizaciones y mostrar información estadística del modelo.

---

## Implementaciones

### Entorno: React + Three.js + Vite

**Tecnologías utilizadas:**
- React 19.2.0
- @react-three/fiber (Canvas y hooks de Three.js)
- @react-three/drei (OrbitControls, useGLTF)
- Three.js (Geometrías y materiales)
- Vite (Build tool y dev server)

**Características implementadas:**

#### 1. **Carga del Modelo GLTF**
- Implementación de carga asíncrona del modelo Kratos desde `media/kratos/scene.gltf`
- Uso del hook `useGLTF` de @react-three/drei para optimizar la carga
- Preload del modelo para mejorar el rendimiento inicial

#### 2. **Sistema de Visualización Multi-Modo**
Se implementaron 4 modos de visualización distintos:

- **Faces (Caras):** Renderizado sólido estándar con texturas y materiales originales
- **Wireframe:** Visualización de la malla en modo wireframe con color verde (#00ff00)
- **Edges (Aristas):** Visualización de aristas usando `EdgesGeometry` con líneas azules (#0000ff)
- **Vertices (Vértices):** Representación mediante puntos (`THREE.Points`) en color rojo (#ff0000)

#### 3. **Controles Orbitales (OrbitControls)**
- Rotación mediante clic izquierdo y arrastre
- Zoom con la rueda del mouse
- Paneo con clic derecho
- Amortiguamiento suave (`dampingFactor: 0.05`)
- Límites de distancia configurados (min: 2, max: 20)

#### 4. **Análisis y Estadísticas del Modelo**
Sistema automático que calcula:
- Número total de meshes
- Cantidad de vértices
- Cantidad de aristas (edges)
- Cantidad de caras (faces)

Los cálculos se realizan traversando el grafo de escena y analizando cada geometría.

#### 5. **Interfaz de Usuario**
Panel de control estilizado que incluye:
- Botones para alternar entre modos de visualización
- Display de información estadística en tiempo real
- Información de uso y controles
- Diseño responsive con backdrop blur
- Estados visuales para el modo activo

#### 6. **Iluminación y Escena**
- Luz ambiental (`intensity: 0.5`)
- Dos luces direccionales para iluminación balanceada
- Grid helper para referencia espacial
- Axes helper para orientación (XYZ)

---

## Resultados Visuales

### Modo Faces (Sólido)
![Modo Faces](./media/screenshots/faces-mode.png)
*Visualización del modelo Kratos con renderizado sólido y texturas*

### Modo Wireframe
![Modo Wireframe](./media/screenshots/wireframe-mode.png)
*Malla en modo wireframe mostrando la topología completa*

### Modo Edges (Aristas)
![Modo Edges](./media/screenshots/edges-mode.png)
*Visualización de aristas principales del modelo*

### Modo Vertices (Puntos)
![Modo Vertices](./media/screenshots/vertices-mode.png)
*Representación mediante puntos de todos los vértices*

### Interfaz de Usuario
![UI Panel](./media/screenshots/ui-panel.png)
*Panel de control con información estadística del modelo*

### Demo en Acción
![Demo GIF](./media/screenshots/demo.gif)
*Demostración de la interacción con el modelo y cambio entre modos*

> **Nota:** Por favor, agrega las capturas de pantalla y GIFs en la carpeta `media/screenshots/` para que las referencias funcionen correctamente.

---

## Código Relevante

### Carga del Modelo y Cálculo de Estadísticas

```jsx
function Model({ visualizationMode }) {
  const { scene } = useGLTF('/media/kratos/scene.gltf');
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
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
        }
      }
    });

    setModelInfo({ meshCount, vertices: totalVertices, 
                   faces: Math.floor(totalFaces), 
                   edges: Math.floor(totalEdges) });
  }, [scene]);
  
  // ...
}
```

### Sistema de Modos de Visualización

```jsx
modelClone.traverse((child) => {
  if (child.isMesh) {
    switch (visualizationMode) {
      case 'faces':
        child.material = originalMaterial;
        child.material.wireframe = false;
        break;

      case 'wireframe':
        child.material = originalMaterial.clone();
        child.material.wireframe = true;
        child.material.color = new THREE.Color(0x00ff00);
        break;

      case 'vertices': {
        const pointsGeometry = new THREE.BufferGeometry().copy(child.geometry);
        const pointsMaterial = new THREE.PointsMaterial({
          color: 0xff0000,
          size: 0.05,
          sizeAttenuation: true,
        });
        const points = new THREE.Points(pointsGeometry, pointsMaterial);
        // Posicionamiento y agregado a la escena
        break;
      }

      case 'edges': {
        const edges = new THREE.EdgesGeometry(child.geometry, 15);
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: 0x0000ff 
        });
        const lineSegments = new THREE.LineSegments(edges, lineMaterial);
        // Posicionamiento y agregado a la escena
        break;
      }
    }
  }
});
```

### Configuración del Canvas 3D

```jsx
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
```

**Archivos principales:**
- [`src/ModelViewer.jsx`](src/ModelViewer.jsx) - Componente principal del visualizador
- [`src/App.jsx`](src/App.jsx) - Punto de entrada de la aplicación
- [`package.json`](package.json) - Dependencias del proyecto

---

## Prompts Utilizados

Durante el desarrollo de este proyecto se utilizó IA generativa (GitHub Copilot) con los siguientes prompts:

### Prompt Principal:
```
"I need to charge the model .gltf that is in the folder media/kratos using 
@react-three/drei, then I need to visualize the model with OrbitControls, 
also I need to highlight the vertices, edges, or faces using visual effects 
like lines (Edges, Wireframe) or points, finally we're going to create a 
small interface to change between vertices/edges/face visualization and show 
the basic information from the model."
```

### Prompts de Corrección:
1. **Error de variable no utilizada:**
   ```
   "'nodes' is declared but its value is never read. Thank you the model viewer 
   is working now I need to fix this eslint errors"
   ```

2. **Error de scope en switch:**
   ```
   "at the line 97 to 102 there is several errors like const lineSegments 
   redeclaration"
   ```

3. **Documentación:**
   ```
   "Now please help me with the readme.md for my project world-building..."
   ```

---

## Aprendizajes y Dificultades

### Aprendizajes:

1. **React Three Fiber Ecosystem:**
   - Aprendí a integrar Three.js con React de manera declarativa usando `@react-three/fiber`
   - El uso de hooks como `useGLTF` facilita significativamente la carga de modelos 3D
   - La abstracción de componentes facilita la gestión del estado y la lógica de renderizado

2. **Geometrías en Three.js:**
   - Comprendí la diferencia entre `BufferGeometry`, `EdgesGeometry` y geometrías indexadas
   - Aprendí a manipular atributos de geometría para extraer información (vertices, faces)
   - El uso de `traverse()` es fundamental para recorrer grafos de escena complejos

3. **Visualizaciones Alternativas:**
   - Implementar diferentes modos de visualización requiere clonar y manipular la escena
   - Los `THREE.Points` son ideales para visualizar vértices
   - `EdgesGeometry` con `LineSegments` proporciona una excelente visualización de aristas

4. **Optimización:**
   - El preloading de modelos mejora significativamente la experiencia inicial
   - Clonar escenas permite cambios no destructivos entre modos
   - El uso de `useEffect` con dependencias correctas evita re-cálculos innecesarios

### Dificultades Encontradas:

1. **Scope de Variables en Switch:**
   - **Problema:** ESLint generaba errores de redeclaración de `const` dentro de casos del switch
   - **Solución:** Envolver cada caso que declara variables en bloques `{}` para crear scope aislado

2. **Copia de Archivos al Public:**
   - **Problema:** Comandos de Windows (xcopy, robocopy) fallaban con rutas complejas
   - **Solución:** Usar PowerShell `Copy-Item` con rutas relativas correctamente calculadas

3. **Visibilidad de Modos:**
   - **Problema:** Al cambiar entre modos, algunos objetos se superponían
   - **Solución:** Establecer `child.visible = false` en los meshes originales al agregar visualizaciones alternativas

4. **Cálculo de Aristas:**
   - **Problema:** No existe un atributo directo para contar aristas
   - **Solución:** Estimar aristas basándose en índices (count/2) para geometrías indexadas

5. **Material Handling:**
   - **Problema:** Algunos meshes tienen arrays de materiales en lugar de un solo material
   - **Solución:** Implementar verificación `Array.isArray()` y mapear cada material individualmente

6. **Comunicación entre Canvas y UI:**
   - **Problema:** El componente dentro del Canvas no puede usar hooks de React fácilmente para comunicarse con el UI externo
   - **Solución:** Usar una estrategia de "global state" temporal (`window.modelInfo`) con polling mediante `setInterval`

### Reflexión:

Este proyecto me permitió entender la potencia de combinar React con Three.js para crear experiencias 3D interactivas. La arquitectura declarativa de React Three Fiber es muy intuitiva una vez que se comprenden los conceptos fundamentales. Las visualizaciones alternativas (wireframe, edges, vertices) son herramientas valiosas para analizar topología de modelos 3D, algo especialmente útil en modelado, análisis de mallas y computación gráfica en general.

La experiencia de debugging con ESLint y TypeScript también reforzó la importancia de escribir código limpio y bien estructurado desde el inicio.

---

## Instrucciones de Ejecución

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

El proyecto se ejecutará en `http://localhost:5173` (o el puerto disponible siguiente).

---

## Referencias

- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Documentation](https://threejs.org/docs/)
- [Drei Helpers](https://github.com/pmndrs/drei)
- [GLTF Format Specification](https://www.khronos.org/gltf/)
