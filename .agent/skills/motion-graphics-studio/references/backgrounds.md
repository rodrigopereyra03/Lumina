# Catálogo Maestro de Fondos Vivos (Motion Backgrounds)

Regla de oro: **Un fondo estático se lee como PowerPoint aunque el primer plano esté animado.** 
Combinar siempre 2 capas: una capa de geometría/atmósfera activa + una capa de textura/partículas vivas. Todo el movimiento debe ser 100% determinístico y sincronizado con el timeline de GSAP.

---

## 1. Topographic Isolines (`topographic-isolines`)
*Inspiración: Mapas de elevación topográfica, Arc'teryx, Apple Watch Ultra, Tech cartográfico de lujo.*
Líneas de contorno cerradas u ondulantes que respiran o derivan suavemente en pantalla.
* **En código (Canvas 2D determinístico o SVG procedural):**
```javascript
// Render loop atado a GSAP uTime:
function drawTopo(ctx, width, height, time) {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1.5;
  const numRings = 18;
  const cx = width * 0.5;
  const cy = height * 0.55;
  for (let r = 0; r < numRings; r++) {
    const baseRadius = 60 + r * 55;
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2; a += 0.08) {
      // Deformación senoidal determinística
      const noise = Math.sin(a * 4 + time * 0.8 + r * 0.5) * 22 + Math.cos(a * 2 - time * 0.5) * 16;
      const rad = baseRadius + noise;
      const x = cx + Math.cos(a) * rad;
      const y = cy + Math.sin(a) * rad * 1.3; // Relación vertical para celular
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
}
```

---

## 2. Cyber Horizon Grid (`cyber-horizon-grid`)
*Inspiración: Tron, Synthwave, Sci-Fi HUD, estética 80s/Cyberpunk moderna.*
Plano en perspectiva 3D con grilla luminosa que fuga hacia un horizonte infinito con resplandor neón (cian, violeta o dorado) y degradado superior hacia negro profundo.
* **En código (CSS 3D puro o Three.js GridHelper):**
```html
<div class="horizon-stage">
  <div class="horizon-glow"></div>
  <div class="perspective-grid-plane"></div>
  <div class="horizon-vignette-top"></div>
</div>
<style>
  .horizon-stage {
    position: absolute; inset: 0; overflow: hidden; perspective: 450px;
    background: #04050a;
  }
  .horizon-glow {
    position: absolute; top: 48%; left: 0; right: 0; height: 160px;
    background: radial-gradient(ellipse at 50% 50%, rgba(56, 189, 248, 0.45) 0%, rgba(99, 102, 241, 0.2) 40%, transparent 75%);
    filter: blur(40px); z-index: 2;
  }
  .perspective-grid-plane {
    position: absolute; top: 50%; left: -50%; width: 200%; height: 200%;
    transform: rotateX(76deg) translateZ(0);
    transform-origin: top center;
    background-size: 60px 60px;
    background-image: 
      linear-gradient(to right, rgba(56, 189, 248, 0.28) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(56, 189, 248, 0.28) 1px, transparent 1px);
    mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 85%);
  }
  .horizon-vignette-top {
    position: absolute; top: 0; left: 0; right: 0; height: 55%;
    background: linear-gradient(to bottom, #04050a 60%, transparent 100%);
    z-index: 3;
  }
</style>
```

---

## 3. Studio Minimalist Tile Floor (`studio-tile-floor`)
*Inspiración: Showrooms industriales, galerías de arte, estética Apple/Braun, renders limpios en blanco o gris grafito.*
Cuadrícula isométrica o en perspectiva cenital con baldosas sutiles y luz de estudio suave con sombra de oclusión.
* **En código:**
```css
.studio-floor {
  position: absolute; inset: 0;
  background-color: #0e1117;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 80px 80px;
  background-position: center center;
}
.studio-spotlight {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.12) 0%, transparent 65%);
}
```

---

## 4. Kinetic Sunburst & Speedlines (`kinetic-sunburst-rays`)
*Inspiración: Manga, Anime, Reels de alto impacto, TikTok trends, pop-art retro.*
Rayos cónicos que giran continuamente y se contraen o expanden con la música o beats del video.
* **En código (CSS Conic Gradient determinístico):**
```html
<div class="sunburst-rays"></div>
<style>
  .sunburst-rays {
    position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
    background: repeating-conic-gradient(
      from 0deg,
      rgba(220, 38, 38, 0.85) 0deg 15deg,
      rgba(153, 27, 27, 0.95) 15deg 30deg
    );
    opacity: 0.8;
  }
</style>
<script>
  // Rotación continua determinística en GSAP:
  tl.to('.sunburst-rays', { rotation: 360, duration: 20, ease: 'none' }, 0);
</script>
```

---

## 5. Checkered Warp Tunnel (`checkered-warp-tunnel`)
*Inspiración: Túneles ópticos de damero blanco/negro o cian/magenta, psicodelia 3D, videos de música electrónica y skate.*
Malla en espiral con cuadros alternados que viajan hacia la cámara simulando una caída libre dimensional.
* **En Three.js:** `CylinderGeometry` invertido con textura de tablero de ajedrez procesada con shader donde `vUv.y += uTime * speed` y deformación de torsión en el vértice (`position.x += sin(position.z)`).

---

## 6. Wavy Distorted Grid (`wavy-distorted-grid`)
*Inspiración: Grillas deformadas por ondas gravitacionales, membranas físicas, estética Acid Graphics.*
Malla vectorial ortogonal cuyas intersecciones se distorsionan mediante ondas senoidales tridimensionales.
* **En Canvas / Three.js Wireframe:** Una malla `PlaneGeometry(20, 30, 40, 60)` donde en cada frame se calcula `vertex.z = sin(vertex.x * 0.5 + time) * cos(vertex.y * 0.4 + time) * 1.5`.

---

## 7. Kinetic Typography Wall (`kinetic-text-wall`)
*Inspiración: Fondos con palabras gigantes repetidas en diagonal (ej. "FEVER", "POWER", "DISRUPT", "INNOVATE"), póster suizo cinético.*
Líneas de texto colosales en ángulo de -15° a -25° que se desplazan en sentidos opuestos con `opacity: 0.15` detrás de los títulos principales.
* **En código:** 4 a 6 bandas horizontales con `white-space: nowrap; font-family: 'Syne 800' o 'Anton'; font-size: 160px; text-transform: uppercase;`. GSAP anima alternativamente `x: "+=800"` y `x: "-=800"` en loop determinístico.

---

## 8. Fire Embers & Floating Sparks (`fire-embers-sparks`)
*Inspiración: Chispas de fuego ascendentes, cenizas incandescentes, trailers épicos / gladiador / dark fantasy.*
Partículas brillantes de color ámbar y naranja que ascienden verticalmente con turbulencia horizontal oscilante y destello variable.
* **En Canvas 2D / Three.js:**
```javascript
// Cada chispa tiene velocidad vertical hacia arriba (-vy) y fluctuación senoidal en X:
p.y -= p.speedY * dt;
p.x += Math.sin(p.y * 0.02 + time * 3.0) * 1.2;
p.alpha = Math.sin(time * 5.0 + p.seed) * 0.3 + 0.7;
```

---

## 9. Concentric Pulsing Neon Tunnel (`concentric-neon-tunnel`)
*Inspiración: Portales de luz circular, hipnosis visual, portales interdimensionales.*
Series de 15 a 30 anillos concéntricos con `border: 2px solid neon` y desenfoque `box-shadow` que aumentan su escala desde el centro hacia afuera o se adentran en fuga z.

---

## 10. Crumpled Paper & Analog Collage (`crumpled-paper-stopmotion`)
*Inspiración: Estética scrapbook analógica, stop-motion, papel kraft rasgado, fanzines punk y documentales de autor.*
Fondo con textura de arrugas de papel de alta resolución sobre el cual la iluminación parpadea a 12 fps (*stepped motion*) simulando película analógica.
* **En código:** Filtro SVG con `feTurbulence type="fractalNoise"` combinado con `feDiffuseLighting` para generar arrugas 3D matemáticas sin cargar imágenes externas pesadas.

---

## 11. Halftone Wave Field (`halftone-wave-field`)
*Inspiración: Isaac Rees Worship Backgrounds, tramas de imprenta de cómic vintage, arte óptico.*
Grilla de círculos cuyo radio se modula según una onda de brillo en movimiento. Los puntos crecen y se encogen creando formas volumétricas sin usar colores planos.

---

## 12. Bolt Motion & Electric Lightning (`bolt-energy-lightning`)
*Inspiración: Magnific Bolt Motion, rayos y arcos eléctricos, energía pura, alto impacto deportivo o gaming.*
Trazados vectoriales de relámpagos con bifurcaciones fractales procedurales que destellan en momentos de impacto rítmico.
* **En código:** Algoritmo Midpoint Displacement determinístico para generar caminos SVG de rayos (`<path d="...">`) con `stroke: #38bdf8; filter: drop-shadow(0 0 15px #38bdf8)`.

---

## 13. Optical Spiral Vortex (`optical-spiral-vortex`)
*Inspiración: Foto 4 (Vórtice Alight Motion, túnel espiral hipnótico rojo/negro).*
Espiral logarítmica de alto contraste que gira continuamente creando un efecto de absorción hacia el centro del encuadre.
* **En código (Canvas 2D / CSS):**
```html
<div class="spiral-vortex"></div>
<style>
  .spiral-vortex {
    position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
    background: repeating-radial-gradient(circle at center, #dc2626 0, #000 15px, #dc2626 30px);
    mask-image: radial-gradient(circle, black 40%, transparent 80%);
  }
</style>
```

---

## 14. Diagonal Kinetic Stripes (`diagonal-stripes-accent`)
*Inspiración: Foto 4 (Franjas diagonales rojo y blanco estilo advertencia/pop).*
Bandas inclinadas a 45° que se desplazan infinitamente con velocidad lineal o con tirones en los beats de corte.
* **En código:** `background: repeating-linear-gradient(45deg, #e11d48, #e11d48 30px, #ffffff 30px, #ffffff 60px);` animando `background-position` determinísticamente.

---

## 15. Cosmic Plasma & Energy Portal (`plasma-energy-portal`)
*Inspiración: Foto 5 ("Phonk Montagem Alquimia" y portal azul de energía).*
Núcleo esférico brillante con ondas de choque circulares y distorsión de ruido de plasma que emite resplandores volumétricos hacia la cámara.

---

## 16. Infinite 3D Light Pillars (`infinite-light-pillars`)
*Inspiración: Foto 5 ("Relaxing Conceptual Visual Art" con matriz infinita dorada).*
Rejilla tridimensional en Three.js con miles de filamentos verticales de luz y partículas doradas en perspectiva Z con profundidad de campo (DoF).

---

## 17. Floating Glass Spheres (`floating-glass-spheres`)
*Inspiración: Foto 5 (Burbujas flotantes de vidrio multicolor con refracción).*
Esferas 3D con shader `MeshPhysicalMaterial` (transmisión 0.95, rugosidad 0.05, refracción 1.5) flotando con física de gravedad cero y reflejando las luces de la escena.

---

## 18. Fondos Clásicos Preexistentes (Mantienen su vigencia)
* **`three-fog-dust`**: Niebla volumétrica 3D + enjambre de 400-800 partículas en Three.js.
* **`mesh-gradient`**: Mallas dinámicas de colores suaves en desenfoque gausiano pesado (`blur(80px)`).
* **`radial-glow`**: Resplandor central para destacar tarjetas o cajas tipográficas.
* **`seeded-particles`**: Nieve o polvo cuántico matemático en Canvas 2D.
* **`bokeh-circles`**: Círculos desenfocados simulando lente cinematográfico $f/1.4$.
* **`procedural-city-map`**: Mapa urbano en SVG con manzanas y carreteras en paneo continuo.
