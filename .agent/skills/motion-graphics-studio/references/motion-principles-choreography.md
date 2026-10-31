# Motion Principles & Choreography
*Inspirado en LottieFiles/motion-design-skill: Los 12 principios clásicos de animación traducidos a código vectorial y web motion.*

La diferencia entre una animación que se siente "robótica y barata" y un motion graphic prémium radica en el respeto a la física, el peso y la coreografía visual.

---

## 1. Los 12 Principios Clásicos Adaptados a Motion Graphics en Código

### 1. Anticipación (The Windup)
* **Principio:** Antes de una acción rápida hacia adelante, el objeto retrocede brevemente para acumular energía.
* **En código:** Al disparar una tarjeta o badge hacia arriba (`y: -200`), haz que primero baje ligeramente (`y: 15`, duración 0.12s) antes del despegue violento.
```javascript
tl.to(".card", { y: 15, duration: 0.12, ease: "power2.in" })
  .to(".card", { y: -400, opacity: 0, duration: 0.45, ease: "expo.out" });
```

### 2. Puesta en Escena (Staging & Eye Tracing)
* **Principio:** Solo **UN** foco visual principal debe moverse con fuerza a la vez. Si el título y el gráfico se mueven al mismo tiempo a la misma velocidad, el espectador no registra ninguno.
* **Regla:** Jerarquía 1-2-3. El elemento secundario espera entre 80ms y 180ms a que el héroe termine su aceleración inicial.

### 3. Acción Continuada y Solapada (Follow-Through & Overlapping)
* **Principio:** Las partes de un objeto no se detienen todas a la vez. Cuando el contenedor frena, los elementos internos (iconos, etiquetas, bordes) continúan viajando por inercia unos milisegundos más.
```javascript
// Contenedor frena
tl.to(".container", { y: 0, duration: 0.5, ease: "expo.out" }, 0);
// Los hijos internos terminan de acomodarse con solapamiento
tl.to(".container .child-icon", { y: 0, duration: 0.4, ease: "back.out(2)" }, 0.15);
```

### 4. Aceleración y Desaceleración (Slow In & Slow Out)
* **Principio:** Nada en la naturaleza viaja a velocidad lineal (`linear`). Los objetos aceleran desde el reposo y desaceleran al llegar.
* **Regla:** NUNCA usar `ease: "none"` excepto en rotaciones continuas de fondo (como loops de ruido o anillos de partículas).

### 5. Arcos (Motion in Curves)
* **Principio:** Los movimientos naturales y orgánicos viajan en arcos parabólicos, no en líneas rectas mecánicas.
* **En código:** Para mover un elemento de esquina a esquina, combina desplazamientos asimétricos en X e Y con duraciones o easings ligeramente desfasados, o usa `motionPath`:
```javascript
// Movimiento en arco sin plugin externo: desfasar easings de X e Y
tl.to(".flying-element", { x: 300, duration: 0.8, ease: "power2.inOut" }, 0)
  .to(".flying-element", { y: -120, duration: 0.4, ease: "power3.out" }, 0)
  .to(".flying-element", { y: 0, duration: 0.4, ease: "bounce.out" }, 0.4);
```

### 6. Acción Secundaria (Secondary Action)
* **Principio:** Acciones sutiles que acompañan y enriquecen la acción principal sin distraer de ella.
* **Ejemplos:**
  * Al aterrizar una tarjeta de datos $\rightarrow$ una sombra suave se expande en el piso.
  * Al aparecer un número $\rightarrow$ un micro-destello (glow flash de 0.2s) recorre el contorno del contenedor.

### 7. Squash & Stretch (Compresión y Estiramiento)
* **Principio:** Sensación de masa y flexibilidad. Cuando un objeto frena bruscamente contra una base, se comprime en el eje del impacto y se expande en el eje transversal, manteniendo su volumen aproximado.
```javascript
// Impacto contra el suelo: squash -> stretch -> normal
tl.to(".pill", { scaleY: 0.75, scaleX: 1.25, duration: 0.08, ease: "power2.in" })
  .to(".pill", { scaleY: 1.1, scaleX: 0.92, duration: 0.14, ease: "back.out(2)" })
  .to(".pill", { scaleY: 1, scaleX: 1, duration: 0.2, ease: "power2.out" });
```

---

## 2. Biblioteca de Curvas Bézier Universales

| Perfil Emocional | Curva CSS Cubic-Bézier | Equivalente GSAP | Sensación |
|---|---|---|---|
| **Snappy / Tech** | `cubic-bezier(0.16, 1, 0.3, 1)` | `"expo.out"` | Preciso, instantáneo, vanguardista (Apple/Linear). |
| **Overshoot Contundente** | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `"back.out(1.7)"` | Juguetón, con peso, confianza enérgica. |
| **Elastic Micro** | Curva elástica amortiguada | `"elastic.out(1, 0.5)"` | Membrana física, botón táctil de alta gama. |
| **Dramático / Cinema** | `cubic-bezier(0.85, 0, 0.15, 1)` | `"power4.inOut"` | Cambio de escena teatral, transiciones épicas. |
| **Salida Instantánea** | `cubic-bezier(0.7, 0, 0.84, 0)` | `"power3.in"` | Desaparición rápida para limpiar el escenario. |

---

## 3. Coreografía Espacial: La Regla de los Tres Planos
Todo frame de video debe componerse en 3 planos de profundidad con velocidades de movimiento diferenciadas (parallax):

1. **Plano Fondo (Deep Background):** Malla procedural o estrellas/partículas. Velocidad muy lenta (`1x`). Casi imperceptible pero constante.
2. **Plano Escenario (Stage Elements):** Tarjetas, infografías, wireframes y cajas contenedoras. Velocidad media (`3x`).
3. **Plano Héroe (Hero Focus):** Títulos principales, cifras récord, llamados a la acción. Velocidad ágil (`5x`) con frenada contundente (*Snap & Settle*).
