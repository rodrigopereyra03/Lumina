# Principios y Metodología School of Motion (Animation Bootcamp & Advanced Methods)

Documentación técnica extraída de las metodologías de **School of Motion** (Animation Bootcamp, Advanced Motion Methods por Sander van Dijk, Expression Session). Estos principios transforman animaciones mecánicas/amateurs en motion graphics profesionales con peso físico, intención y ritmo cinematográfico.

---

## 1. El Speed Graph Asimétrico y la Regla 80/20
El error número uno en motion design con código es usar `ease: "power1.inOut"` o curvas simétricas. En el mundo real, los objetos aceleran con fuerza y toman tiempo en disipar la energía.

### La Regla 80/20:
- **80% del desplazamiento físico** debe ocurrir en el **primer 20% del tiempo**.
- El **80% restante del tiempo** se dedica a una desaceleración ultra-suave y un asentamiento (*settle*).
- **En GSAP**:
  - `power4.out` o curvas cúbicas personalizadas: `cubic-bezier(0.16, 1, 0.3, 1)` (conocida en la industria como curva *Expo Out* o *Snappy Quint*).
  - Para entradas con impacto: `power3.out` con duración de 0.8s a 1.2s.

```javascript
// Curva School of Motion "Snap & Glide"
gsap.to(".card", {
  x: 0,
  opacity: 1,
  duration: 1.0,
  ease: "expo.out" // El 80% del trayecto se completa en los primeros 0.2s
});
```

---

## 2. Eye Tracing & Spatial Continuity (Guía de la Mirada)
El espectador **nunca debe buscar dónde mirar**. La fatiga visual y la sensación de desorden ocurren cuando múltiples elementos se mueven en esquinas opuestas de la pantalla al mismo tiempo.

### Reglas de Eye Tracing:
1. **Punto de ancla compartido (Hand-off)**: El punto donde el elemento A desaparece o culmina su acción DEBE ser exactamente donde el elemento B aparece o inicia su movimiento.
2. **Dirección cinemática continua**: Si la cámara o el cursor se mueven hacia la derecha, el siguiente elemento debe ingresar desde la derecha o continuar ese vector de inercia. Nunca frenar en seco e iniciar en vector opuesto sin un beat de anticipación.
3. **Hierarchy of Attention (Solo 1 héroe por beat)**:
   - Elemento Primario (Héroe): 100% de contraste, escala normal, movimiento rápido.
   - Elementos Secundarios: opacidad 60-70%, escala 95%, desenfoque sutil (bokeh/blur 4px), retraso de 0.1s a 0.2s.

---

## 3. Ritmo: Snap & Settle (Contraste Temporal)
Las animaciones donde todo se mueve a una velocidad uniforme aburren y se sienten como presentaciones de PowerPoint. El motion gráfico profesional vive del **contraste**:

| Fase | Duración | Comportamiento | Propósito |
|---|---|---|---|
| **Anticipación** | 0.10s - 0.15s | Micro-retroceso sutil (-5px a -12px, escala 0.96) | Alerta al ojo de que algo va a suceder. |
| **Snap (Disparo)** | 0.20s - 0.35s | Velocidad punta violenta, cruce del 80% del espacio | Dinamismo, energía, modernidad. |
| **Settle (Asentamiento)** | 0.40s - 0.70s | Micro-rebote amortiguado (*damped spring*) o freno elástico | Sensación de peso y masa física. |
| **Pausa de Asimilación** | 1.0s - 2.0s | Micro-movimiento imperceptible (drift flotante de 2px) | Tiempo para leer y entender el mensaje. |

---

## 4. Secondary Motion & Cascading Hierarchy (Acción Superpuesta)
Un elemento nunca es un monolito rígido. Cuando un contenedor se mueve, sus contenidos reaccionan como pasajeros en un auto con inercia.

### Cadena de Arrastre (Parent-to-Child Cascade):
```
Contenedor / Tarjeta (Tiempo 0.00s)
└── Icono / Badge (Tiempo +0.08s, con rebote back.out(1.7))
    └── Título Principal (Tiempo +0.14s, slide-up con máscara)
        └── Texto Descriptivo (Tiempo +0.20s, fade-in suave)
            └── Botón / CTA (Tiempo +0.28s, pop escala 0 -> 1 con overshoot)
```

### Implementación en GSAP con Stagger Asimétrico:
```javascript
const tl = gsap.timeline();

// El padre lidera
tl.fromTo(".modal-window", 
  { y: 80, scale: 0.9, opacity: 0 }, 
  { y: 0, scale: 1, opacity: 1, duration: 0.9, ease: "power4.out" }
)
// Los hijos le siguen en cascada
.fromTo(".modal-badge", 
  { scale: 0, rotation: -10 }, 
  { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2)" }, 
  "-=0.6"
)
.fromTo(".modal-title .char", 
  { y: 30, opacity: 0 }, 
  { y: 0, opacity: 1, duration: 0.4, stagger: 0.02, ease: "power3.out" }, 
  "-=0.4"
)
.fromTo(".modal-btn", 
  { scale: 0.85, opacity: 0 }, 
  { scale: 1, opacity: 1, duration: 0.45, ease: "elastic.out(1, 0.5)" }, 
  "-=0.2"
);
```

---

## 5. Squash & Stretch en UI Moderna
Tradicionalmente asociado a personajes de caricatura, en UI moderna (iOS, Notion, Stripe) el squash & stretch se aplica a micro-interacciones:
- **Al presionar un botón**: `scaleX: 1.04, scaleY: 0.92` (se expande lateralmente al ser presionado).
- **Al soltar / disparar**: `scaleX: 0.96, scaleY: 1.05` -> rebota a `scale: 1.0`.
- **Al impactar en el suelo**: Al caer una tarjeta, se ensancha un 3% horizontalmente durante 1 frame antes de estabilizarse.

---

## 6. Mathematical Decay (Inertial Bounce Formula)
Fórmula clásica de After Effects (Dan Ebberts / School of Motion) adaptada a código para rebotes orgánicos matemáticamente perfectos:

```javascript
// Función de rebote inercial amortiguado
function inertialBounce(t, amp = 0.08, freq = 6, decay = 8) {
  if (t < 0) return 0;
  return amp * Math.sin(t * freq * Math.PI) / Math.exp(decay * t);
}
```
Esto garantiza que las oscilaciones nunca se vean sintéticas o robóticas.
