# GSAP Motion Mastery & Deterministic Timelines
*Inspirado en greensock/gsap-skills adaptado a motion graphics de alta fidelidad con HyperFrames.*

GSAP 3 es el motor de orquestación temporal del video. Para que HyperFrames pueda renderizar sin desfases de milisegundos ni glitches de refresco, las animaciones deben ser 100% determinísticas y aprovechar aceleración por GPU.

---

## 1. Reglas de Determinismo para Video
1. **Nunca usar `delay` suelto**: Usa el *Position Parameter* dentro de la línea de tiempo (`"<"`, `">"`, `"+=0.2"`).
2. **Nunca usar `setTimeout` ni `setInterval`**: El reloj de JavaScript del navegador no se pausa al renderizar frames; solo el timeline de GSAP se controla frame a frame.
3. **Timeline Principal siempre pausado**:
   ```javascript
   const tl = gsap.timeline({ paused: true });
   window.__timelines = { main: tl };
   ```
4. **Propiedades aceleradas por hardware**:
   * Animar SIEMPRE: `x`, `y`, `z`, `scale`, `rotation`, `rotationX`, `rotationY`, `opacity`.
   * EVITAR animar en runtime: `top`, `left`, `width`, `height`, `margin`, `padding` (provocan layout thrashing).

---

## 2. El Parámetro de Posición (Coreografía Exacta)

El tercer argumento de un `.to()` o `.from()` define el momento exacto en la partitura:

```javascript
tl
  // 1. Beat inicial en t = 0s
  .to(".hero-title", { opacity: 1, y: 0, duration: 0.6, ease: "power4.out" }, 0)

  // 2. Empieza exactamente AL MISMO TIEMPO que el anterior ("<")
  .to(".hero-glow", { scale: 1.2, opacity: 0.8, duration: 0.8, ease: "expo.out" }, "<")

  // 3. Empieza 0.15s después de que EMPEZÓ el anterior ("<0.15") -> Solapamiento orgánico
  .from(".badge", { scale: 0, rotation: -15, duration: 0.5, ease: "back.out(2)" }, "<0.15")

  // 4. Empieza cuando TERMINA el anterior (">")
  .to(".card-container", { y: -20, duration: 0.4, ease: "power2.inOut" }, ">")

  // 5. Salto relativo de 0.2s de aire/silencio visual tras terminar el anterior
  .to(".cta-button", { opacity: 1, scale: 1, duration: 0.35, ease: "elastic.out(1, 0.4)" }, ">+0.2");
```

---

## 3. Staggers Avanzados (Cascadas con Intención Visual)

Un stagger plano (`stagger: 0.05`) es aburrido. Los staggers con dirección guían el ojo del espectador:

```javascript
// Stagger desde el centro hacia los extremos (ideal para grids y barras de datos)
tl.from(".metric-card", {
  opacity: 0,
  y: 60,
  scale: 0.9,
  duration: 0.7,
  ease: "expo.out",
  stagger: {
    amount: 0.4,       // Tiempo total que dura la cascada completa
    from: "center",    // "start" | "end" | "center" | "edges"
    grid: [3, 4],      // Si es un layout de grilla [filas, columnas]
    axis: "y"          // Desplazamiento por filas
  }
});
```

---

## 4. Revelado Tipográfico Cinemático (Sin Plugins de Pago)

Simulación nativa y ultrarrápida de `SplitText` para letras y palabras:

```javascript
// Helper: divide el texto en palabras y caracteres respetando espacios
function splitIntoWords(element) {
  const text = element.innerText;
  element.innerHTML = text.split(" ").map(word => {
    const chars = word.split("").map(c => `<span class="char" style="display:inline-block">${c}</span>`).join("");
    return `<span class="word" style="display:inline-block; overflow:hidden; vertical-align:bottom;">${chars}</span>`;
  }).join("&nbsp;");
}

// Uso en escena:
splitIntoWords(document.querySelector("#headline"));

// Animación con máscara de recorte y overshoot tipográfico
tl.from("#headline .char", {
  y: "110%",           // Sale de abajo oculto por el overflow:hidden de la palabra
  rotationX: -45,
  opacity: 0,
  duration: 0.65,
  ease: "power4.out",
  stagger: {
    each: 0.02,
    from: "start"
  }
}, "headline-in");
```

---

## 5. Curvas de Aceleración Esenciales para Motion Graphics

| Emoción / Rol | Easing GSAP | Uso recomendado |
|---|---|---|
| **Impacto contundente** | `"expo.out"` o `"power4.out"` | Títulos principales, tarjetas heroicas, transiciones de beat. |
| **Snap & Settle** | `"back.out(1.8)"` | Badges, botones, tags, iconos que entran con personalidad. |
| **Orgánico / Elástico sutil** | `"elastic.out(1, 0.6)"` | Notificaciones, barras de progreso al frenar, switches. |
| **Cinemático / Cámara fluida** | `"power2.inOut"` o `"sine.inOut"` | Vuelos de cámara 3D, niebla, rotación continua de fondo. |
| **Tensión dramática (anticipación)** | `"power3.in"` seguido de snap | Elemento que retrocede antes de salir disparado. |

---

## 6. Organización por Beats y Labels

Estructura tu video en beats claros usando etiquetas (`tl.addLabel()`):

```javascript
const tl = gsap.timeline({ paused: true });

tl.addLabel("beat1-hook", 0)
  .addLabel("beat2-problem", 3.5)
  .addLabel("beat3-solution", 7.0)
  .addLabel("beat4-proof", 11.5)
  .addLabel("beat5-cta", 16.0);

// Al animar un beat, posicionas relativo a su label:
tl.to(".problem-card", { opacity: 1, duration: 0.6 }, "beat2-problem")
  .to(".problem-icon", { scale: 1.2, duration: 0.3 }, "beat2-problem+=0.2");
```
