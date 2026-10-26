---
name: motion-graphics-studio
description: Crea motion graphics de alta calidad y SIEMPRE distintos, hechos en código (HTML + GSAP + Canvas/Three.js) y exportados a MP4 con HyperFrames. Un motor de variedad con historial elige formato, paleta, tipografía, cámara 3D, texturas y tomas para que dos videos seguidos no se parezcan. Usar cuando pidan "motion graphics", "video animado", "efecto cine", "explainer animado", "video con cámara 3D", "showcase de widgets", "tipografía cinética", "intro/outro animado", o repetir/variar un video anterior.
---

# Motion Graphics Studio

Baúl de técnicas probadas + un motor que fuerza variedad. Todo se construye como UN `index.html` determinístico (el tiempo manda: nada de `Math.random()` ni callbacks) y se exporta con HyperFrames.

**Estado honesto:** los 6 formatos fueron renderizados y revisados (ver `examples/`), cada uno con su ejemplo, pero casi ninguna combinación del motor se renderizó junta. Esta skill genera video SIN audio (el audio queda fuera de su alcance). La IA no ve el video en movimiento: verifica con frames y se lo dice al usuario.

## Flujo

### 1. Entender el pedido (preguntar solo lo que falta)
- Mensaje/guion y **hechos** que pueden aparecer en pantalla (con su fuente). Nunca inventar cifras, fechas ni citas.
- Duración (default 25-35 s) y aspecto (`landscape` 1920x1080, `vertical` 1080x1920).
- Assets: logos/imágenes solo si el usuario los entrega. Sin assets → marca genérica.
- Restricciones de marca (`brand.md`/`MOTION.md` si existen; si no, preguntar paleta/tipografía obligatorias). **Las restricciones del cliente pisan la tirada.**

### 2. Tirar el dado de variedad
```bash
node <ruta-de-esta-skill>/scripts/roll.cjs --aspect <landscape|vertical> --save
```
Se ejecuta en la carpeta del proyecto (guarda `./motion-history.json`). Devuelve un brief con formato, paleta, tipografía, movimiento, texturas, cámara, apertura/cierre, 3 tomas núcleo, fondo vivo y transición. Reglas completas y cómo fijar dimensiones por restricción de cliente: `references/variety.md`. No ignorar el brief por gusto; se puede cambiar UNA dimensión con una línea de justificación. Si sale algo `untested`, avisar y validar con snapshots.

### 3. Leer solo lo que el brief nombra (carga progresiva)
| Tema | Archivo |
|---|---|
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
| Principios de motion clásicos | `references/motion-references.md` |
| Íconos libres | `references/icons.md` |
| Mockups de dispositivo (restricciones de Apple) | `references/device-mockups.md` |
| Errores ya cometidos | `references/lockdowns.md` (**leer siempre**) |

El ejemplo del formato elegido está en `examples/`; partir de ese HTML cambiando contenido, paleta, tipografía y tomas en vez de empezar de cero.

### 4. Guion en una línea por beat
8-12 beats, ~4 s cada uno (el primero es el gancho: los 3 primeros segundos deben frenar el pulgar). El último beat es la idea para llevarse, en ≤5 palabras. Si el usuario está presente, mostrar la lista y esperar un sí antes de construir.

### 5. Construir
```bash
npx hyperframes init <nombre> --non-interactive      # crea el proyecto
```
Escribir `index.html` con `data-composition-id="main"`, `data-duration`, `data-width/height`, `gsap.timeline({paused:true})` y `window.__timelines["main"] = tl`. Reglas de calidad:
- Beats ≤ 4-5 s; nunca texto estático largo ("PowerPoint").
- Fondo vivo siempre (2 capas), profundidad (parallax, 3D o niebla) y al menos 2 texturas del brief.
- Paleta y Dirección de Arte (Behance): Salir del modo oscuro monocromático si el concepto lo amerita; usar sombras físicas de 3 capas (oclusión + luz difusa) y micro-biseles (1px highlight).
- Curvas y Ritmo (School of Motion): Regla 80/20 de aceleración asimétrica (`expo.out` o `power4.out`). Ritmo Snap & Settle (snap rápido de 0.25s + settle elástico amortiguado de 0.5s + pausa de asimilación).
- Eye Tracing estricto: El punto donde termina el foco visual de un beat debe ser el punto de ancla de inicio del siguiente beat.
- Entradas con intención: overshoot en elementos héroe (`back.out(1.7)` o `elastic.out(1, 0.5)`), revelado tipográfico por caracteres/palabras (`SplitText`/`TextDelay`).
- Tipografía del brief cargada por Google Fonts (esperar a `document.fonts.ready`, nunca Arial por defecto).
- Cámara continua sin cortes entre tomas (ver `camera-techniques.md`).
- Todo cargado desde el frame 0; las animaciones se disparan cuando la cámara llega.

### 6. Verificar antes de renderizar (obligatorio)
```bash
npx hyperframes lint                                           # 0 errores; arreglar warnings
npx hyperframes snapshot --at 0.3,3,6,9,... -o snaps --no-browser-gpu
```
Leer `snaps/contact-sheet.jpg` y los PNG individuales: texto cortado, objetos pisando texto, fuentes que no cargaron, pantallas negras, detalles que la compresión va a borrar. Corregir y repetir.

### 7. Renderizar
```bash
npx hyperframes render --quality looks --output out.mp4 --no-browser-gpu     # SIEMPRE --no-browser-gpu
```
Extraer 1-2 frames del MP4 final (`ffmpeg -ss 5 -i out.mp4 -frames:v 1 f.png`) para confirmar que lo fino sobrevivió a la compresión.

### 8. Entregar
Enviar el MP4 y decir en pocas líneas: qué combinación salió (el brief), qué se verificó, qué NO se pudo verificar (movimiento en vivo) y qué sigue sin probar. Pedir feedback concreto. Si algo falló de una forma nueva, agregar una línea a `references/lockdowns.md`.

## Reglas inquebrantables
1. `--no-browser-gpu` en snapshots y renders.
2. Sin hechos, logos ni marcas inventados; logos solo si el cliente los provee. Marca genérica si no.
3. No usar bezels oficiales de Apple en tomas animadas/3D (ver `device-mockups.md`).
4. Determinismo: PRNG con semilla, nada de callbacks para cambiar estado.
5. No afirmar que "se ve fluido": afirmar lo que se verificó con frames.
6. Los scripts de Node en proyectos de HyperFrames van en `.cjs`.

## Ejemplos (`examples/`)
| Archivo | Formato | Qué demuestra |
|---|---|---|
| `editorial-cards-particles.html` | editorial-cards | papel rasgado, stepped, counter, grid, partículas de fondo |
| `dark-3d-flip-cards.html` | editorial-cards | Three.js de apertura, flip 3D, label-callout, glows |
| `data-infographic-particle-logo.html` | data-infographic | barras, glass-focus, partículas→huella |
| `widget-wall-camera-shots.html` / `widget-wall-vertical.html` | widget-wall | cámara de origen fijo, widgets con animación al enfocar |
| `map-kinetic-type-glitch.html` | map-kinetic-type | mapa procedural, tipografía 3D, RGB split, bokeh, tilt-shift |
| `flythrough-3d-cine.html` | flythrough-3d | mundo Three.js, vuelo de cámara, letterbox, flare, cierre de partículas |
| `ui-mockup-demo.html` | ui-mockup-demo | marca animada, chat con tipeo, ventana de navegador 3D que se "genera", código de fondo, glow |
| `effects-snippet-bench.html` | (banco de efectos) | snippets del catálogo validados en HyperFrames |

## Ubicación y mantenimiento
Esta skill se creó en una carpeta local de pruebas. Antes de que la use más gente debe vivir en un repositorio de la organización `educabot` en GitHub (código, skills y plugins de Educabot van ahí).
