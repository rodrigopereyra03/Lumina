# Técnicas de cámara (probadas)

## Mapa de ids del motor de variedad → receta
| id (`pools.json`) | Qué es | Receta | Estado |
|---|---|---|---|
| `fixed-origin-shots` | Cámara que vuela de widget a widget | §1-3 | probada (widget-wall-*) |
| `threejs-proxy-flythrough` | Vuelo por un mundo Three.js | §4-5 | probada (flythrough-3d-cine) |
| `continuous-drift-3d-type` | Deriva larga sobre un mapa + palabras con cámara 3D propia | §6-7 | probada (map-kinetic-type-glitch) |
| `css-parallax-drift` | Cámara "quieta" pero el mundo vive: capas de fondo con parallax (`backgrounds.md` → shape-drift-parallax / seeded-particles) y entradas con rotación/escala | `backgrounds.md` | probada (editorial-cards-particles); no hay movimiento del stage completo |
| `css-3d-tilt-cards` | Tarjetas que giran/inclinan en 3D con `perspective` en el contenedor (flip, tilt de entrada con `rotationX 35°`) | `shot-types.md` → flip-card-3d | probada (dark-3d-flip-cards) |
| `locked-off` | Plano fijo: no se mueve la cámara; todo el movimiento ocurre en los elementos (barras que crecen, enfoque secuencial, partículas) | sin receta de cámara: solo mantener el stage quieto y mover elementos | probada (data-infographic-particle-logo) |

## 1. Cámara 2D/3D con origen fijo (widget wall)
Un único `transform-origin: 0 0` en el contenedor ("stage") y `perspective` en el padre. Para centrar el punto (cx,cy) con escala S:
```js
const VP_CENTER_X = 960, VP_CENTER_Y = 540;          // centro del viewport
const camX = (cx, s) => VP_CENTER_X - cx * s;
const camY = (cy, s) => VP_CENTER_Y - cy * s;
tl.to('#stage', { x: camX(cx,s), y: camY(cy,s), scale: s, rotationY: angle, duration, ease }, start);
```
Por qué funciona: x e y son función lineal de la escala; si `x, y, scale` se animan con la misma duración y el mismo ease, el punto enfocado queda anclado al centro durante todo el zoom. Pasar `camX(cx, s)` con UN valor + la escala (error previo: `camX(...[cx,cy], s)` pasaba mal los argumentos).

CSS necesario:
```css
#viewport { perspective: 1700px; overflow: hidden; }
#stage { transform-style: preserve-3d; transform-origin: 0 0; }
```

## 2. Cursor de tiempo acumulado
Evita tipear horarios a mano (generan huecos o solapes y el lint avisa `overlapping_gsap_tweens`).
```js
let cursor = 0;
function moveTo(cx, cy, scale, angle, duration, ease) {
  const start = cursor;
  tl.to('#stage', { x: camX(cx,scale), y: camY(cy,scale), scale, rotationY: angle, duration, ease }, start);
  cursor += duration; return start;
}
function hold(s) { cursor += s; }
```
Cada tramo arranca donde terminó el anterior: nunca hay corte. Las animaciones de widget se disparan con `t + offset` del valor que devuelve `moveTo`.

## 3. Transición de 3 fases (en vez de corte)
alejar (scale ~0.8, ease `power1.in`, 0.45 s) → paneo de costado a escala ancha (ease `power1.inOut`, 0.6-0.75 s, ángulo ±16-22°) → acercar (ease `power3.out`, 0.8-0.85 s, ángulo residual ±3-9°). Alternar el signo del ángulo entre tomas para dar variedad. Mantener 0.45-0.6 s de calma al llegar antes de la siguiente.

## 4. Cámara Three.js con proxy
```js
const C = { px:0, py:.5, pz:14, lx:0, ly:-.7, lz:0 };     // proxy animable
function renderWorld(t){ /* animar objetos con t */ camera.position.set(C.px,C.py,C.pz); camera.lookAt(C.lx,C.ly,C.lz); renderer.render(scene,camera); }
const tl = gsap.timeline({ paused:true, onUpdate: () => renderWorld(tl.time()) });   // onUpdate a nivel TIMELINE
function cam(px,py,pz,lx,ly,lz,dur,ease){ tl.to(C,{px,py,pz,lx,ly,lz,duration:dur,ease},cur); const s=cur; cur+=dur; return s; }
```
Importante: el render va en el `onUpdate` del timeline y no en un tween auxiliar; un tween que arranca en 0 se actualiza ANTES que los tweens de cámara y renderiza valores viejos.

Trayecto que funcionó (4 beats de ~4.4 s): vuelo (2.0 s `power2.inOut`) + órbita lateral (2.4 s `sine.inOut`), alternando ángulos: lateral, bajo, picado, lateral opuesto; cierre con plano general (3 s) y niebla que se abre.

## 5. Offset de lookAt para dejar espacio al texto
Para que un objeto quede a la izquierda del cuadro (texto a la derecha), apuntar la cámara a un punto desplazado hacia la derecha del objeto: `lookAt(obj.x + 3, obj.y, obj.z)`. Objeto a la derecha → `obj.x - 3`. Verificar con snapshot que el objeto no pise el texto; si pisa, alejar la cámara o bajar la escala del objeto (la cruz veterinaria se bajó a 0.85).

## 6. Cámara de mapa / deriva continua
Un solo `fromTo` largo (`power1.inOut`) de `{x,y,scale,rotation}` sobre un canvas más grande que el viewport (2560x1600 para 1920x1080). Para dar vida: leve rotación (-2.5°) y zoom 0.8→1.12.

## 7. Texto con cámara propia
Contenedor `perspective:1300px` + cada palabra con ángulo de entrada distinto y deriva orbital durante el hold (ver `kinetic-3d-word` en shot-types.md). Rangos usados: entrada rotationY ±70, rotationX 70, z -400…-600; deriva ±14-22°.

## 8. Reglas
- Rotaciones de cámara sostenidas de 5-15° (más es teatral); entradas pueden venir de ±70° si se asientan rápido.
- Mover el mundo (contenedor), no cada elemento.
- Un solo foco por beat; lo secundario se atenúa (bokeh, blur).
