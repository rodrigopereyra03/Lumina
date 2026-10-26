# Catálogo de tipografías (Google Fonts)

Verificación: cada fuente se consultó en el repositorio oficial `github.com/google/fonts` (archivo METADATA.pb de cada familia). Todas figuran con licencia OFL (SIL Open Font License). Roboto (Apache) NO se pudo verificar por ruta: NO VERIFICADO, no se incluye. No se pudo abrir fonts.google.com (render JS), la verificación es vía el repo oficial.

Licencia OFL: el FAQ oficial confirma que se puede usar en cualquier trabajo de diseño, incluido titulado de video; lo único prohibido es vender la fuente por sí sola.

## Por qué hay que variar (y no usar siempre Arial)
Arial fue el default en todos los videos hasta ahora: es una fuente de sistema neutra, sin personalidad, y hace que todo se vea igual. Además, en el render headless la fuente de sistema depende de la máquina. Con Google Fonts elegimos personalidad por video (display + texto) y la ganamos con pesos variables. IMPORTANTE para render determinístico: la fuente debe estar cargada ANTES de capturar frames (esperar `document.fonts.ready`) o, mejor, descargar los .woff2 y referenciarlos localmente con `@font-face` para no depender de red.

## Cómo cargar
Sintaxis CSS2 API verificada (rangos con `..`, `display=swap`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Inter:wght@400..700&display=swap" rel="stylesheet">
```
O con `@import url('https://fonts.googleapis.com/css2?family=...&display=swap');` al inicio del `<style>`.
Para la fuente de las tablas: ejes variables verificados en METADATA.pb (rangos abajo).

---

## Pairings

1. Space Grotesk + Inter
- Space Grotesk (wght 300..700) / Inter (wght 100..900, opsz 14..32). OFL.
- Personalidad: tech moderna, geométrica con rarezas. Sirve: kinetic type tech, UI mockups, lanzamientos IA.
- `family=Space+Grotesk:wght@300..700&family=Inter:wght@400..700`

2. Playfair Display + Source Sans 3
- Playfair Display (wght 400..900, con itálica) / Source Sans 3 (wght 200..900). OFL.
- Personalidad: editorial elegante, contraste alto. Sirve: citas, storytelling, moda, mood editorial papel.
- `family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Source+Sans+3:wght@300..700`

3. Bricolage Grotesque + DM Sans
- Bricolage Grotesque (wght 200..800, wdth 75..100, opsz 12..96) / DM Sans (wght 100..1000, opsz 9..40). OFL.
- Personalidad: expresiva, con carácter, amistosa. Sirve: kinetic type marcas jóvenes, explainers. El eje wdth permite animar el ancho.
- `family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=DM+Sans:wght@400..700`

4. Fraunces + Inter
- Fraunces (wght 100..900, SOFT 0..100, WONK 0..1, opsz 9..144) / Inter. OFL.
- Personalidad: serif "blanda" cálida, orgánica. Sirve: bienestar, tierra/orgánico, retro 70s, editorial cálido.
- `family=Fraunces:opsz,wght,SOFT,WONK@9..144,100..900,0..100,0..1&family=Inter:wght@400..600`

5. Syne + Manrope
- Syne (wght 400..800) / Manrope (wght 200..800). OFL.
- Personalidad: Syne es rara y artística (el 800 es muy ancho); Manrope neutra limpia. Sirve: moda, arte, cultura, portfolios.
- `family=Syne:wght@400..800&family=Manrope:wght@300..700`

6. Anton + Inter
- Anton (solo 400) / Inter. OFL.
- Personalidad: condensada, impacto de afiche. Sirve: kinetic type agresivo, deportes, noticias, brutalista.
- `family=Anton&family=Inter:wght@400..600`

7. JetBrains Mono + Inter
- JetBrains Mono (wght 100..800) / Inter. OFL.
- Personalidad: técnica, legible. Sirve: demos de código, terminal, mood dev tools.
- `family=JetBrains+Mono:wght@300..700&family=Inter:wght@400..600`

8. Instrument Serif + Geist
- Instrument Serif (400 normal e itálica) / Geist (wght 100..900). OFL.
- Personalidad: serif condensada elegante contemporánea + sans neutra. Sirve: títulos "premium" en SaaS, editorial moderno.
- `family=Instrument+Serif:ital@0;1&family=Geist:wght@300..700`

9. Unbounded + Outfit
- Unbounded (wght 200..900) / Outfit (wght 100..900). OFL.
- Personalidad: redondeada ancha futurista. Sirve: cripto/fintech/gaming, intros, neón.
- `family=Unbounded:wght@300..900&family=Outfit:wght@300..600`

10. Sora + Plus Jakarta Sans
- Sora (wght 100..800) / Plus Jakarta Sans (wght 200..800). OFL.
- Personalidad: tech limpia, amable. Sirve: UI mockups, explainers corporativos.
- `family=Sora:wght@300..800&family=Plus+Jakarta+Sans:wght@300..700`

11. Bebas Neue + Source Sans 3
- Bebas Neue (solo 400) / Source Sans 3. OFL.
- Personalidad: all-caps condensada, titulares. Sirve: kinetic type, trailers, deportes, urgencia.
- `family=Bebas+Neue&family=Source+Sans+3:wght@300..600`

12. DM Serif Display + DM Sans
- DM Serif Display (400 normal/itálica) / DM Sans. OFL.
- Personalidad: serif de display clásica, cálida + sans geométrica. Sirve: editorial, educación, marca cercana.
- `family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400..700`

13. Space Mono + Space Grotesk (bonus)
- Space Mono (400, 700, con itálica) / Space Grotesk. OFL.
- Personalidad: retro-futurista. Sirve: data viz, estética cyberpunk/terminal.
- `family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@400..700`

## Reglas prácticas
- Máximo 2 familias por video; variar peso/tamaño antes que sumar fuentes.
- Display >= 80px en 1080p; texto UI >= 32px (se ve en móvil).
- Los ejes variables (wght, wdth, opsz) son animables con GSAP vía `fontVariationSettings`: comprobar render en frames antes de depender de eso.
- Si un diseño necesita varias fuentes, empaquetar los .woff2 junto al HTML (autocontenido).

## Fuentes
- https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/METADATA.pb (y análogas: playfairdisplay, sourcesans3, bricolagegrotesque, dmsans, fraunces, inter, syne, manrope, anton, jetbrainsmono, instrumentserif, geist, unbounded, outfit, sora, plusjakartasans, bebasneue, dmserifdisplay, spacemono)
- https://developers.google.com/fonts/docs/css2
- https://openfontlicense.org/ofl-faq/
- Roboto: https://raw.githubusercontent.com/google/fonts/main/apache/roboto/METADATA.pb devolvió 404 -> NO VERIFICADO
