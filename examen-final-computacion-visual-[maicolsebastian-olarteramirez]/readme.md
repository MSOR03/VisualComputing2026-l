# Examen Final – Computación Visual 2026-I

**Universidad Nacional de Colombia**  
**Estudiante:** Maicol Sebastian Olarte Ramirez  
**Correo:** olarteramirezsebastian830@gmail.com  
**Fecha:** Junio 2026

---

## Descripción general

Repositorio con la entrega práctica del examen final del curso de Computación Visual. Contiene dos ejercicios independientes:

1. **Ejercicio 1** – Pipeline de procesamiento visual con Python y OpenCV, incluyendo detección de objetos.
2. **Ejercicio 2** – Escena 3D interactiva de entorno futurista construida con Three.js / React Three Fiber.

---

## Estructura del repositorio

```
examen-final-computacion-visual-[maicolsebastian-olarteramirez]/
├── readme.md                              ← Este archivo
├── ejercicio_1_procesamiento_visual/
│   ├── src/main.py                        ← Pipeline principal
│   ├── data/input.jpg                     ← Imagen generada automáticamente
│   ├── resultados/
│   │   ├── original.png
│   │   ├── grises.png
│   │   ├── hsv_o_lab.png
│   │   ├── suavizado.png
│   │   ├── bordes.png
│   │   ├── deteccion_o_segmentacion.png
│   │   └── comparacion.png
│   └── readme.md
└── ejercicio_2_escena_3d_interactiva/
    ├── src/
    │   ├── App.jsx
    │   └── components/
    │       ├── Scene.jsx
    │       ├── Building.jsx
    │       ├── Drone.jsx
    │       ├── GridFloor.jsx
    │       ├── CityCore.jsx
    │       └── UIPanel.jsx
    ├── media/                             ← Capturas y GIF de evidencia
    ├── index.html
    ├── package.json
    └── readme.md
```

---

## Dependencias globales

| Herramienta | Versión mínima |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Instalación rápida

```bash
# Ejercicio 1
pip install opencv-python-headless numpy
# Opcional para YOLOv8:
pip install ultralytics

# Ejercicio 2
cd ejercicio_2_escena_3d_interactiva
npm install
```

---

## Ejecución

### Ejercicio 1
```bash
cd ejercicio_1_procesamiento_visual
python src/main.py
```
Los resultados se guardan en `resultados/`. Si no existe `data/input.jpg`, el script genera una escena sintética automáticamente.

### Ejercicio 2
```bash
cd ejercicio_2_escena_3d_interactiva
npm run dev
```
Abrir `http://localhost:5173` en Chrome o Firefox.

---

## Evidencias

### Ejercicio 1 – Procesamiento Visual

| Paso | Archivo |
|---|---|
| Original | `resultados/original.png` |
| Escala de grises | `resultados/grises.png` |
| Espacio HSV | `resultados/hsv_o_lab.png` |
| Suavizado gaussiano | `resultados/suavizado.png` |
| Bordes Canny | `resultados/bordes.png` |
| Detección de objetos | `resultados/deteccion_o_segmentacion.png` |
| Mosaico comparativo | `resultados/comparacion.png` |

### Ejercicio 2 – Escena 3D

Las capturas y GIF de la escena en ejecución se encuentran en `ejercicio_2_escena_3d_interactiva/media/`.

---

## Análisis técnico

### Ejercicio 1
El pipeline sigue el flujo clásico de computer vision: adquisición → preprocesamiento → análisis de características → detección. La elección de HSV sobre RGB para detección por color se justifica en la invarianza del canal H ante cambios de iluminación. El fallback a detección clásica garantiza que el ejercicio sea 100% reproducible sin conexión a internet.

### Ejercicio 2
La escena futurista utiliza el patrón componente-por-entidad de React Three Fiber, donde cada objeto 3D encapsula su propia geometría, material y lógica de animación. El `useFrame` loop de R3F se sincroniza automáticamente con el RAF del navegador, garantizando animaciones fluidas sin `setInterval`. Los materiales PBR responden a todas las fuentes de luz de la escena simultáneamente.

---

## Uso de IA

Claude Sonnet 4.6 (Anthropic) se utilizó como asistente de programación para:
- Generar el esqueleto inicial de ambos ejercicios.
- Proponer la estructura de componentes del Ejercicio 2.
- Redactar comentarios técnicos en el código.

Todas las decisiones de diseño, parámetros numéricos (umbrales de Canny, posiciones de edificios, intensidades de luz) y la verificación funcional fueron realizadas manualmente por el estudiante.

---

## Licencia

Código de evaluación académica – Universidad Nacional de Colombia, 2026.
