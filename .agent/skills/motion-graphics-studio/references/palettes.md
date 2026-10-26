# Catálogo de paletas (moods) para motion graphics

Nota de método: los hex de abajo son PROPUESTAS ORIGINALES inspiradas en la estética general de cada mood. No son los hex oficiales de ninguna marca (los hex oficiales de Claude, Apple, Notion, etc.: NO VERIFICADO, no los uses como si lo fueran). Los ratios de contraste no fueron calculados numéricamente; verificalos con la fórmula WCAG antes de usar (umbral WCAG 1.4.3: 4.5:1 texto normal, 3:1 texto grande, verificado en la fuente W3C). Reglas de proporción tipo 60/30/10 son heurística común de diseño: NO VERIFICADO en fuente primaria.

Reglas generales para video (aplican a todas):
- Un solo acento dominante + un acento secundario; el resto neutros. Más de 3 matices saturados = ruido.
- En video 1080p comprimido (H.264) los degradados oscuros suaves hacen banding: sumá grano leve (ver effects-techniques.md).
- Texto grande en pantalla permite 3:1, pero apuntá a >=4.5:1 siempre porque el video se ve en móviles con brillo bajo.
- Definí todo como variables CSS (`--bg`, `--surface`, `--text`, `--accent`, `--accent2`) y no hardcodees hex en las escenas.

Formato por entrada: roles -> hex.

---

## 1. Negro + glow naranja cálido (mood "IA cálida")
- Fondo `#0E0C0B` | Superficie `#1A1613` | Texto `#F4EDE6` | Texto atenuado `#A89B90` | Acento `#E8743B` | Acento 2 `#F2B880`
- Usar: lanzamientos de producto IA, explainers tech con tono humano; el glow naranja se coloca detrás del elemento clave (radial-gradient, no box-shadow gigante).
- NO hacer: azul frío como segundo acento (rompe la calidez); blanco puro `#FFF` sobre negro puro (deslumbra); glow en todos los elementos.

## 2. Blanco + pasteles difuminados (mood "Apple/Notion limpio")
- Fondo `#FAFAF8` | Superficie `#FFFFFF` | Texto `#1D1D1F` | Acento `#6C8CFF` | Acento 2 `#FFB3C7` | Pastel 3 `#BFEAD6`
- Usar: producto SaaS, onboarding, UI mockups; blobs pastel borrosos de fondo (radial-gradients grandes, baja opacidad).
- NO hacer: sombras negras duras; más de 3 pasteles a la vez; texto gris claro (falla contraste).

## 3. Editorial papel
- Fondo `#F3EDE2` | Superficie `#EAE2D3` | Texto `#1C1B19` | Acento `#B3261E` | Acento 2 `#2F4B3C`
- Usar: storytelling, citas, educación, newsletters en video; combina con serif (ver typography.md) y grano de papel.
- NO hacer: degradados brillantes o glow; sombras suaves tipo UI; bordes redondeados excesivos.

## 4. Neón cyberpunk
- Fondo `#08060F` | Superficie `#150F26` | Texto `#EDEAFF` | Acento `#FF2BD6` | Acento 2 `#19E3FF` | Aviso `#FFE83D`
- Usar: gaming, tech nocturno, música electrónica; con scanlines + aberración cromática.
- NO hacer: rosa y cian a igual intensidad en el mismo texto (vibración visual); párrafos largos en neón.

## 5. Infográfico / data
- Fondo `#0F172A` | Superficie `#1E293B` | Texto `#E2E8F0` | Acento `#38BDF8` | Acento 2 `#FBBF24` | Positivo `#34D399` | Negativo `#F87171`
- Usar: dashboards animados, métricas, reportes. Colores semánticos coherentes (verde sube, rojo baja).
- NO hacer: arcoíris de categorías (más de 5-6 series); rojo/verde como único diferenciador (daltonismo: sumar forma o etiqueta).

## 6. Tierra / orgánico
- Fondo `#EFE6D8` | Superficie `#DCCFB8` | Texto `#2B2A22` | Acento `#8A5A3B` | Acento 2 `#5F7A4E` | Acento 3 `#C98B3E`
- Usar: sustentabilidad, alimentos, bienestar, educación natural.
- NO hacer: grises fríos; verde fluorescente; fondos negros.

## 7. Monocromo + 1 acento (brutalista)
- Fondo `#F2F2F2` | Superficie `#FFFFFF` | Texto `#0A0A0A` | Acento `#FF3B00` | Línea `#0A0A0A`
- Usar: kinetic type agresivo, anuncios, moda; bloques planos, líneas gruesas, cero degradados.
- NO hacer: sombras, blur, más de un acento.

## 8. Noche profunda + violeta/azul (mood "SaaS premium")
- Fondo `#0B0B1A` | Superficie `#15152B` | Texto `#ECECFF` | Acento `#7C5CFF` | Acento 2 `#3DD6F5`
- Usar: fintech, B2B, lanzamientos con mesh gradient oscuro.
- NO hacer: violeta puro saturado sobre fondo negro puro con texto fino (vibra); abusar de glass.

## 9. Atardecer / gradiente cálido
- Fondo `#1B0F2E` | Superficie `#2D1B45` | Texto `#FFF3E8` | Acento `#FF7A59` | Acento 2 `#FFC857` | Acento 3 `#C13584`
- Usar: lifestyle, música, cierre emocional, intros; fondo con gradiente vertical violeta -> naranja.
- NO hacer: usar los tres acentos en un mismo elemento de texto; degradado sin grano (banding).

## 10. Menta fresca / salud
- Fondo `#F3FAF7` | Superficie `#FFFFFF` | Texto `#0F2A24` | Acento `#12B886` | Acento 2 `#4DABF7`
- Usar: salud, educación, apps de bienestar, tono amable.
- NO hacer: verde saturado sobre fondo blanco con texto verde claro (contraste bajo).

## 11. Retro 70s
- Fondo `#F4E3C1` | Superficie `#E9CFA0` | Texto `#3A2418` | Acento `#D9541E` | Acento 2 `#E9A23B` | Acento 3 `#4F7C82`
- Usar: nostalgia, música, branding cálido; formas redondeadas, grano, tipografía gruesa.
- NO hacer: neones; sombras digitales modernas.

## 12. Dark UI neutro (mood "dev tools")
- Fondo `#0D1117` | Superficie `#161B22` | Texto `#E6EDF3` | Texto atenuado `#8B949E` | Acento `#58A6FF` | Acento 2 `#3FB950`
- Usar: demos de código, terminales, documentación técnica; combina con fuente mono.
- NO hacer: glows exagerados; mezclar con paleta pastel.

## 13. Alto contraste amarillo/negro (alerta / urgencia)
- Fondo `#111111` | Superficie `#1E1E1E` | Texto `#FFFFFF` | Acento `#FFD400` | Acento 2 `#FF4D4D`
- Usar: noticias, avisos, anuncios de impacto, countdowns.
- NO hacer: usar el amarillo como fondo con texto blanco (contraste pésimo); prolongar demasiado (cansa).

## 14. Océano / cian profundo
- Fondo `#06232B` | Superficie `#0B3541` | Texto `#E6F7FA` | Acento `#2EC4B6` | Acento 2 `#FF9F1C`
- Usar: clima, ciencia, sustentabilidad, tecnología azul-verdosa; naranja como complementario de contraste.
- NO hacer: acento naranja en grandes superficies (compite con el fondo).

---

## Teoría de color mínima (para elegir y variar)
- Complementario (naranja vs cian/azul): máximo contraste, usarlo en 1 punto focal (mood 14, 1).
- Análogo (atardecer 9): armonía suave, ideal para fondos.
- Tríada/arcoíris: solo para data con leyenda.
- Cambiar de familia de color entre videos es la forma más barata de que "cada video salga distinto".

## Fuentes
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html (umbrales de contraste, consultada)
- https://developer.mozilla.org/en-US/docs/Web/CSS/radial-gradient (gradientes para glows/blobs, consultada)
- Los hex de cada mood son propuestas propias; no provienen de una fuente externa. Hex oficiales de marcas citadas como inspiración: NO VERIFICADO.
