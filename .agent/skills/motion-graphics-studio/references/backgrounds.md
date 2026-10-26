# Fondos vivos (probados)

Regla: un fondo estático lee como "PowerPoint" aunque el primer plano esté animado. Combinar 2 capas: una de formas/gradientes + una de partículas o bokeh. Mantener las capas debajo del contenido (`z-index` menor que las escenas).

## shape-drift-parallax
Círculos/anillos translúcidos en deriva lineal y rotación durante TODO el video; cada uno con velocidad y sentido distintos (parallax).
```js
tl.to('#bg1',{x:90,y:60,rotation:25,duration:DURATION,ease:'none'},0);
tl.to('#bg2',{x:-70,y:-90,rotation:-40,duration:DURATION,ease:'none'},0);
```
Ejemplo: editorial-cards-particles.html.

## seeded-particles
Canvas 2D con 65 partículas (r 5-12 px, opacidad .35-.75, `shadowBlur = r*2.5`), PRNG con semilla (mulberry32), posición = `(p.x + p.vx*t) % W`. `getContext('2d',{willReadFrequently:true})`.
**Tamaño:** las partículas de 1.5-4 px y opacidad <.3 desaparecen con la compresión H.264 y el escalado del player. Dimensionar generoso y verificar en el MP4 real, no solo en el snapshot.
Velocidad usada: `vx = (rand-.5)*55`, `vy = (rand-.5)*30 - 16`.

## bokeh-circles
12-24 divs circulares con `radial-gradient` (centro opaco hasta 55 %, transparente a 72 %), `filter: blur(7-8px)`, tamaños 70-300 px, colores cálidos/blancos con alfa .18-.45, deriva lineal + parpadeo de opacidad con `repeat` finito. Sobre fondos CLAROS el bokeh blanco no se ve: usar tinte oscuro o elegir otro fondo.

## mesh-gradient
Varios `radial-gradient(at X% Y%, color 0, transparent 45-50%)` sobre un color base (ver `effects-techniques.md` #9). Para animar: mover divs-blob con `transform`, no el `background`.

## radial-glow
`div` con `radial-gradient(circle, rgba(acento,.55) 0%, rgba(acento,.18) 35%, transparent 70%)` detrás del elemento clave. Animar `opacity` y `scale`, no el blur.

## three-fog-dust
Ver `worlds-3d.md` (niebla + `Points`).

## procedural-city-map
Mapa falso 100 % en SVG generado por código con PRNG con semilla (~350 manzanas, ~1000 edificios): grilla de manzanas rotada -9°, calles = huecos blancos entre manzanas, edificios con sombra desplazada (+7,+9 px, rgba(40,40,30,.22)), avenidas con borde, autopistas amarillas, parques con árboles y sombra, agua con orilla, etiquetas (barrios en negrita con halo blanco, badges de ruta). Lienzo 2560x1600 para panear. Extras que lo acercaron al referente: `filter: saturate(1.35) contrast(1.05)` en el stage, bokeh por delante y tilt-shift (dos divs con `backdrop-filter: blur(9px)` + máscara en degradé arriba y abajo). Código: `examples/map-kinetic-type-glitch.html`.
