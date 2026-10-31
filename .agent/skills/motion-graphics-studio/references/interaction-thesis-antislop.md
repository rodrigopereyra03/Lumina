# Interaction Thesis & The Anti-Slop Motion Manifesto
*Inspirado en AThevon/genjutsu: Cómo eliminar el video genérico de IA y formular una tesis de interacción previa al código.*

El "AI-Slop" en video es inconfundible: tarjetas centradas flotando sobre un fondo azul oscuro genérico, textos entrando con un fade-in genérico de 0.5s, números sin emoción y transiciones lineales predecibles. Parece un PowerPoint con esteroides.

Para crear motion graphics que parezcan dirigidos por un estudio de diseño humano, cada pieza debe fundamentarse en una **Tesis de Interacción**.

---

## 1. La Tesis de Interacción (Interaction Thesis)

Antes de abrir el editor o tocar una sola línea de HTML/GSAP, el agente debe formular una tesis en 3 puntos claros:

1. **La Dinámica Física de los Materiales:**
   * *Ejemplo:* "¿La interfaz es de vidrio esmerilado pesado con fricción metálica, o es un HUD holográfico liviano que reacciona a pulsos de energía?"
2. **El Patrón de Tensión y Liberación (Pacing):**
   * *Ejemplo:* "Inicio con tensión comprimida (cámara cerrada, tipografía gigante contenida) $\rightarrow$ liberación explosiva en t=3.2s con revelado de arquitectura $\rightarrow$ settle calmo para leer datos clave."
3. **El Punto de Fricción Visual (Visual Grip):**
   * Qué elemento frena el scroll del espectador en los primeros 3 segundos. No puede ser una tarjeta genérica; debe tener contraste extremo, movimiento inesperado o textura tangible.

---

## 2. Catálogo de Micro-Interacciones Anti-Slop

### A. Trazado de Luz Perimetral (Border Light Sweep)
En lugar de un borde estático, un gradiente cónico recorre el perímetro de la tarjeta cuando entra en foco:
```css
.card-glow-border {
  position: relative;
  background: #0f131f;
  border-radius: 16px;
  overflow: hidden;
}
.card-glow-border::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: conic-gradient(transparent, transparent, var(--accent-primary), transparent 30%);
  animation: none; /* Controlado determinísticamente con GSAP rotation */
}
```

### B. Odómetro Numérico Físico (Rolling Digit Wheels)
Las cifras récord nunca aparecen de golpe ni con un contador lineal aburrido. Cada dígito es una columna vertical que rueda a velocidades asimétricas:
```html
<div class="digit-wheel">
  <div class="digit-strip"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></div>
</div>
```
Cada columna rueda con una curva `expo.out` y tiempos ligeramente desfasados (el último dígito frena primero, el primero frena al final para generar suspenso).

### C. Inclinación 3D Reactiva a la Cámara (Perspective Tilt)
Cuando la cámara virtual viaja de un beat a otro, las tarjetas reaccionan con inclinación de perspectiva física (`rotateX`, `rotateY` proporcionales a la velocidad de la cámara):
```javascript
// La velocidad del paneo de cámara inclina los objetos en pantalla
tl.to(".card", {
  rotateY: -12,
  rotateX: 6,
  duration: 0.4,
  ease: "power2.out"
}, "camera-move")
.to(".card", {
  rotateY: 0,
  rotateX: 0,
  duration: 0.6,
  ease: "back.out(2)"
}, "camera-settle");
```

---

## 3. Checklist Anti-Slop (Validación Obligatoria)

Antes de renderizar el video final, pasa esta lista de verificación:

* [ ] **¿Hay contraste de ritmos?** Prohibido que todos los beats duren exactamente lo mismo. Combina beats rápidos de 1.5s - 2s con beats de respiración de 3.5s.
* [ ] **¿Las sombras son físicas?** Prohibido `box-shadow: 0 4px 10px rgba(0,0,0,0.3)`. Usa sombras multicapa (luz difusa amplia + oclusión ambiental oscura a 2px).
* [ ] **¿Hay micro-biseles?** Cada tarjeta o botón debe tener un highlight superior de 1px (`rgba(255,255,255,0.15)`) para simular refracción de luz real.
* [ ] **¿Hay atmósfera viva en el fondo?** Prohibido el fondo estático plano. Debe haber al menos dos capas en movimiento continuo (malla suave + grano fílmico o polvo bokeh).
* [ ] **¿El revelado tipográfico tiene intención?** Prohibido texto que solo hace fade-in. Debe revelarse por palabras/caracteres con máscara de recorte y ángulo cinemático.
