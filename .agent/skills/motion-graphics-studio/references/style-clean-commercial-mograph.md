# Style: Clean Commercial Mograph (Bright Studio / Mogu Mogu Style)

Este estilo es la referencia estándar de **publicidad comercial moderna de producto** (inspirado en la dirección de arte viral de `@gyumania` y anuncios de bebidas/fragancias de alta gama).

---

## 1. Principios Visuales Clave

* **Fondo de Estudio Claro (Zero fondos oscuros / Zero partículas espaciales):**
  * Fondo blanco brillante de estudio con gradiente radial imperceptible: `radial-gradient(circle at 50% 42%, #ffffff 0%, #f6f7f8 55%, #e6e9ec 100%)`.
  * Nunca usar fondos negros, estrellas, ni chispas o partículas incandescentes en este estilo.

* **Productos 100% Reales (Cutouts PNG con sombra física):**
  * Productos auténticos en PNG transparente con drop-shadow suave y sombra elíptica de contacto en el piso:
    ```css
    .shadow {
      position: absolute; height: 70px; border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(20, 30, 40, 0.32) 0%, rgba(20, 30, 40, 0) 70%);
    }
    ```

* **Ingredientes y Elementos Fotográficos Flotantes (Splash + Food/Botanicals):**
  * Elementos fotográficos reales en alta definición (rodajas de fruta fresca, cubos de hielo, gotas, vainas, resinas, agua líquida en splash).
  * Mezclados sobre el fondo blanco mediante `mix-blend-mode: multiply` (para fotos con fondo blanco puro) o PNG con canal alfa.
  * Entran disparados desde los bordes con `back.out(1.5)` y se mantienen en levitación sutil constante (`float()` senoidal suave).

* **Tipografía Cinética en Capas (Layered Mograph Typography):**
  * **Capa Trasera (Marquee Gigante):** Palabra gigante en mayúsculas detrás del producto con `font-family: 'Anton'`, `font-size: 330px`, en tono pastel suave deslizando lentamente en horizontal.
  * **Capa Delantera (Header & Copy):**
    * Píldoras superiores: Badge con marca en color pleno + contador (`01 / 03`).
    * Nombre de producto: `Anton`, `font-size: 136px`, emergiendo con máscara de recorte (`overflow: hidden` + `yPercent: 110 -> 0`).
    * Tagline de impacto: `Inter`, `font-size: 38px`, `font-weight: 700`.
    * Chips de notas/ingredientes: Tarjetas blancas redondeadas con sombra limpia y viñetas de color.

* **Transiciones Dinámicas (Diagonal Color Wipes):**
  * Wipes sólidos angulares (`transform: rotate(12deg)`) que barren la pantalla a gran velocidad (0.3s) sincronizados con el cambio de producto, tomando el color clave de cada fragancia.

* **Clímax Final (Hero Trio + Brand Stagger):**
  * Las botellas de la colección se ensamblan juntas en el centro con los ingredientes alrededor y el splash unificador.
  * El logo de marca entra letra por letra con efecto de rebote escalonado (`stagger: 0.06`, `ease: 'back.out(2)'`).

---

## 2. Paleta de Fuentes

* **Títulos y Marquee:** `'Anton', sans-serif` (Google Fonts).
* **Cuerpo y Badges:** `'Inter', sans-serif` (pesos 700, 800, 900).

---

## 3. Código Clave de Movimiento (GSAP)

```javascript
// Rebote elástico de entrada
tl.fromTo(element, 
  { scale: 0.6, rotation: angle, opacity: 0 },
  { scale: 1, rotation: 0, opacity: 1, duration: 0.85, ease: 'back.out(1.5)' },
  time
);

// Rotación acento de producto en medio de escena
tl.fromTo(bottle, 
  { rotationY: 0 }, 
  { rotationY: 360, duration: 0.9, ease: 'power3.inOut' }, 
  time + 3.4
);

// Wipe diagonal
tl.fromTo(wipeSel, { x: 2600 }, { x: 0, duration: 0.3, ease: 'power2.in' }, mid - 0.3);
tl.fromTo(wipeSel, { x: 0 }, { x: -2900, duration: 0.34, ease: 'power2.out' }, mid);
```
