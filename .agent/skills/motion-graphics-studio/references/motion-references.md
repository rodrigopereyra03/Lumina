# Principios y recetas de motion design

Cada entrada: principio, regla práctica, fuente. Las reglas prácticas son síntesis propia de la fuente citada; los valores numéricos citados de NN/g y GSAP vienen de las páginas consultadas. Valores de Material Design 3 (cubic-bezier, duraciones): la página oficial m3.material.io no se pudo leer (JS); los números salen de resultados secundarios -> NO VERIFICADO en fuente oficial.

Ojo con el contexto: las guías de UI (NN/g, Material, Apple HIG) apuntan a interfaces interactivas; en video no hay espera del usuario, así que se puede alargar ~1.5-2x, pero la lógica de proporciones se mantiene. Esa extrapolación es criterio propio.

1. Slow in / slow out (easing)
- Regla: nunca `linear` para movimiento de objetos; entrar con `power3.out`/`expo.out` (arranca rápido, frena suave), salir con `power2.in`. Linear solo para loops mecánicos, rotaciones constantes o bokeh a la deriva.
- Fuente: principio 6 de los 12 de Disney (Wikipedia); GSAP Eases: familias power/back/elastic/bounce/expo/circ/sine/steps y convención .in/.out/.inOut, default `power1.out`.

2. Timing = personalidad
- Regla: rápido (0.2-0.4s) = eficiente/tech; lento (0.8-1.2s) = lujo/calma. Fijar 2-3 duraciones por video y reutilizarlas.
- Fuente: principio 9 (Timing), Wikipedia 12 principios. NN/g: UI 100-500 ms, "más común que sean demasiado largas que cortas"; entrar un poco más largo que salir (300 vs 200-250 ms).

3. Anticipación
- Regla: antes del movimiento principal, un micro-movimiento contrario (retroceder 10-20 px o escalar 0.95) de ~0.15s; aplicarlo solo al elemento héroe, no a todo.
- Fuente: principio 2 (Anticipation), Wikipedia.

4. Overshoot / follow through
- Regla: `back.out(1.4)` o elastic suave en elementos "juguetones" (CTA, íconos); evitar overshoot en UI seria/data (Apple HIG pide movimiento "preciso", sin pasarse del destino, para interfaces).
- Fuente: GSAP Eases (parámetro de overshoot de `back`); principio 5; Apple HIG Motion (https://developer.apple.com/design/human-interface-guidelines/motion).

5. Stagger
- Regla: cascada de 0.04-0.08s entre elementos para listas/letras; si hay >12 elementos usar `amount` total (p. ej. 0.6s) en vez de `each`, y `from:"center"` o `from:"edges"` para variar.
- Fuente: GSAP stagger (each/amount/from/grid/ease; la página específica devolvió 404, la descripción general del stagger se verificó en gsap.com/resources/get-started/). Detalle de `from`/`grid`: NO VERIFICADO en esta pasada.

6. Overlapping action / offset
- Regla: no empezar todos los elementos a la vez; superponer: el siguiente arranca cuando el anterior está al ~60-70%. Un timeline GSAP con posiciones relativas (`"-=0.3"`) lo resuelve.
- Fuente: principio 5 (Follow Through and Overlapping Action), Wikipedia.

7. Arcos
- Regla: mover elementos grandes en curva (x e y con eases distintos o path) en vez de recta; lo recto se siente mecánico.
- Fuente: principio 7 (Arc), Wikipedia.

8. Staging / jerarquía de atención
- Regla: un solo foco de movimiento por beat; lo secundario se atenúa (opacidad, blur de bokeh) mientras el principal anima.
- Fuente: principio 3 (Staging) y principio 8 (Secondary Action), Wikipedia.

9. Propósito y brevedad (movimiento que significa algo)
- Regla: cada animación debe responder "qué cambia/qué se señala"; si no, se corta. Evitar decoración que compita con el mensaje.
- Fuente: Apple HIG Motion (purposeful, brief, precise, realistic -- resumen de la página consultada).

10. Parallax / profundidad
- Regla: capas lejanas se mueven 10-30% de la distancia de las cercanas y a menor escala/opacidad; 3 capas suelen alcanzar (fondo, medio, frente).
- Fuente: CSS perspective (MDN): objetos con z>0 se agrandan, z<0 se reducen. Proporción 10-30% = heurística propia, NO VERIFICADO.

11. Cámara 3D con perspective
- Regla: `perspective` 800-1400px en el contenedor y `transform-style: preserve-3d` en el hijo; rotaciones suaves de 5-15° (más es teatral); mover la cámara moviendo el mundo (el contenedor), no cada elemento.
- Fuente: MDN perspective (valor menor = efecto más fuerte; crea stacking context; `perspective-origin` mueve el punto de fuga). Los rangos son criterio propio.

12. Kinetic typography
- Regla: animar por palabra o por carácter con stagger corto; entrada con desplazamiento (y: 40px -> 0) + opacidad con ease `power3.out`; mantener la palabra legible >= 0.4-0.6s antes de la siguiente. Nunca más de un efecto distinto por frase.
- Fuente: GSAP Eases + stagger (arriba); legibilidad: criterio propio.

13. Transiciones entre escenas
- Regla: elegir una familia de transición por video (wipe, push, escala, máscara) y repetirla; duración 0.5-0.8s; solapar la salida de A con la entrada de B ~0.2s.
- Fuente: criterio propio apoyado en NN/g (cambios grandes 200-300 ms en UI; en video se extiende). Ver skill hyperframes-animation (transiciones).

14. Reduce motion y fatiga
- Regla: no encadenar sacudidas/zoom bruscos; dar 0.3-0.5s de calma entre beats para que el ojo descanse.
- Fuente: Apple HIG Motion (respetar Reduce Motion en UI; en video aplica como criterio de legibilidad).

15. Curvas de referencia de Material (opcional)
- Regla: usar `cubic-bezier(0.2, 0, 0, 1)` (emphasized/standard en M3 según fuentes secundarias) como curva "suave y decidida" y duraciones tipo `medium2` = 300 ms.
- Fuente: NO VERIFICADO en la fuente oficial (m3.material.io no legible); datos de resultados de búsqueda secundarios.

## Fuentes
- https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation
- https://developer.apple.com/design/human-interface-guidelines/motion
- https://www.nngroup.com/articles/animation-duration/
- https://gsap.com/docs/v3/Eases/
- https://gsap.com/resources/get-started/
- https://developer.mozilla.org/en-US/docs/Web/CSS/perspective
- https://m3.material.io/styles/motion/easing-and-duration/tokens-specs (no legible, valores NO VERIFICADO)
