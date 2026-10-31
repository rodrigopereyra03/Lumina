---
name: motion-graphics-studio
description: Crea motion graphics cinematográficos en código (HTML + GSAP + Three.js) exportados a MP4 con HyperFrames. Integra dirección de arte Anti-Slop (genjutsu), extracción de Design DNA (design-dna), los 12 principios de animación física (LottieFiles), Three.js r180+ determinístico y timelines de alta precisión (gsap-skills). Usar cuando pidan "motion graphics", "video animado", "efecto cine", "explainer animado", "video con cámara 3D", "showcase de widgets", "tipografía cinética", "intro/outro animado", o creación de reels/videos en código.
---

# Motion Graphics Studio

Baúl de técnicas probadas + motor de variedad + dirección de arte cinemática. Todo se construye como UN `index.html` determinístico (el tiempo lo dicta el timeline de GSAP: nada de `Math.random()`, callbacks desincronizados ni `THREE.Clock`) y se exporta a MP4 con HyperFrames.

**Estado honesto:** los formatos fueron renderizados y revisados (ver `examples/`). Esta skill genera video SIN audio (el audio o voiceover se mezcla en postproducción o con OpenEdit). La IA no ve el video en movimiento continuo: verifica la composición frame a frame mediante snapshots de alta resolución.

---

## Flujo de Producción

### 1. Entender el pedido y capturar identidad
- Mensaje/guion y **hechos** que aparecen en pantalla (fuentes verificadas, nunca inventar cifras ni citas).
- Duración (default 25-35 s) y aspecto (`landscape` 1920x1080, `vertical` 1080x1920).
- Assets: logos o imágenes solo si el usuario los entrega. Sin assets → marca genérica estilizada.
- **Extracción de Design DNA (`design-dna`):** Si el usuario proporciona una captura, imagen o marca, extraer de inmediato su ADN visual (paleta semántica, micro-biseles, desenfoque de cristal, grano y shaders). Ver `references/design-dna-engine.md`.

### 2. Tirar el dado de variedad
```bash
node <ruta-de-esta-skill>/scripts/roll.cjs --aspect <landscape|vertical> --save
```
Se ejecuta en la carpeta del proyecto (guarda `./motion-history.json`). Devuelve un brief con formato, paleta, tipografía, movimiento, texturas, cámara, apertura/cierre, 3 tomas núcleo, fondo vivo y transición. Las restricciones del cliente o del Design DNA pisan la tirada.

### 3. Leer solo lo que el brief nombra (Carga Progresiva)
| Tema | Archivo |
|---|---|
| **Design DNA & Extracción Visual (Tokens, Shaders, Vibe)** | `references/design-dna-engine.md` |
| **Interaction Thesis & Manifiesto Anti-Slop (Genjutsu)** | `references/interaction-thesis-antislop.md` |
| **Principios de Motion Lottie & Coreografía (12 Leyes)** | `references/motion-principles-choreography.md` |
| **Estilo Clean Commercial Mograph (Fondo Blanco / Mogu Mogu)** | `references/style-clean-commercial-mograph.md` |
| **GSAP Mastery & Timelines Determinísticos (GSAP 3)** | `references/gsap-motion-mastery.md` |
| **Three.js Moderno (r180+) & Puente con GSAP** | `references/threejs-modern-api.md` |
| Paleta (hex y reglas) | `references/palettes.md` |
| Dirección de Arte, Color Vívido & Sombras Físicas (Behance) | `references/behance-art-direction.md` |
| Tipografía + cómo cargarla | `references/typography.md` |
| Taxonomía Tipográfica & Moods (DaFont / Variable Fonts) | `references/typography-moodboards.md` |
| Texturas y efectos (glow, bokeh, scanlines, RGB split, grano, halftone, mesh, glass) | `references/effects-techniques.md` |
| Fórmulas y Algoritmos de AE en Código (aescripts) | `references/aescripts-formulas.md` |
| Principios de Motion & Timing Asimétrico 80/20 (School of Motion) | `references/school-of-motion-principles.md` |
| Tomas (apertura, núcleo, cierre) con recetas | `references/shot-types.md` |
| Cámara (origen fijo, cursor, 3 fases, Three.js) | `references/camera-techniques.md` |
| Mundos 3D con primitivas | `references/worlds-3d.md` |
| Fondos vivos | `references/backgrounds.md` |
| Íconos libres | `references/icons.md` |
| Mockups de dispositivo (restricciones de Apple) | `references/device-mockups.md` |
| Errores ya cometidos | `references/lockdowns.md` (**leer siempre**) |

El ejemplo del formato elegido está en `examples/`; partir de ese HTML cambiando contenido, paleta, tipografía y tomas en vez de empezar de cero.

### 4. Guion y Tesis de Interacción (Genjutsu)
- **Guion por beats:** 8-12 beats, ~3-4 s cada uno (los primeros 3 segundos son el gancho visual que frena el scroll). Último beat con la idea fuerza en $\le 5$ palabras.
- **Tesis de Interacción obligatoria:** Redactar en 3 líneas antes de picar código:
  1. *Física de materiales* (¿vidrio refractario pesado, metal cepillado o luz holográfica?).
  2. *Curva de ritmo y tensión* (dónde acelera, dónde respira el ojo y cuándo revienta el clímax).
  3. *Punto de fricción visual* (el elemento heroico inicial que rompe el patrón genérico).

### 5. Construir
```bash
npx hyperframes init <nombre> --non-interactive      # crea el proyecto
```
Escribir `index.html` con `data-composition-id="main"`, `data-duration`, `data-width/height`, `gsap.timeline({paused:true})` y `window.__timelines["main"] = tl`.

**Reglas de calidad y ejecución:**
- **Determinismo estricto:** Three.js y shaders NUNCA usan `requestAnimationFrame` libre ni `THREE.Clock`. Se animan a través de proxies GSAP sincronizados con el timeline de HyperFrames (`references/threejs-modern-api.md`).
- **Coreografía Lottie & Física:** Usar siempre anticipación (windup) previa a salidas rápidas, overshoot controlado (`back.out(1.7)` o `elastic.out(1, 0.5)`) y separación de planos de profundidad (Parallax 3 capas).
- **Tipografía con revelado cinemático:** Títulos partidos en palabras/caracteres con máscara de recorte (`references/gsap-motion-mastery.md`). Nunca texto estático tipo presentación.
- **Sombras físicas y micro-biseles:** Sombras multicapa (oclusión cercana + dispersión lejana) y borde highlight superior de 1px (`rgba(255,255,255,0.15)`). Prohibido el `box-shadow` plano genérico.
- **Atmósfera viva en fondo:** Al menos 2 capas dinámicas continuas (grano/ruido + partículas o gradiente de malla procedural).

### 6. Verificar antes de renderizar (Obligatorio)
```bash
npx hyperframes lint                                           # 0 errores; arreglar warnings
npx hyperframes snapshot --at 0.3,3,6,9,... -o snaps --no-browser-gpu
```
Inspeccionar `snaps/contact-sheet.jpg` y PNGs individuales: verificar contrastes, textos desbordados, jerarquía, render de tipografías externas y ausencia de pantallas negras.

### 7. Renderizar
```bash
npx hyperframes render --quality looks --output out.mp4 --no-browser-gpu     # SIEMPRE --no-browser-gpu
```
Extraer 1-2 frames del MP4 final (`ffmpeg -ss 5 -i out.mp4 -frames:v 1 f.png`) para confirmar que las texturas y micro-detalles resistieron la compresión h264.

### 8. Entregar
Entregar el MP4 informando brevemente:
1. La combinación de brief y Design DNA aplicada.
2. La Tesis de Interacción implementada.
3. Lo verificado mediante snapshots y qué puntos específicos evaluar en movimiento.

---

## Reglas Inquebrantables
1. **`--no-browser-gpu`** en snapshots y renders de HyperFrames.
2. **Determinismo absoluto:** Cero `Math.random()`, cero `setTimeout`, cero `THREE.Clock`. Todo el tiempo lo dicta el timeline maestro de GSAP.
3. **Cero AI-Slop:** Toda escena debe tener textura viva, sombras físicas multicapa, micro-biseles y curvas de aceleración asimétricas con intención.
4. **Three.js r180+:** Usar `SRGBColorSpace`, `BufferGeometry`, luces físicas y render conducido por GSAP.
5. **No inventar hechos:** Cifras, marcas y citas deben provenir del usuario o de fuentes explícitas.
6. **Scripts de Node:** En proyectos HyperFrames, los scripts de utilería van en `.cjs`.
