# Taxonomía Tipográfica para Motion Graphics (Inspiración DaFont & Web Fonts Libres)

Clasificación estética y de comportamiento cinemático inspirada en el catálogo visual de **DaFont**, mapeada a fuentes 100% libres de Google Fonts / Web Fonts para carga determinística sin problemas de licencia o CORS en HyperFrames.

---

## 1. Arquetipos Visuales y su Comportamiento Cinemático

### Arquetipo A: Alta Costura & Lujo Silencioso (Haute Couture / Editorial)
- **Fuentes**: `Cormorant Garamond`, `Playfair Display`, `Cinzel`, `Bodoni Moda`, `Prata`.
- **Sensación**: Perfumes nicho, joyería, exclusividad, herencia clásica.
- **Movimiento Adecuado**:
  - **Letter-Spacing Expansion**: El texto entra condensado y se expande lentamente (`letterSpacing: 2px -> 14px`).
  - **Mask Rise Vertical**: Sube suavemente detrás de un contenedor con `overflow: hidden`.
  - **Velocidad**: Lenta, majestuosa (`duration: 1.4s`, `ease: "power2.out"`).
  - **Ejemplo**:
    ```javascript
    gsap.fromTo(".luxury-title", 
      { letterSpacing: "2px", opacity: 0, y: 20 },
      { letterSpacing: "12px", opacity: 1, y: 0, duration: 1.6, ease: "power2.out" }
    );
    ```

### Arquetipo B: Tech / Swiss Neo-Grotesk (SaaS & Modernismo Minimalista)
- **Fuentes**: `Inter`, `Plus Jakarta Sans`, `Syne`, `Space Grotesk`, `Cabinet Grotesk`, `Geist`.
- **Sensación**: Inteligencia artificial, herramientas de producto, dashboards, precisión.
- **Movimiento Adecuado**:
  - **Snappy Slide & Settle**: Aparición veloz con máscara inferior y frenado asimétrico.
  - **Contraste de Peso**: Título ultra-bold (800) conviviendo con badges mono (400) o subtítulos finos (300).
  - **Velocidad**: Ágil y deportiva (`duration: 0.7s`, `ease: "expo.out"`).

### Arquetipo C: Tipografía Variable Dinámica (Variable Axes in Motion)
- **Fuentes con Ejes Variables**:
  - `Bricolage Grotesque` (ejes: `wght 200..800`, `wdth 75..100`, `opsz 12..96`)
  - `Fraunces` (ejes: `wght 100..900`, `SOFT 0..100`, `WONK 0..1`)
  - `Commissioner` (ejes: `wght 100..900`, `FLAR 0..100`, `VOLM 0..100`)
- **Movimiento Adecuado**:
  - **Weight Pumping**: Cambiar el grosor de la fuente al compás de la animación (`fontVariationSettings: "'wght' 200" -> "'wght' 800"`).
  - **Breathing Width**: Expandir y condensar el ancho en palabras clave de impacto.

### Arquetipo D: Brutalista / Display / Streetwear & Poster
- **Fuentes**: `Anton`, `Bebas Neue`, `Clash Display`, `Unbounded`, `Syne ExtraBold`.
- **Sensación**: Urgencia, fuerza, cartelismo, moda urbana, ediciones limitadas.
- **Movimiento Adecuado**:
  - **Kinetic Marquee Infinite**: Desplazamiento horizontal continuo con velocidad variable.
  - **Impact Stamp**: Entra a escala 2.5x con desenfoque de movimiento y estampa contra la pantalla con `scale: 1.0` y temblor sutil de cámara (*camera shake*).

### Arquetipo E: Terminal / Monospace / Data & Telemetría
- **Fuentes**: `JetBrains Mono`, `Space Mono`, `Fira Code`.
- **Sensación**: Fórmulas químicas, coordenadas de envío, códigos de lote, precios y autenticidad.
- **Movimiento Adecuado**:
  - **Typewriter con Cursor Parpadeante**: Tipeo de caracteres a intervalos regulares (0.04s) con cursor `|` titilando.
  - **Scramble / Cipher Effect**: Caracteres aleatorios que se resuelven en la palabra final.

---

## 2. Matriz de Combinaciones (Headline + Body + Motion)

| Uso / Nicho | Headline (Display) | Body / UI | Comportamiento de Movimiento |
|---|---|---|---|
| **Perfumes de Lujo / Gala** | `Cinzel Decorative` | `Cormorant Garamond` | Expansión de espaciado + Glow suave |
| **E-Commerce Dinámico / Moderno** | `Syne` (wght 800) | `Plus Jakarta Sans` | Slide con máscara + Bouncy micro-badges |
| **Dossier Técnico / Laboratorio** | `Space Grotesk` | `JetBrains Mono` | Tipeo determinístico + Grid lines |
| **Editorial Vintage / 70s Lujo** | `Fraunces` | `DM Sans` | Softness variable + Floating drift |
| **Edición Limitada / Drop** | `Clash Display` | `Inter` | Slam down con impacto de cámara |

---

## 3. Snippets de Carga Determinística
Para asegurar que las fuentes rendericen perfectamente sin pantallas blancas o saltos tipográficos (FOUT):

```html
<!-- En el head de la composición -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;600;700&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

<script>
// Esperar a que el navegador garantice la carga de fuentes antes de iniciar el timeline
document.fonts.ready.then(() => {
  window.__fontsLoaded = true;
});
</script>
```
