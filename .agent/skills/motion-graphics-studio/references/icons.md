# Catálogo de librerías de íconos

Licencias verificadas leyendo el archivo LICENSE del repo oficial (raw.githubusercontent.com). Conteos de íconos: los que figuran en el README/página del repo consultada; pueden cambiar.

Resumen de licencias
| Librería | Licencia (verificada) | Titular |
|---|---|---|
| Lucide | ISC (y MIT para íconos derivados de Feather) | Lucide Icons and Contributors; Cole Bemis (Feather) |
| Heroicons | MIT | Tailwind Labs, Inc. |
| Phosphor | MIT | Phosphor Icons |
| Tabler Icons | MIT | Paweł Kuna |
| Iconoir | MIT | Luca Burgio |
| Material Symbols / Material Design Icons | Apache 2.0 (repo google/material-design-icons: LICENSE Apache 2.0; la doc de Google Fonts lo confirma para Material Symbols) | Google |
| Simple Icons | CC0 1.0 (del set) -- NO cubre marcas | Simple Icons contributors |

Condición común MIT/ISC: conservar el aviso de copyright y la licencia al redistribuir. Apache 2.0: incluir licencia, marcar modificaciones, NOTICE si existe. En un video renderizado (MP4) la obligación práctica es mínima, pero si se redistribuye el HTML/SVG fuente, incluir el aviso.

---

## 1. Lucide
- Estilo: outline (trazo), 24x24, trazo editable (stroke-width). Forks de Feather. Mood: limpio, tech, SaaS, mood 2/5/8/12.
- Uso autocontenido: copiar el `<svg>` inline; o `lucide-static` (SVGs, sprites, icon font) por npm. Doc: lucide.dev/guide/packages/lucide-static. CDN: unpkg/jsDelivr del paquete npm `lucide-static` (URL exacta del CDN: NO VERIFICADO, armar la ruta con la versión).

## 2. Heroicons
- Estilos: outline, solid, mini (20), micro (16). Íconos curados por Tailwind Labs. Mood: UI de producto neutro, estilo Tailwind.
- Uso: SVG inline (se copia el markup). Paquetes `@heroicons/react` y `@heroicons/vue` (npm). Para HTML autocontenido, copiar SVG.

## 3. Phosphor
- Seis pesos verificados en el repo `phosphor-icons/core`: thin, light, regular, bold, fill, duotone. SVGs en `/assets/<peso>/`. Paquete npm `@phosphor-icons/core`.
- Mood: la mejor para variar (el mismo set en 6 estilos); duotone para estética moderna/Apple-like, thin para editorial, bold para kinetic.

## 4. Tabler Icons
- 6.220 íconos (5.166 outline + 1.054 filled), grilla 24x24, trazo 2px (según README). Paquetes `@tabler/icons-*`, disponibles vía jsDelivr (confirmado en README, patrón de URL exacto: NO VERIFICADO).
- Mood: data/infográfico, dashboards, cobertura enorme de conceptos.

## 5. Material Symbols (Google)
- Estilos Outlined, Rounded, Sharp; ejes variables FILL (0-1), wght (100-700), GRAD, opsz (20-48), según la doc de Google. Se carga como fuente:
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL,wght@0..1,100..700" rel="stylesheet">
<span class="material-symbols-outlined">palette</span>
```
(El CSS de `.material-symbols-outlined` lo incluye la hoja; para determinismo esperar `document.fonts.ready` o empaquetar la fuente.)
- Parámetro `icon_names=` permite subsetear y reducir el peso (doc oficial).
- Mood: Android/Google-like, apps de gestión; animable FILL/wght.

## 6. Iconoir
- 1.600+ íconos SVG 24x24, MIT. CDN documentado en el README: `https://cdn.jsdelivr.net/gh/iconoir-icons/iconoir@main/css/iconoir.css` (versión CSS).
- Mood: trazo fino elegante, editorial/minimal.

## 7. Simple Icons (logos de marcas) -- CASO ESPECIAL
- 3.400+ SVG de marcas. Licencia del set: CC0 1.0 (verificada). 
- CC0 verifica su propio texto: "No trademark or patent rights held by Affirmer are waived, abandoned, surrendered, licensed or otherwise affected by this document." => CC0 cubre el copyright del dibujo del set, NO otorga ningún derecho sobre las marcas registradas representadas.
- El DISCLAIMER del propio repo (paráfrasis): el proyecto no es responsable de disputas de marca; el usuario debe obtener los permisos necesarios y revisar las guías de marca oficiales; "Simple Icons cannot be held responsible for any legal activity raised by a brand, or users of the package."
- Regla para nuestro uso comercial: si un video usa logos de terceros (clientes, partners, "trusted by"), el logo y su autorización deben venir del cliente (assets oficiales y/o permiso por escrito). No bajar logos de Simple Icons "porque son CC0" y usarlos sin autorización. Usos de referencia nominativa (mencionar el nombre en texto) tienen otras reglas: consultar a legal.
- Uso técnico: `https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/[slug].svg`; `https://cdn.simpleicons.org/[slug]/[color]` (ambos del README oficial; la versión mayor puede cambiar).
- Apple, en particular, restringe el uso de su logo y de imágenes de producto (ver device-mockups.md).

## Rutas CDN verificadas (HTTP 200, 2026-10-02)
- Lucide: `https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/<nombre>.svg`
- Tabler: `https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons/outline/<nombre>.svg`
- Phosphor: `https://cdn.jsdelivr.net/npm/@phosphor-icons/core@latest/assets/<peso>/<nombre>-<peso>.svg` (ej. `duotone/heart-duotone.svg`; el peso `regular` no lleva sufijo)
- Iconoir (CSS): `https://cdn.jsdelivr.net/gh/iconoir-icons/iconoir@main/css/iconoir.css`
- Simple Icons: `https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/<slug>.svg`
- Para render determinístico: descargar el SVG e incrustarlo inline en vez de depender de red durante la captura.

## Cuál para qué mood
| Mood | Librería sugerida |
|---|---|
| Editorial / papel | Iconoir, Phosphor thin/light |
| SaaS premium / Apple-like | Phosphor duotone/regular, Lucide |
| Data / dashboards | Tabler, Material Symbols |
| Cyberpunk / neón | Phosphor bold/fill con glow, Tabler |
| Brutalista / kinetic | Phosphor bold/fill |
| UI Android / Google-like | Material Symbols |
| Orgánico / bienestar | Phosphor light/regular, Lucide |

## Recomendaciones de uso en HyperFrames
- Inline SVG (no fuente de íconos si se puede) para no depender de carga de red y facilitar animar `stroke-dashoffset` (dibujado de trazo) con GSAP.
- Usar `stroke="currentColor"` y controlar color/grosor por CSS.
- Mantener un solo set de íconos por video (coherencia de trazo).

## Fuentes
- https://raw.githubusercontent.com/lucide-icons/lucide/main/LICENSE
- https://raw.githubusercontent.com/tailwindlabs/heroicons/master/LICENSE
- https://raw.githubusercontent.com/phosphor-icons/core/main/LICENSE
- https://raw.githubusercontent.com/tabler/tabler-icons/main/LICENSE
- https://raw.githubusercontent.com/iconoir-icons/iconoir/main/LICENSE
- https://raw.githubusercontent.com/google/material-design-icons/master/LICENSE
- https://raw.githubusercontent.com/simple-icons/simple-icons/develop/LICENSE.md
- https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md
- https://lucide.dev/guide/packages/lucide-static
- https://github.com/phosphor-icons/core
- https://github.com/tabler/tabler-icons
- https://github.com/tailwindlabs/heroicons
- https://github.com/iconoir-icons/iconoir
- https://github.com/simple-icons/simple-icons
- https://developers.google.com/fonts/docs/material_symbols
