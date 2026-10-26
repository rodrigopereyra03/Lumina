# Dirección de Arte, Luz y Materialidad (Lecciones de Behance)

Guía de dirección de arte inspirada en los mejores estudios de branding y motion design presentes en **Behance** (Tendril, ManvsMachine, Ordinary Folk, Buck, Pentagram).

---

## 1. Adiós al "Modo Oscuro Monótono": Paletas Vívidas y Luminosas
Uno de los mayores errores en motion design amateur es recurrir siempre a fondos negros (#000000) o dorados genéricos. Behance demuestra que el verdadero lujo y dinamismo a menudo viven en **la luz, la frescura y el contraste cromático vibrante**.

### 4 Sistemas Cromáticos de Alto Impacto:

#### Sistema 1: Champagne Brillante & Alabastro (Lujo Diurno Luminoso)
- **Fondo**: `#F8F6F0` (crema seda) a `#EDE8DF` (mármol cálido).
- **Acentos**: `#D4AF37` (oro pulido), `#2A2A2A` (carbón tipográfico), `#E27D60` (coral suave).
- **Sensación**: Perfumería francesa de día, ligereza, frescura botánica.

#### Sistema 2: Neon Bloom & Pastel Tecnológico (Vanguardia Neón)
- **Fondo**: `#0F0C20` (azul noche índigo) o `#FAFAFC` (blanco nieve).
- **Acentos**: `#7000FF` (violeta eléctrico), `#00F5D4` (turquesa aguamarina), `#FF007A` (magenta ácido).
- **Sensación**: Inteligencia artificial moderna, interfaces futuristas, alta energía.

#### Sistema 3: Esmalte Botánico & Terracota (Naturaleza Orgánica Viva)
- **Fondo**: `#F3EFEA` (lino natural).
- **Acentos**: `#2C5E43` (esmeralda bosque profundo), `#C17C54` (ámbar terracota), `#E6BA95` (durazno suave).
- **Sensación**: Notas olfativas de bergamota, maderas nobles y jazmín.

#### Sistema 4: Minimalismo Suizo Puro (High Contrast Vivid)
- **Fondo**: `#FFFFFF` absoluto con gradientes radiales sutiles.
- **Acentos**: `#0052FF` (azul cobalto de alta saturación), `#FF4800` (naranja internacional), `#111111` (negro tipográfico).
- **Sensación**: Precisión arquitectónica, modernidad internacional.

---

## 2. Micro-Materialidad y Luz Física en CSS
Para que los elementos parezcan objetos físicos tridimensionales y no recortes planos de papel:

### A. Sombra Multi-Capa (Directional Light + Ambient Occlusion):
Nunca uses una sola sombra como `box-shadow: 0 10px 20px rgba(0,0,0,0.2)`. En la realidad existen al menos dos sombras:
1. **Oclusión Ambiental**: Sombra muy pegada, oscura y nítida.
2. **Luz Clave Difusa**: Sombra lejana, muy suave y tintada con el color ambiental.

```css
/* Sombra física de Behance para tarjetas y modales */
.physical-card {
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.04),       /* Oclusión de contacto */
    0 12px 24px rgba(20, 20, 40, 0.06),   /* Sombra media */
    0 40px 80px rgba(20, 20, 40, 0.08);   /* Difusión lejana */
}
```

### B. Micro-Biselado de Borde (Highlight Edge 1px):
En el mundo real, los bordes biselados capturan la luz cenital:

```css
/* Micro-bisel para simular cristal tallado o metal */
.chiseled-surface {
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-top: 1.5px solid rgba(255, 255, 255, 0.9); /* Luz cenital */
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);       /* Sombra inferior */
}
```

---

## 3. Disposición Isométrica 3D y Escalonamiento de Capas
En lugar de una vista frontal 2D plana, las mejores piezas de producto en Behance utilizan ángulos en perspectiva isométrica suave:

```css
.isometric-stage {
  perspective: 1600px;
  transform-style: preserve-3d;
}

.isometric-window {
  transform: rotateX(14deg) rotateY(-18deg) rotateZ(4deg);
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Capas flotando a diferentes profundidades Z */
.layer-bg      { transform: translateZ(0px); }
.layer-content { transform: translateZ(30px); }
.layer-badge   { transform: translateZ(65px); }
.layer-cursor  { transform: translateZ(95px); }
```

---

## 4. El Proceso de 4 Styleframes Antes de Animar
Antes de tocar una línea de código o disparar una animación, los directores de arte en Behance congelan 4 cuadros clave (*Hero Styleframes*):

1. **Frame 1 - El Gancho (The Teaser)**: Silueta, macro detalle o titular con tipografía protagónica.
2. **Frame 2 - El Ecosistema (The Stage)**: La interfaz o producto completo en su máxima gloria visual con iluminación definida.
3. **Frame 3 - La Micro-Interacción Clímax (The Action)**: El cursor interactuando, una explosión de partículas, o el momento de selección.
4. **Frame 4 - La Resolución & Sello (The Signature)**: El payoff, confirmación de orden y marca con acabados de alta fidelidad.
