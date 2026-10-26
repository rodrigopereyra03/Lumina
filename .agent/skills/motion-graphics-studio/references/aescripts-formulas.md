# Fórmulas y Algoritmos de aescripts (After Effects en Código Puro)

Traducción determinística en código (GSAP / Canvas / SVG / WebGL) de los plugins y scripts más influyentes de la industria audiovisual disponibles en **aescripts + aeplugins**.

---

## 1. Flow & EaseCopy (Curvas Bezier Industriales)
En lugar de depender de los presets básicos de CSS, los animadores de élite usan presets numéricos exactos de curvas de velocidad.

### Presets Esenciales:
| Nombre en AE | Curva CSS / GSAP | Efecto Visual | Caso de Uso |
|---|---|---|---|
| **Snappy Snap** | `cubic-bezier(0.85, 0, 0.15, 1)` | Explosión inmediata y frenado rápido | Cambio de diapositivas, swipes |
| **Expo Settle** | `cubic-bezier(0.16, 1, 0.3, 1)` | Aceleración violenta, desaceleración larga | Entradas de tarjetas, modales |
| **Mechanical Spring** | `back.out(2.2)` | Sobrepaso marcado del límite y retorno | Badges, notificaciones, toggles |
| **Liquid Elastic** | `elastic.out(1.2, 0.4)` | Oscilación tipo gelatina | Botones al hacer clic, carritos |
| **Anticipate Settle** | `back.inOut(1.7)` | Retroceso previo + overshoot final | Giros de 180°, cambios de estado héroe |

---

## 2. Deep Glow & Optical Flares (Luz Física Inversa al Cuadrado)
Los glows estándar de CSS (`box-shadow: 0 0 20px cyan`) parecen falsos porque la luz real decae con la **ley del cuadrado inverso** ($1 / d^2$) y tiene aberración cromática en los bordes.

### Implementación Física Multi-capa en CSS:
```css
/* Deep Glow Multi-Layer Inverse Square Falloff */
.deep-glow-source {
  position: relative;
}
.deep-glow-source::before {
  content: "";
  position: absolute;
  inset: -20px;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(230, 180, 80, 0.8) 0%, rgba(210, 140, 40, 0.3) 30%, transparent 70%);
  filter: blur(8px);
  z-index: -1;
  pointer-events: none;
}
.deep-glow-source::after {
  content: "";
  position: absolute;
  inset: -60px;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(255, 100, 50, 0.25) 0%, rgba(180, 40, 120, 0.08) 50%, transparent 80%);
  filter: blur(35px);
  z-index: -2;
  pointer-events: none;
}
```

---

## 3. Plexus 3 & Stardust (Redes de Nodos y Conectividad Dinámica)
Simula partículas que flotan orgánicamente y dibujan líneas entre sí cuando su distancia es menor a un umbral $R$.

### Implementación determinística en Canvas (60 FPS):
```javascript
function drawPlexusNetwork(ctx, particles, maxDistance = 140, color = "rgba(255, 215, 0,") {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Dibujar líneas entre pares cercanos
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < maxDistance) {
        const alpha = (1 - dist / maxDistance) * 0.45;
        ctx.strokeStyle = `${color} ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  
  // Dibujar los nodos
  for (let i = 0; i < particles.length; i++) {
    ctx.fillStyle = `${color} 0.85)`;
    ctx.beginPath();
    ctx.arc(particles[i].x, particles[i].y, particles[i].radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

---

## 4. TextDelay & SplitText (Cinemática Tipográfica por Carácter)
Los mejores comerciales de Apple y Anthropic revelan texto carácter por carácter pero con **rotación 3D, máscara de corte y desenfoque individual**.

### Estructura de Marcado y Timeline:
```html
<div class="split-line-overflow" style="overflow: hidden;">
  <span class="kinetic-word" style="display: inline-block;">
    <span class="char">L</span><span class="char">U</span><span class="char">X</span><span class="char">E</span>
  </span>
</div>
```

```javascript
// Revelado tipo Apple Keynote / TextDelay
gsap.fromTo(".split-line-overflow .char", 
  {
    yPercent: 120,
    rotateX: -45,
    opacity: 0,
    filter: "blur(6px)"
  },
  {
    yPercent: 0,
    rotateX: 0,
    opacity: 1,
    filter: "blur(0px)",
    duration: 0.8,
    stagger: {
      amount: 0.35,
      from: "start",
      ease: "power2.inOut"
    },
    ease: "power4.out"
  }
);
```

---

## 5. Newton 3 (Física Rígida & Rebote de Impacto)
Simulación de caídas donde los elementos no simplemente aterrizan, sino que transfieren energía elástica (*restitution*).

```javascript
// Algoritmo de caída con rebote decreciente (Newton 3 Code Port)
function dropWithNewtonBounce(target, targetY, duration = 1.2) {
  const tl = gsap.timeline();
  tl.to(target, { y: targetY, duration: duration * 0.45, ease: "power2.in" })
    .to(target, { scaleY: 0.88, scaleX: 1.12, duration: 0.08, ease: "power1.out" }) // Squash en impacto
    .to(target, { y: targetY - 45, scaleY: 1.05, scaleX: 0.95, duration: duration * 0.22, ease: "power2.out" }) // Rebote 1
    .to(target, { y: targetY, scaleY: 0.95, scaleX: 1.05, duration: duration * 0.18, ease: "power2.in" })
    .to(target, { y: targetY - 12, duration: duration * 0.12, ease: "power2.out" }) // Rebote 2 micro
    .to(target, { y: targetY, scaleY: 1, scaleX: 1, duration: duration * 0.1, ease: "power1.inOut" });
  return tl;
}
```

---

## 6. Overlord / Bodymovin (Animación Vectorial SVG & Path Trimming)
Trazado dinámico de líneas, monogramas o sellos con `stroke-dasharray`:

```javascript
// Trazado de contorno tipo Lottie / Overlord
function drawPathReveal(svgPathSelector, duration = 1.4) {
  const path = document.querySelector(svgPathSelector);
  const length = path.getTotalLength();
  
  gsap.set(path, {
    strokeDasharray: length,
    strokeDashoffset: length
  });
  
  return gsap.to(path, {
    strokeDashoffset: 0,
    duration: duration,
    ease: "power3.inOut"
  });
}
```
