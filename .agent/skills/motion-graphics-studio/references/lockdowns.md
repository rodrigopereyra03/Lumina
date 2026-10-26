# Lockdowns: errores que ya nos pasaron (no repetir)

Cada regla nació de un fallo real en esta sesión. Agregar una línea cada vez que aparezca uno nuevo.

## Render
1. **Video negro:** HyperFrames prueba captura acelerada por GPU (BeginFrame) y con `mix-blend-mode`, `box-shadow` de blur grande o `clip-path` pesado compone todo en negro. → Renderizar y hacer snapshots SIEMPRE con `--no-browser-gpu` (aparece `screenshot capture · software gpu` en el resumen). Evitar `mix-blend-mode` cuando se pueda; `screen` en capas fantasma de texto funcionó con captura por software.
2. **Snapshot ≠ MP4 final:** la compresión H.264 + el escalado del player borran detalles finos (las partículas de 1.5-4 px desaparecieron). → Dimensionar generoso y, ante duda, extraer un frame del MP4 real: `ffmpeg -ss 5 -i out.mp4 -frames:v 1 f.png`.
3. **Verificar antes de renderizar:** `npx hyperframes lint` → `npx hyperframes snapshot --at t1,t2,... -o snaps --no-browser-gpu` y leer el `contact-sheet.jpg`. Un render completo cuesta 1-5 min.
4. **Proyectos ES module:** los scripts auxiliares de Node van en `.cjs` (`require is not defined` en `.js`).

## Lint de HyperFrames
5. `gsap_non_transform_motion`: no animar `left/top`; usar `x/y/scale`. Para etiquetas que siguen una barra, ubicarlas dentro del elemento que crece.
6. `gsap_infinite_repeat`: usar `repeat` finito alto (p. ej. 20) en vez de `-1`.
7. `overlapping_gsap_tweens`: encadenar con cursor de tiempo acumulado (ver `camera-techniques.md`); no tipear horarios a mano.
8. Fuentes: cargar por `<link>` de Google Fonts; el compilador las baja. No usar fuentes no resolubles (`Arial Narrow` falló). Verificar la tipografía en el snapshot. Arial como default está prohibido (todos los videos se ven iguales).

## Determinismo (render por frames, seeks fuera de orden)
9. Todo valor es función de `tl.time()`: sin `Math.random()`, `Date.now()`, `requestAnimationFrame` ni animaciones CSS libres. PRNG con semilla (mulberry32).
10. **Sin callbacks para cambiar estado** (`tl.call`): los seeks saltan y el callback no corre. Usar tweens de `opacity`/`set` (los contadores 01/04 son 4 spans con opacidad).
11. `onUpdate` de un tween funciona al hacer seek (contador, canvas). Para Three.js, usar `onUpdate` del timeline, no de un tween que empieza en 0.
12. El canvas de cierre (partículas) tiene `opacity:0` hasta su momento; si no, se ven los puntos dispersos desde el inicio.

## Layout y contenido
13. **Calcular la altura del contenido:** el calendario de 5 filas necesitaba 853 px y la tarjeta tenía 680 → la última fila quedaba afuera. Medir antes de fijar tamaños.
14. **Texto vs. objeto:** ubicar el objeto del lado opuesto al texto (offset de `lookAt`); verificar con snapshot que no se pisen.
15. **Capas fantasma (RGB split):** `white-space:nowrap` y el MISMO `font-size` que el texto principal, o se parten en dos líneas.
16. **Selectores:** `#s2.scan::after` (el mismo elemento), no `#s2 .scan::after`.
17. **Spread de argumentos:** `camX(...[cx,cy], s)` rompe los parámetros; pasar `camX(cx, s)` explícito.
18. **Cargar todo, animar al llegar:** no hacer fade-in por widget; todo visible desde el frame 0, y cada widget dispara su animación propia cuando la cámara lo enfoca.
19. **Cámara sin cortes:** nada de `gsap.set` + cambio de `transform-origin` entre tomas (salta). Origen fijo + keyframes encadenados.

27. **`fromTo` con estado inicial VISIBLE se pinta desde el frame 0** (`immediateRender` por defecto es true): un flare con `{opacity:.9}` quedó como una línea fina visible durante todo el video del perro. → Para elementos que deben estar ocultos hasta su momento: `opacity:0` en CSS + `immediateRender:false` en el `fromTo`. Los `fromTo` que parten de `opacity:0` no tienen el problema.
28. **Barridos de luz con `skewX`:** la esquina superior asoma dentro del marco y deja una cuña. Partir muy afuera (`left:-800px`) y animar `x`.
29. **Glows rectangulares:** un `radial-gradient(ellipse ...)` en una caja con `inset` negativo se corta en el borde si el degradé no llega a transparente dentro de la caja. Usar `closest-side ... transparent 100%`.

## Contenido y legal
20. **Nunca inventar** hechos, cifras, fechas ni citas. Los datos vienen del usuario con su fuente.
21. **Marcas:** no redibujar logos reales de memoria ni bajarlos de internet "porque son CC0" (Simple Icons: CC0 cubre el dibujo, no la marca). Logos solo con assets/permiso del cliente; si no, marca genérica ("Volt EV").
22. **Mockups de Apple:** los bezels oficiales NO se pueden animar, inclinar ni renderizar en 3D y exigen Apple Developer Program. No usarlos en tomas con cámara/tilt; construir marcos genéricos propios en CSS/SVG.
23. **Estilo vox-explainer:** prohíbe typewriter en titulares, glow en texto, rebotes y gradientes sobre texto. Si el estilo elegido es ese, respetarlo. (Typewriter sí vale dentro de un mockup de chat.)

## Honestidad sobre verificación
24. La IA no ve el video en movimiento: verifica con frames. Decir qué se verificó y qué no.
25. Los formatos/opciones marcados `untested` en `pools.json` nunca se renderizaron: avisar y validar con snapshots antes de prometer resultado.

## Rendimiento
26. Three.js con captura por software: ~5 min por 30 s. Mapa procedural (~2000 nodos SVG) + bokeh + `backdrop-filter`: ~3.5 min por 12 s. Iterar con snapshots; renderizar una vez.
