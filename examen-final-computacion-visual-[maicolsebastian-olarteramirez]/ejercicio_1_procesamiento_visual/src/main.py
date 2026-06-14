"""
Ejercicio 1 – Procesamiento Visual e IA
Examen Final Computación Visual 2026-I – UNAL

Pipeline:
  1. Carga de imagen (sintética o desde data/input.jpg)
  2. Conversión a escala de grises
  3. Conversión a espacio HSV
  4. Suavizado gaussiano
  5. Detección de bordes (Canny)
  6. Detección de objetos (YOLOv8n si está instalado, sino clásica por color HSV + contornos)
  7. Mosaico comparativo de todos los pasos
"""

import sys
import cv2
import numpy as np
from pathlib import Path

np.random.seed(42)  # reproducibilidad en la imagen sintética

SCRIPT_DIR  = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
RESULTS_DIR = PROJECT_DIR / "resultados"
DATA_DIR    = PROJECT_DIR / "data"


# ──────────────────────────────────────────────────────────────────────────────
# Generación de escena sintética
# ──────────────────────────────────────────────────────────────────────────────

def create_synthetic_scene(W: int = 640, H: int = 480) -> np.ndarray:
    """
    Construye una escena urbana sintética con cielo, edificios, vehículos y
    vegetación.  Se usa cuando no existe data/input.jpg.
    Parámetros: W, H → dimensiones de la imagen de salida (píxeles).
    """
    img      = np.zeros((H, W, 3), dtype=np.uint8)
    horizon  = int(H * 0.62)

    # Cielo: gradiente azul oscuro → azul diurno
    for y in range(horizon):
        t = y / horizon
        img[y, :] = (int(160 * t + 30), int(110 * t + 15), int(50 * t + 8))

    # Suelo verde y calle gris
    img[horizon:, :]                    = (35, 80, 25)
    street_top = horizon + 18
    img[street_top : street_top + 95, :] = (72, 72, 78)
    # Líneas de la calle
    for x in range(0, W, 90):
        cv2.rectangle(img, (x + 5, street_top + 42), (x + 50, street_top + 52),
                      (190, 190, 195), -1)

    # ── Edificios ─────────────────────────────────────────────────────────────
    buildings = [
        ((55,  150, 195, horizon + 19), (88,  88,  98)),
        ((230, 195, 360, horizon + 19), (58,  58,  72)),
        ((385, 240, 490, horizon + 19), (108, 108, 118)),
        ((510, 180, 625, horizon + 19), (68,  68,  82)),
    ]
    win_colors_on  = [(180, 220, 200), (160, 210, 240), (200, 200, 170)]
    win_color_off  = (50, 65, 60)

    for (x1, y1, x2, y2), col in buildings:
        cv2.rectangle(img, (x1, y1), (min(x2, W - 1), y2), col, -1)
        for wy in range(y1 + 14, y2 - 8, 22):
            for wx in range(x1 + 8, x2 - 8, 18):
                on = np.random.random() > 0.28
                wc = win_colors_on[np.random.randint(len(win_colors_on))] if on else win_color_off
                cv2.rectangle(img, (wx, wy), (wx + 10, wy + 14), wc, -1)

    # ── Sol ───────────────────────────────────────────────────────────────────
    cv2.circle(img, (90, 68), 38, (0, 200, 255), -1)
    cv2.circle(img, (90, 68), 48, (0, 120, 160), 3)

    # ── Vehículos ─────────────────────────────────────────────────────────────
    car_top = street_top + 22

    # Auto rojo
    cv2.rectangle(img, (115, car_top),      (240, car_top + 34), (25,  25, 185), -1)
    cv2.rectangle(img, (130, car_top - 18), (225, car_top +  2), (20,  20, 165), -1)
    cv2.ellipse(img, (138, car_top + 34), (13, 13), 0, 0, 360, (12, 12, 12), -1)
    cv2.ellipse(img, (218, car_top + 34), (13, 13), 0, 0, 360, (12, 12, 12), -1)

    # Auto azul
    cv2.rectangle(img, (375, car_top),      (505, car_top + 34), (175, 55,  28), -1)
    cv2.rectangle(img, (390, car_top - 18), (490, car_top +  2), (155, 45,  22), -1)
    cv2.ellipse(img, (392, car_top + 34), (13, 13), 0, 0, 360, (12, 12, 12), -1)
    cv2.ellipse(img, (488, car_top + 34), (13, 13), 0, 0, 360, (12, 12, 12), -1)

    # ── Árbol ─────────────────────────────────────────────────────────────────
    cv2.rectangle(img, (548, horizon + 12), (562, street_top + 10), (28, 55, 18), -1)
    cv2.circle(img, (555, horizon - 2), 30, (25, 125, 38), -1)
    cv2.circle(img, (540, horizon + 8), 20, (28, 115, 33), -1)

    return img


# ──────────────────────────────────────────────────────────────────────────────
# Detección clásica por color HSV
# ──────────────────────────────────────────────────────────────────────────────

def detect_classical(bgr: np.ndarray, hsv: np.ndarray) -> np.ndarray:
    """
    Detecta objetos mediante máscaras de color en HSV y análisis de contornos.
    Clases detectadas: Auto rojo, Auto azul, Sol, Árbol.

    Parámetros elegidos:
    - Rango HSV del rojo dividido en dos bandas (0-10 y 170-180) para cubrir
      la discontinuidad del canal H alrededor de 0°.
    - Kernel morfológico de 7×7 para cerrar huecos en la máscara.
    - Área mínima de contorno = 350 px² para filtrar ruido.
    """
    result = bgr.copy()
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))

    masks: dict[str, tuple[np.ndarray, tuple[int, int, int]]] = {
        "Auto rojo": (
            cv2.bitwise_or(
                cv2.inRange(hsv, np.array([0,   120, 80]),  np.array([10,  255, 255])),
                cv2.inRange(hsv, np.array([168, 120, 80]),  np.array([180, 255, 255])),
            ),
            (0, 0, 230),
        ),
        "Auto azul": (
            cv2.inRange(hsv, np.array([100, 120, 80]),  np.array([130, 255, 255])),
            (210, 70, 10),
        ),
        "Sol": (
            cv2.inRange(hsv, np.array([12, 80, 160]), np.array([32, 255, 255])),
            (0, 200, 255),
        ),
        "Arbol": (
            cv2.inRange(hsv, np.array([35, 50, 30]),  np.array([85, 255, 190])),
            (20, 160, 20),
        ),
    }

    for label, (mask, color) in masks.items():
        clean = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        contours, _ = cv2.findContours(clean, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            if cv2.contourArea(cnt) < 350:
                continue
            x, y, w, h = cv2.boundingRect(cnt)
            cv2.rectangle(result, (x, y), (x + w, y + h), color, 2)
            cv2.putText(result, label, (x + 2, max(y - 6, 12)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)

    return result


def try_yolo(bgr: np.ndarray) -> np.ndarray | None:
    """
    Intenta inferencia con YOLOv8n (ultralytics).
    Devuelve la imagen anotada o None si el paquete no está instalado.

    Confianza mínima = 0.25 (estándar para escenas genéricas).
    """
    try:
        from ultralytics import YOLO  # type: ignore
        model = YOLO("yolov8n.pt")
        results = model.predict(bgr, conf=0.25, verbose=False)
        return results[0].plot()
    except Exception as exc:
        print(f"  [YOLO no disponible: {exc}] → usando detección clásica")
        return None


# ──────────────────────────────────────────────────────────────────────────────
# Utilidades de salida
# ──────────────────────────────────────────────────────────────────────────────

def label_image(img: np.ndarray, text: str) -> np.ndarray:
    """Añade un chip de texto en la esquina superior izquierda."""
    out   = img.copy()
    (w, _), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
    cv2.rectangle(out, (0, 0), (w + 18, 30), (0, 0, 0), -1)
    cv2.putText(out, text, (8, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 230, 130), 2)
    return out


def build_mosaic(imgs: list[np.ndarray], titles: list[str], cols: int = 3) -> np.ndarray:
    """
    Genera un mosaico de comparación con título debajo de cada imagen.
    Convierte imágenes en escala de grises a BGR para uniformidad.
    """
    H, W = imgs[0].shape[:2]
    rows  = (len(imgs) + cols - 1) // cols
    panel = np.full((rows * (H + 28), cols * W, 3), 20, dtype=np.uint8)

    for i, (img, title) in enumerate(zip(imgs, titles)):
        r, c = divmod(i, cols)
        tile  = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR) if img.ndim == 2 else img
        py, px = r * (H + 28), c * W
        panel[py: py + H, px: px + W] = tile
        cv2.putText(panel, title,
                    (px + 6, py + H + 18),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.50, (180, 180, 180), 1)

    return panel


# ──────────────────────────────────────────────────────────────────────────────
# Pipeline principal
# ──────────────────────────────────────────────────────────────────────────────

def main() -> None:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # 1 ── Carga ────────────────────────────────────────────────────────────────
    input_path = DATA_DIR / "input.jpg"
    if input_path.exists():
        original = cv2.imread(str(input_path))
        if original is None:
            sys.exit(f"Error: no se pudo leer {input_path}")
        print(f"[1] Imagen cargada: {input_path}")
    else:
        original = create_synthetic_scene()
        cv2.imwrite(str(input_path), original)
        print("[1] Escena sintética generada → data/input.jpg")

    cv2.imwrite(str(RESULTS_DIR / "original.png"), original)

    # 2 ── Escala de grises ─────────────────────────────────────────────────────
    gray = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)
    cv2.imwrite(str(RESULTS_DIR / "grises.png"), gray)
    print("[2] Escala de grises → resultados/grises.png")

    # 3 ── Espacio de color HSV ─────────────────────────────────────────────────
    hsv = cv2.cvtColor(original, cv2.COLOR_BGR2HSV)
    cv2.imwrite(str(RESULTS_DIR / "hsv_o_lab.png"), hsv)
    print("[3] Representación HSV   → resultados/hsv_o_lab.png")

    # 4 ── Suavizado gaussiano ──────────────────────────────────────────────────
    # Kernel 15×15: suficiente para suavizar bordes ruidosos sin destruir la forma.
    # σ=0 → OpenCV lo calcula como 0.3 * ((ksize - 1) * 0.5 - 1) + 0.8 ≈ 2.8
    blurred = cv2.GaussianBlur(original, (15, 15), 0)
    cv2.imwrite(str(RESULTS_DIR / "suavizado.png"), blurred)
    print("[4] Suavizado gaussiano  → resultados/suavizado.png")

    # 5 ── Detección de bordes Canny ────────────────────────────────────────────
    # Pre-suavizado 5×5 sobre la imagen en grises para reducir ruido de alta frecuencia.
    # Umbrales: 50 (bajo) y 150 (alto), relación 1:3 recomendada por Canny (1986).
    gray_pre  = cv2.GaussianBlur(gray, (5, 5), 0)
    edges     = cv2.Canny(gray_pre, threshold1=50, threshold2=150)
    cv2.imwrite(str(RESULTS_DIR / "bordes.png"), edges)
    print("[5] Bordes Canny         → resultados/bordes.png")

    # 6 ── Detección / Segmentación ─────────────────────────────────────────────
    yolo_img = try_yolo(original)
    if yolo_img is not None:
        cv2.imwrite(str(RESULTS_DIR / "deteccion_o_segmentacion.png"), yolo_img)
        print("[6] Detección YOLOv8n   → resultados/deteccion_o_segmentacion.png")
    else:
        classical_img = detect_classical(original, hsv)
        cv2.imwrite(str(RESULTS_DIR / "deteccion_o_segmentacion.png"), classical_img)
        print("[6] Detección clásica   → resultados/deteccion_o_segmentacion.png")

    # 7 ── Mosaico comparativo ──────────────────────────────────────────────────
    detection = cv2.imread(str(RESULTS_DIR / "deteccion_o_segmentacion.png"))
    mosaic = build_mosaic(
        [original, gray, hsv, blurred, edges, detection],
        ["1 Original", "2 Grises", "3 HSV", "4 Suavizado", "5 Bordes Canny", "6 Detección"],
    )
    cv2.imwrite(str(RESULTS_DIR / "comparacion.png"), mosaic)
    print("[7] Mosaico comparativo  → resultados/comparacion.png")

    print(f"\nPipeline completo. Resultados en: {RESULTS_DIR}")


if __name__ == "__main__":
    main()
