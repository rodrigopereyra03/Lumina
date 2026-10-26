# Efectos y técnicas (CSS / SVG / Canvas)

Aviso de método: los snippets son composiciones propias basadas en las propiedades documentadas en MDN; NO fueron probados en el pipeline HyperFrames (se indica "no probado"). El "costo de render" es una estimación cualitativa (bajo/medio/alto), NO VERIFICADO con mediciones. Las advertencias de pantalla negra provienen de la experiencia del equipo (mix-blend-mode, box-shadow muy grande, clip-path pesados con captura GPU; se renderiza con `--no-browser-gpu`).

## Reglas globales para render determinístico por frames
1. Todo valor animado debe ser función del tiempo del timeline (GSAP `paused`, seek por frame). Nada de `Math.random()` por frame, `Date.now()`, ni animaciones CSS infinitas libres: usar `seed` fijo / PRNG con semilla.
2. Preferir `transform` y `opacity`; evitar animar `filter: blur()` grande, `box-shadow` y `clip-path` por frame.
3. Preferir capas estáticas pre-compuestas (un `<div>` con gradiente) sobre filtros recalculados cada frame.
4. Si la escena se ve negra: quitar primero `mix-blend-mode`, luego `backdrop-filter`, luego sombras grandes, y sustituir por opacidad + gradientes.
5. MDN: `mix-blend-mode` y `filter`/`opacity<1`/`clip-path`/`mask`/`backdrop-filter` crean stacking context o "backdrop root", lo que rompe `backdrop-filter` de los hijos y cambia resultados de mezcla. Usar `isolation: isolate` en el contenedor si se usa blend.

---

## 1. Glow / neón / bloom (cálido y frío)
Receta preferida: `radial-gradient` detrás del elemento (barato) + `text-shadow` pequeño o `filter: drop-shadow` moderado.
```css
/* glow cálido por radial-gradient (recomendado, sin blur) */
.glow-warm{position:absolute;width:900px;height:900px;border-radius:50%;
  background:radial-gradient(circle,rgba(232,116,59,.55) 0%,rgba(232,116,59,.18) 35%,transparent 70%);}
/* neón frío en texto */
.neon-cold{color:#e6fbff;text-shadow:0 0 6px #19e3ff,0 0 18px #19e3ff,0 0 40px rgba(25,227,255,.6);}
/* glow según alfa del PNG/SVG */
.logo{filter:drop-shadow(0 0 16px rgba(255,43,214,.7));}
```
- Costo: radial-gradient bajo; text-shadow medio; drop-shadow medio-alto si es grande.
- Advertencias: `box-shadow` con blur >60px o spread grande causó pantalla negra con captura GPU -> usar el radial-gradient. `drop-shadow` no admite `spread`/`inset`. Animar la opacidad del glow, no el blur.
- Fuentes: MDN drop-shadow(), MDN radial-gradient.

## 2. Bokeh / profundidad de campo
Círculos translúcidos con gradiente radial (bordes suaves) a distintos tamaños y opacidades; el desenfoque se simula con el gradiente, no con blur.
```css
.bokeh{position:absolute;border-radius:50%;
  background:radial-gradient(circle,rgba(255,255,255,.35) 0%,rgba(255,255,255,.12) 55%,transparent 72%);}
```
```js
// posiciones deterministas con PRNG con semilla
function rng(s){return()=> (s=(s*1664525+1013904223)%4294967296)/4294967296}
const r=rng(7); // mismo resultado en cada render
for(let i=0;i<24;i++){const d=document.createElement('div');d.className='bokeh';
  const sz=60+r()*260;d.style.cssText=`width:${sz}px;height:${sz}px;left:${r()*1920}px;top:${r()*1080}px;opacity:${.2+r()*.5}`;
  stage.appendChild(d);gsap.to(d,{y:-80-r()*120,duration:6,ease:'none'});}
```
- Profundidad: círculos grandes = más cercanos y se mueven más rápido (parallax).
- Costo: bajo (24-40 divs). Advertencias: `filter: blur(40px)` sobre el sujeto de fondo real puede ser costoso; precomputar fondo borroso como imagen si hace falta. No usar `mix-blend-mode: screen` aquí (ver reglas); la opacidad alcanza.
- Fuentes: MDN radial-gradient.

## 3. Scanlines / VHS / CRT
```css
.scanlines::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(to bottom,rgba(0,0,0,0) 0,rgba(0,0,0,0) 2px,rgba(0,0,0,.18) 3px,rgba(0,0,0,.18) 4px);}
```
- VHS: sumar desplazamiento horizontal por franjas (translateX pequeño con GSAP y seed fijo), ruido (ver grano) y aberración cromática (técnica 4).
- CRT: viñeta (técnica 8) + leve curvatura con `border-radius` grande en el contenedor + `text-shadow` de bloom.
- Costo: bajo (un gradiente estático). Advertencias: scanlines finas sobre video comprimido producen moiré; usar período 3-4px en 1080p. El equipo de HyperFrames tiene un bloque de registry para CRT scanlines (ver skill hyperframes-registry) -> revisar antes de hacerlo a mano.
- Fuentes: MDN repeating-linear-gradient.

## 4. Aberración cromática / RGB split
Opción barata (texto): tres capas con `text-shadow` coloreado desplazado.
```css
.rgb-split{color:#fff;text-shadow:-3px 0 rgba(255,0,60,.8),3px 0 rgba(0,200,255,.8);}
```
Opción SVG (elemento complejo): separar canales con feColorMatrix y desplazar con feOffset.
```html
<svg width="0" height="0"><filter id="rgb" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
  <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
  <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb"/>
  <feOffset in="r" dx="4" dy="0" result="r2"/>
  <feBlend in="r2" in2="gb" mode="screen"/>
</filter></svg>
<style>.glitch{filter:url(#rgb)}</style>
```
(no probado; animar `dx` por atributo con GSAP `attr`.)
- Costo: texto bajo; filtro SVG medio-alto sobre áreas grandes. Advertencia: `feBlend mode=screen` es modo de mezcla interno al filtro, pero filtros SVG sobre elementos grandes pueden fallar con captura GPU -> verificar con `--no-browser-gpu`.
- Fuentes: MDN feColorMatrix, MDN feOffset.

## 5. Film grain
Ruido con `feTurbulence` (fractalNoise) como capa estática encima, con `seed` distinto por "frame" si se quiere moverlo.
```html
<svg width="0" height="0"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="3" stitchTiles="stitch"/>
<feColorMatrix type="saturate" values="0"/></filter></svg>
<div class="grain"></div>
<style>.grain{position:absolute;inset:0;pointer-events:none;opacity:.12;filter:url(#grain);background:#888}</style>
```
Para "grano vivo" determinista: alternar entre 3-4 `seed` según `Math.floor(t*12)%4` dentro del timeline (no aleatorio libre).
- Costo: medio (se rasteriza una vez si es estático) a alto si se cambia el seed cada frame sobre 1920x1080. Alternativa más barata: pre-generar un PNG de ruido tileable y animar `background-position` por steps.
- Advertencias: el artículo de CSS-Tricks reporta posible impacto de rendimiento y diferencias Chrome/Safari con `mix-blend-mode`; evitar blend, usar opacidad baja.
- Fuentes: MDN feTurbulence, CSS-Tricks "Grainy Gradients".

## 6. Halftone
Trama de puntos con `radial-gradient` repetido, combinado con máscara/degradado para variar el tamaño.
```css
.halftone{background-image:radial-gradient(circle,#111 28%,transparent 30%);background-size:14px 14px;}
```
Variante "foto halftone": `filter: contrast(...)` sobre capa de puntos + imagen en `background-blend-mode: multiply` (no probado; `background-blend-mode` es distinto de `mix-blend-mode` pero verificar con --no-browser-gpu).
- Costo: bajo (patrón de fondo). Advertencia: puntos pequeños (<8px) generan moiré en compresión.
- Fuentes: MDN radial-gradient. (El artículo de CSS-Tricks sobre halftone devolvió 404: NO VERIFICADO.)

## 7. Motion blur falso (ghost trails)
Duplicar el elemento N veces con opacidad decreciente y retraso en el timeline (estela determinista).
```js
const N=6; for(let i=0;i<N;i++){
  const g=el.cloneNode(true); g.style.opacity=.5*(1-i/N); el.parentNode.insertBefore(g,el);
  tl.to(g,{x:900,duration:.8,ease:'power3.out'},0.04*(i+1)); }
tl.to(el,{x:900,duration:.8,ease:'power3.out'},0);
```
Alternativa: `filter: blur(Xpx)` en un solo eje con SVG `feGaussianBlur stdDeviation="12 0"`, con X ligado a la velocidad (derivada del ease).
- Costo: medio (N copias). Advertencia: clonar con IDs duplica ids; usar clases. No animar blur grande por frame.
- Fuentes: GSAP docs (posición en timeline), https://gsap.com/docs/v3/Eases/.

## 8. Viñeta
```css
.vignette{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.55) 100%);}
```
- Costo: bajo. Advertencia: sobre fondos con degradado suave puede acentuar banding; sumar grano leve.
- Fuentes: MDN radial-gradient.

## 9. Mesh gradient
CSS no tiene mesh nativo; se simula con varios `radial-gradient` superpuestos sobre un color base (MDN documenta capas múltiples de gradientes).
```css
.mesh{background:
  radial-gradient(at 20% 25%,#7C5CFF 0,transparent 50%),
  radial-gradient(at 80% 20%,#3DD6F5 0,transparent 45%),
  radial-gradient(at 70% 85%,#FF7A59 0,transparent 50%),
  #0B0B1A;}
```
Animación: mover `background-position` o, mejor, animar blobs `div` con `transform` (más barato y determinista). Opcional: interpolación `in oklab` en los gradientes (soportada en sintaxis moderna según MDN) para transiciones más limpias.
- Costo: bajo-medio (gradientes grandes por frame). Si anima `background` completo, pre-compuestos en capas con `transform`.
- Fuentes: MDN radial-gradient.

## 10. Glassmorphism
```css
.glass{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:24px;
  backdrop-filter:blur(18px) saturate(150%);}
```
- Costo: alto (blur del fondo por frame). Advertencias: MDN: `backdrop-filter` solo afecta hasta el "backdrop root" más cercano; un padre con `opacity<1`, `filter`, `mask`, `clip-path` o `mix-blend-mode` rompe el efecto. Con `--no-browser-gpu` puede ser lento o fallar: plan B = fondo semitransparente + borde + un blur "falso" (copia del fondo desenfocada estática detrás).
- Fuentes: MDN backdrop-filter.

## 11. Extra: perspectiva 3D / cámara
`perspective: 1200px` en el contenedor + `transform-style: preserve-3d` en el hijo; animar `rotateY/rotateX/z`. MDN: perspective crea stacking context; menor valor = efecto más fuerte.
- Costo: bajo-medio. Fuentes: MDN perspective.

## Fuentes
- https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/drop-shadow
- https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence
- https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
- https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode
- https://developer.mozilla.org/en-US/docs/Web/CSS/perspective
- https://developer.mozilla.org/en-US/docs/Web/CSS/radial-gradient
- https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/repeating-linear-gradient
- https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feColorMatrix
- https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feOffset
- https://css-tricks.com/grainy-gradients/
- https://gsap.com/docs/v3/Eases/
- https://css-tricks.com/how-to-create-halftone-effect-css/ (404, no verificado)
