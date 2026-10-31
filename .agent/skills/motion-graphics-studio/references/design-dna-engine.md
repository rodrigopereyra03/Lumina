# Design DNA Engine: Extracción y Traducción Visual
*Inspirado en zanwei/design-dna adaptado a motion graphics y dirección de arte en HyperFrames.*

Cuando un cliente o usuario entrega una imagen, captura de pantalla, logo o referencia web, el **Design DNA Engine** analiza la referencia y extrae una firma genética visual estructurada. Esta firma alimenta directamente las variables CSS, paletas y shaders del video.

---

## 1. Esquema de Extracción (El perfil Design DNA)

Cuando haya una imagen de referencia, el agente debe formular mentalmente (o en el scratch) este objeto de identidad:

```json
{
  "designSystem": {
    "palette": {
      "bgPrimary": "#090A0F",
      "bgSecondary": "#121622",
      "surface": "#1A2035",
      "accentPrimary": "#6366F1",
      "accentSecondary": "#EC4899",
      "textHigh": "#FFFFFF",
      "textMuted": "#94A3B8",
      "border": "rgba(255, 255, 255, 0.12)"
    },
    "typography": {
      "display": "Syne, sans-serif",
      "body": "Inter, sans-serif",
      "trackingTitle": "-0.04em",
      "weightBold": 800
    },
    "shapes": {
      "borderRadius": "16px",
      "borderWidth": "1px",
      "elevation": "0 20px 50px rgba(0,0,0,0.5)"
    }
  },
  "visualVibe": {
    "mood": "Futurista refinado / Fintech premium",
    "lighting": "Luz direccional cenital azulada + rim light rosa sutil",
    "contrast": "Alto contraste (Deep Dark + High Neon Highlights)",
    "texture": "Grano fílmico fino + micro-grid sutil"
  },
  "effectsProfile": {
    "glassmorphism": {
      "backdropBlur": "20px",
      "bgOpacity": "0.45",
      "borderHighlight": "1px solid rgba(255,255,255,0.18)"
    },
    "glow": {
      "color": "rgba(99, 102, 241, 0.35)",
      "spread": "60px"
    },
    "particles": {
      "type": "dust-bokeh",
      "count": 40,
      "color": "#6366f1"
    }
  }
}
```

---

## 2. Traducción Inmediata a CSS (`:root`)

El bloque extraído se inyecta directamente al `index.html` del video:

```html
<style>
  :root {
    --bg-primary: #090A0F;
    --bg-secondary: #121622;
    --surface: #1A2035;
    --accent-primary: #6366F1;
    --accent-secondary: #EC4899;
    --text-high: #FFFFFF;
    --text-muted: #94A3B8;
    --border-subtle: rgba(255, 255, 255, 0.12);
    --font-display: 'Syne', sans-serif;
    --font-body: 'Inter', sans-serif;
    --radius-lg: 16px;
    --radius-md: 10px;
    --glow-hero: 0 0 80px rgba(99, 102, 241, 0.4);
    --shadow-physic: 0 24px 48px -12px rgba(0, 0, 0, 0.65), 0 0 1px 1px rgba(255, 255, 255, 0.08);
  }

  /* Micro-bisel de luz física para que las tarjetas no parezcan plantillas planas */
  .dna-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%), var(--surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-physic);
    backdrop-filter: blur(20px);
  }
</style>
```

---

## 3. Matriz de Arquetipos Visuales Frecuentes

Si no hay imagen del cliente pero te piden un concepto o temática, recurre a esta matriz:

| Arquetipo | Paleta Clave | Tipografía Clave | Efectos Primarios | Vibe |
|---|---|---|---|---|
| **Fintech / Crypto Elegance** | Obsidian (`#0B0E14`), Cyan neón (`#00F2FE`), Plata (`#E2E8F0`) | `Plus Jakarta Sans` + `Space Grotesk` | Glassmorphism pesado, glow direccional, líneas de pulso vectoriales | Seguro, institucional, vanguardista |
| **SaaS B2B Moderno** | Dark Navy (`#0A0F1D`), Indigo (`#4F46E5`), Esmeralda (`#10B981`) | `Inter` + `Cabinet Grotesk` | Sombras físicas multicapa, tarjetas micro-interactivas, badges nítidos | Confiable, ágil, productivo |
| **Editorial Cine / Documental** | Carbón cálido (`#121110`), Ocre tostado (`#D97706`), Hueso (`#F5F5F0`) | `Playfair Display` o `Cormorant` + `Satoshi` | Grano 35mm, viñeteado óptico, letterbox 2.39:1, tipografía serif gigante | Reflexivo, prestigioso, humano |
| **Cyber Brutalism / Tech Hype** | Negro puro (`#000000`), Ácido (`#CCFF00`), Violeta eléctrico (`#7928CA`) | `Druk Wide` (o `Syne 800`) + `JetBrains Mono` | Glitch sutil, scanlines, borders de 2px sólidos, esquinas en ángulo recto | Disruptivo, ruidoso, underground |
| **Wellness / Minimal Luxury** | Almendra suave (`#F9F6F0`), Arcilla (`#C89666`), Gris grafito (`#2B2A27`) | `Ogg` (o `Italiana`) + `General Sans` | Bokeh suave, halos de luz difusos, movimientos lentos y amortiguados | Exclusivo, calmo, aspiracional |
