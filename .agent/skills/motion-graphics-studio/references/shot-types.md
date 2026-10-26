# Catálogo de tomas (shot types)

Cada entrada: qué es, cuándo usarla, receta mínima, y dónde está construida y probada (`examples/`). Todas se renderizaron con HyperFrames + `--no-browser-gpu`. Los snippets asumen `const tl = gsap.timeline({paused:true})` y `window.__timelines["main"] = tl`.

Reglas que valen para todas: cada beat dura ≤ 4-5 s salvo que haya locución; el fondo nunca está quieto; un solo foco de movimiento por beat; todo valor es función del tiempo (sin `Math.random()` ni callbacks).

---

## Aperturas

### kinetic-question
Pregunta grande que promete algo (primeros 3 s). Kicker + titular + barra de acento que crece.
```js
tl.fromTo('.kicker',{opacity:0,y:-20},{opacity:1,y:0,duration:.3},.05);
tl.fromTo('.headline',{opacity:0,y:30,scale:.92},{opacity:1,y:0,scale:1,duration:.4,ease:'back.out(1.8)'},.2);
tl.to('.bar',{width:420,duration:.5},.6);
```
Ejemplos: editorial-cards-particles.html, data-infographic-particle-logo.html.

### abstract-shapes-morph
Formas monocromáticas (rectángulos redondeados) que se funden con la primera tarjeta real. La tarjeta real ya está debajo; las formas hacen fade+scale up.
```js
tl.to('#introShapes',{opacity:0,scale:1.04,duration:.6,ease:'power2.inOut'},t+.8);
```
Ejemplo: widget-wall-camera-shots.html.

### letterbox-reveal
Barras negras que arrancan gruesas (330 px) y se cierran a 110 px: da "efecto cine" inmediato.
```js
tl.fromTo('#barTop',{height:330},{height:110,duration:1.6,ease:'power3.out'},0);
tl.fromTo('#barBottom',{height:330},{height:110,duration:1.6,ease:'power3.out'},0);
```
Ejemplo: flythrough-3d-cine.html.

### 3d-dolly-title
Escena Three.js con objetos orbitando, dolly lento de cámara, título en el tercio inferior (los objetos quedan arriba apuntando `lookAt` un poco más abajo). Ver `worlds-3d.md`.

### counter-hook
Número que cuenta como odómetro como gancho ("0→4 cosas simples"). Ver `counter-odometer`.

### map-drift-word
Mapa procedural a la deriva con una palabra enorme encima. Ver `backgrounds.md` (procedural-city-map) y `kinetic-3d-word`.

---

## Tomas núcleo

### paper-cards
Tarjeta de papel rasgado: `clip-path: polygon(...)` irregular + sombra plana desplazada. Entrada con rotación y overshoot.
```js
tl.fromTo(card,{opacity:0,x:from*60,rotation:from>0?8:-8,scale:.8},{opacity:1,x:0,rotation:0,scale:1,duration:.4,ease:'back.out(2.2)'},t);
tl.fromTo(icon,{scale:0,rotation:-30},{scale:1,rotation:0,duration:.35,ease:'back.out(3)'},t+.1);
```
Nota: clip-path pesado puede dar pantalla negra con captura GPU → siempre `--no-browser-gpu`. Ejemplo: editorial-cards-particles.html.

### flip-card-3d
Tarjeta que gira en Y revelando la cara trasera. Requiere `perspective` en el contenedor, `transform-style:preserve-3d` y `backface-visibility:hidden` en ambas caras (la trasera con `rotateY(180deg)`).
```js
tl.fromTo('#flip',{opacity:0,rotationY:-120,scale:.8},{opacity:1,rotationY:0,scale:1,duration:.6,ease:'power3.out'},t);
tl.to('#flip',{rotationY:180,duration:.6,ease:'power2.inOut'},t+1.7);
```
Ejemplo: dark-3d-flip-cards.html.

### label-callout
Un anillo se dibuja alrededor de un objeto y luego aparece la etiqueta.
```js
tl.fromTo('#ring',{opacity:0,scale:.5},{opacity:1,scale:1.25,duration:.5,ease:'power2.out'},t);
tl.to('#ring',{opacity:0,duration:.3},t+.6);
tl.fromTo('.label',{opacity:0,y:16},{opacity:1,y:0,duration:.4,stagger:.1},t+.4);
```

### counter-odometer
Objeto proxy + `onUpdate` escribe en `textContent`. Con `steps(n)` cuenta como odómetro. `onUpdate` de GSAP también corre al hacer `seek`, así que es compatible con render por frames.
```js
const o={val:0};
tl.to(o,{val:4,duration:1,ease:'steps(4)',onUpdate:()=>{el.textContent=Math.round(o.val)}},t);
```

### grid-pattern-break
12 tiles idénticos que aparecen en cascada y uno cambia de color/escala ("rompe el patrón").
```js
tl.fromTo('.tile',{opacity:0,scale:.4,rotation:-15},{opacity:1,scale:1,rotation:0,duration:.3,stagger:.035,ease:'back.out(2.5)'},t);
tl.to('#special',{backgroundColor:'#F2C230',scale:1.15,duration:.3,ease:'back.out(3)'},t+.95);
```

### chart-morph-bars
Barras horizontales que crecen; la etiqueta de dato va DENTRO de la barra (`position:absolute;right:-10px`) para viajar con ella sin animar `left`.
```js
tl.to(bar,{width:'85%',duration:.7,ease:'power3.out'},t);
tl.fromTo(tag,{opacity:0,y:6},{opacity:1,y:0,duration:.3},t+.5);
```
Solo con datos reales entregados por el usuario. Ejemplo: data-infographic-particle-logo.html.

### glass-focus
Tarjetas desenfocadas (filter blur 5px, opacity .55, scale .95) que se enfocan una a una; al final todas nítidas. `filter:blur()` se anima directo con GSAP.
```js
tl.to(sel,{filter:'blur(0px)',opacity:1,scale:1.04,duration:.3},t0);
tl.to(sel,{filter:'blur(5px)',opacity:.55,scale:.95,duration:.3},t0+.55);
```

### stroke-draw-route
Línea que se traza sola: medir el largo real y animar `stroke-dashoffset`.
```js
const len=path.getTotalLength(); path.style.strokeDasharray=len; path.style.strokeDashoffset=len;
tl.to(path,{strokeDashoffset:0,duration:1.3,ease:'power2.inOut'},t);
```

### widget-live-anim
Widgets de UI propios (calendario, reloj, batería, mapa, carga). Dos tipos de animación: **continuas** (agujas del reloj, función de `tl.time()`) y **disparadas al enfocar** (batería, ruta, barra de carga). Todo cargado desde el frame 0; no usar fade-in por widget. Ver `camera-techniques.md` (fixed-origin-shots). Marca genérica ("Volt EV"), nunca logos reales. Ejemplo: widget-wall-camera-shots.html.

### particle-logo-close
~1000 partículas que convergen en una silueta muestreada de un canvas off-screen (elipses para una huella; también sirve para texto/forma). Semilla fija. Fase 1: converger con `power3.out`; fase 2: shimmer leve.
```js
// muestrear: dibujar la silueta en un canvas off-screen y juntar píxeles con alpha>120 cada 6 px
// animar: x = sx + (tx-sx)*p ; y = sy + (ty-sy)*p + sin(shimmer*3+i)*1.5
```
El canvas de cierre debe estar con `opacity:0` hasta que empiece, o se ven los puntos dispersos desde el inicio. Ejemplos: data-infographic-particle-logo.html, flythrough-3d-cine.html.

### 3d-object-per-beat
Cada idea es un objeto 3D (tazón, huella, cruz, corazón) con luz puntual de su color; la cámara vuela de uno a otro. El texto va del lado opuesto (ver `camera-techniques.md`, offset de lookAt). Ver `worlds-3d.md`. Ejemplo: flythrough-3d-cine.html.

### kinetic-3d-word
Palabra enorme dentro de un contenedor con `perspective:1300px`; cada palabra entra con un ángulo distinto (rotationY ±70, rotationX 70, rotationZ 6) y sigue orbitando mientras se mantiene.
```js
tl.set(sel,{opacity:1,x:-420,z:-500,rotationY:-70,scale:.8,filter:'blur(12px)'},t);
tl.to(sel,{x:0,z:0,rotationY:-22,scale:1,filter:'blur(0px)',duration:.35,ease:'power3.out'},t);
tl.to(sel,{rotationY:14,z:90,duration:2.85,ease:'sine.inOut'},t+.35);
```
Ejemplo: map-kinetic-type-glitch.html.

### rgb-split-glitch
Dos copias de la palabra (cian y magenta) con `mix-blend-mode:screen`, `white-space:nowrap` y MISMO `font-size` que la principal. Al entrar se desplazan ±6-7 px y se acomodan en ±2 px, con un flash blanco de 0.03 s.

### ghost-trails-type
Motion blur falso: N copias con opacidad decreciente y retraso escalonado (usar clases, no ids duplicados). Con N=6 se empasta: preferir 3-4 copias o más separación.

### anamorphic-flare
Línea horizontal de 5 px con gradiente `transparent → luz cálida → transparent`, blur 2 px, que se abre en scaleX y se desvanece al entrar cada título.
```js
tl.fromTo('#streak',{opacity:.9,scaleX:.15},{opacity:0,scaleX:1,duration:.9,ease:'power2.out'},t);
```

### typewriter-in-mockup
El efecto de tipeo SOLO dentro de un mockup de interfaz (simula alguien escribiendo en un chat). Para titulares reveladores está prohibido (ver lockdowns). Compatible con seek: un proxy `{k}` tweeneado con `ease:'none'` y un `onUpdate` que reescribe el texto; las últimas 3 letras se pintan de acento y el cursor parpadea con `Math.floor(tl.time()*2.2)%2` desde el `onUpdate` del timeline (no CSS).
```js
const tp = { k: 0 };
tl.to(tp, { k: TEXT.length, duration: 2.7, ease: 'none', onUpdate: () => renderTyped(Math.floor(tp.k)) }, t);
// renderTyped(k): texto[0..k-3] + <span class="hl">texto[k-3..k]</span> + caret
```
Caja de chat: borde de 2 px naranja + dos `radial-gradient` detrás (arriba y abajo) como glow (no `box-shadow` grande), barra inferior con "+", selector de modelo, micrófono, ondas y botón de envío que se "aprieta" (scale .88 → 1 con `back.out(3)`). Íconos dibujados a mano en SVG (sin librería ni marca). Ejemplo: ui-mockup-demo.html.

### brand-pills-reveal
Apertura de marca: destello de 4 puntas propio (símbolo SVG reutilizable con `<symbol>`/`<use>`), dos "pastillas" brillosas con gradiente cálido que se abren en `scaleX` desde el origen izquierdo, y wordmark en serif que entra con blur → nítido. Marca genérica o provista por el cliente; no copiar logos reales.
```js
tl.fromTo('#spark',{scale:0,rotation:-90,opacity:0},{scale:1,rotation:0,opacity:1,duration:.7,ease:'back.out(2)'},.2);
tl.fromTo('#pill1',{scaleX:0,opacity:0},{scaleX:1,opacity:1,duration:.55,ease:'power3.out'},.55);   // transform-origin: 0 50%
tl.fromTo('#wordmark',{opacity:0,x:40,filter:'blur(12px)'},{opacity:1,x:0,filter:'blur(0px)',duration:.7,ease:'power3.out'},1.0);
```

### browser-window-3d
Ventana de navegador GENÉRICA (barra con 3 puntos y píldora de dirección, sin logos ni bezels de Apple) dentro de un contenedor con `perspective:1800px`. Entra inclinada (rotationY -46°, rotationX 14°, z -300) y se asienta, luego deriva (rotationY +9°, z +80) durante ~4.4 s. La página se "genera" por etapas: navegación → eyebrow → titular línea a línea (blur → nítido, stagger .28) → botones (`back.out(1.6)`).
Glow de la ventana: `radial-gradient(ellipse closest-side at 55% 70%, color, transparent 100%)` (con `farthest-corner` por defecto el degradé se corta en el borde de la caja y se ve un rectángulo).
Ejemplo: ui-mockup-demo.html.

### code-backdrop
Columna de código de fondo (monoespaciada, ~22 px, tokens en 3 colores del acento) que sube lentamente detrás del mockup, con `filter:blur(1.5px)`, opacidad .55 y `mask-image` en degradé arriba/abajo. Es texto decorativo: inocuo, pero no mostrarlo como si fuera código real del producto.
```js
tl.fromTo('#codeInner',{y:300},{y:-900,duration:6.4,ease:'none'},t);
```

### sweep-highlight
Barrido de luz diagonal sobre una pieza "terminada" (gradiente blanco semitransparente con `skewX(-18deg)`). Dos trampas: animar `x` (no `left`, el lint lo rechaza) y partir MUY afuera (`left:-800px`), porque el skew hace asomar la esquina superior dentro del marco y se ve una cuña gris. Usar `immediateRender:false`.

### spark-tagline
Cierre: el destello de la marca entra con `back.out(2)` girando desde -120° y la frase en serif itálica entra con blur → nítido; flare anamórfico al aparecer la frase.

---

## Cierres

### kinetic-statement
Frase corta (≤5 palabras) con escala+overshoot y barra de acento.

### counter-final
El número final del dato, contado con `counter-odometer`, con etiqueta.

### wide-pullback-fade
Plano general que retrocede mientras la niebla/fondo se abre; fundido a negro.

### particle-logo-close
Ver arriba.
