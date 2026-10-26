# Fuentes de mockups de dispositivos

Resumen ejecutivo: para video comercial, lo más seguro y flexible es CONSTRUIR el marco en CSS/SVG propio (genérico, sin copiar el diseño exacto de un producto de marca) o usar librerías CSS MIT. Los assets oficiales de Apple tienen condiciones restrictivas (abajo). No se descargó ni incluyó ningún asset.

---

## A. Assets oficiales de Apple

### A1. Apple Design Resources (product bezels)
- URL: https://developer.apple.com/design/resources/
- Incluye (según la página): product bezels en PNG y Photoshop para iPhone, iPad, Mac (MacBook Air/Pro, iMac), Apple Watch, Apple TV, Studio Display; plantillas Figma/Sketch/PS/Illustrator; fuentes SF; SF Symbols.
- Condición declarada en la página: al usar bezels en marketing hay que revisar las "Marketing Resources and Identity Guidelines".
- Licencia exacta de los bezels: NO VERIFICADO el texto completo del acuerdo (se requiere aceptar un acuerdo para descargar).

### A2. Marketing Resources and Identity Guidelines (Apple)
- URL: https://developer.apple.com/app-store/marketing/guidelines/
- Reglas relevantes (de la página consultada):
  - Las imágenes de producto Apple deben usarse "tal cual": NO agregar reflejos, sombras, brillos; NO recortar, inclinar ni tapar; NO animar, voltear ni girar; NO renderizar en 3D ni simular productos Apple; NO ilustraciones que representen productos Apple.
  - Tamaño mínimo: 200 px en pantalla.
  - Contenido de pantalla: mostrar la app tal como corre; no pantallas en blanco; barra de estado completa; sin Home Screen.
  - Sin superposiciones de texto sobre la imagen; el texto promocional va al costado.
  - Acuerdo: "App Store Marketing Artwork License Agreement": licencia no exclusiva, intransferible, libre de regalías, válida solo mientras se sea miembro del Apple Developer Program; Apple retiene la propiedad.
- Implicancia para motion graphics: los bezels oficiales NO se pueden animar ni inclinar en 3D => no sirven para nuestro caso típico (cámara 3D, parallax, tilt). Además la licencia depende de ser miembro del Apple Developer Program. Para uso con PNG de pantalla transparente: técnicamente sí (PNG + pantalla transparente) pero solo estático, sin efectos, y con licencia del Developer Program. Recomendación: NO usarlos en la skill por defecto.

### A3. Guidelines for Using Third-Party Trademarks and Copyrights
- URL: https://www.apple.com/legal/intellectual-property/guidelinesfor3rdparties.html
- Puntos (de la página): no usar el logo de Apple en publicidad sin ser revendedor/licenciatario autorizado; no usar imágenes de producto para sugerir aval; no usar marcas Apple en nombres de empresa/producto; referencias de compatibilidad con la marca de palabra (no el logo) y menos prominente que el nombre propio; incluir disclaimer de independencia.

---

## B. Facebook / Meta Design device mockups
- URL original citada en la web: facebook.github.io/design/devices -> responde 404; design.facebook.com/toolbox/devices redirige a https://www.meta.com/design-at-meta/ (301) y esa página no muestra el recurso ni sus términos.
- Informes de terceros (2016, secundarios) dicen: PNG + archivos Sketch de dispositivos Apple/Samsung/Google/HTC/Microsoft, "gratis siempre que no los redistribuyas como obra propia".
- Estado: NO VERIFICADO en fuente oficial; el recurso parece discontinuado. No usar sin confirmar los términos.
- Fuente secundaria: https://gigazine.net/gsc_news/en/20160108-facebook-design-resources-devices

---

## C. Marcos de dispositivo construidos en CSS puro (open source)

### C1. marvelapp/devices.css
- Repo: https://github.com/marvelapp/devices.css
- Licencia: MIT, Copyright Marvelapp (2014) (LICENSE verificado).
- Qué ofrece: marcos de teléfono/tablet sin imágenes, usando `devices.min.css` y copiando el markup de la demo. Instalación: npm/Bower/CDN según README (rutas exactas: NO VERIFICADO).
- Ventaja: sin imágenes, escalable a 1920x1080 y vertical. Limitación: diseño más antiguo (modelos viejos).

### C2. picturepan2/devices.css
- Repo: https://github.com/picturepan2/devices.css
- Licencia: MIT, Copyright Yan Zhu (2017) (LICENSE verificado).
- Dispositivos (README): iPhone 14 Pro/14/X/8, Google Pixel, Galaxy S8, MacBook Pro/Air, iMac, Surface Book/Studio, iPad Pro, Surface Pro, Apple Watch, HomePod, Pro Display XDR. Se carga con `<link rel="stylesheet" href="dist/devices.css">` (copiado localmente => autocontenido); clases `.device-frame` y `.device-screen`. Estilo más moderno que C1.
- Atención: son réplicas fieles de productos de marca: MIT cubre el CÓDIGO; el uso de la apariencia de un producto Apple en material comercial puede tocar las guías de Apple (A2/A3). Para uso comercial con cliente externo, consultar. No afirmado como seguro.

### C3. jhildenbiddle/css-device-frames
- Repo: https://github.com/jhildenbiddle/css-device-frames ; paquete npm `css-device-frames` v1.0.6 (jsDelivr).
- Licencia: MIT, Copyright John Hildenbiddle (2021) (LICENSE verificado).
- Qué ofrece: marcos de un solo elemento, solo CSS, con temas claro/oscuro, personalizables con CSS custom properties; iPhone, iPad, iMac, MacBook, laptop y ventana de navegador (según jsDelivr). CDN: jsDelivr (confirmado).
- Útil para el frame "browser" genérico.

### C4. pixelsign/html5-device-mockups
- Repo: https://github.com/pixelsign/html5-device-mockups
- Licencia del código: MIT. Incluye IMÁGENES prerenderizadas de 86 dispositivos; los créditos de los renders originales están en un CREDITS.txt aparte: la licencia de esas imágenes NO VERIFICADO (el MIT del repo no necesariamente cubre esos renders). No recomendado hasta leer CREDITS.txt.

### Otras opciones vistas solo en un buscador (NO VERIFICADO)
- react-mockframe (MIT según resultado de búsqueda), componentes tipo "mockup" de 21st.dev/Launch UI: dependen de React; licencia solo reportada por el buscador, no leída en repo.

---

## Rutas CDN verificadas (2026-10-02)
- picturepan2/devices.css: `https://cdn.jsdelivr.net/gh/picturepan2/devices.css@master/dist/devices.min.css` -> 200.
- css-device-frames `@1.0.6/dist/css-device-frames.min.css` -> 404: la ruta de archivo del paquete es otra; mirar el listado del paquete en jsDelivr antes de usarla.

## D. Recomendación para la skill
1. Default: frames genéricos propios en CSS/SVG (rect redondeado + notch/isla genérica + bisel), con colores de paleta; evita problemas de marca y se anima libre (tilt 3D, parallax).
2. Segundo nivel: css-device-frames (MIT) para ventana de navegador y laptop genérica.
3. Réplicas fieles (devices.css de picturepan2): solo con revisión de uso de marca.
4. Assets oficiales Apple (PNG con pantalla transparente): solo estáticos, sin animar/3D, bajo las condiciones del acuerdo; no por defecto.
5. No incluir logos ni el logo de manzana en los marcos.

## Fuentes
- https://developer.apple.com/design/resources/
- https://developer.apple.com/app-store/marketing/guidelines/
- https://www.apple.com/legal/intellectual-property/guidelinesfor3rdparties.html
- https://www.meta.com/design-at-meta/
- https://gigazine.net/gsc_news/en/20160108-facebook-design-resources-devices
- https://github.com/marvelapp/devices.css y https://raw.githubusercontent.com/marvelapp/devices.css/master/LICENSE
- https://github.com/picturepan2/devices.css y https://raw.githubusercontent.com/picturepan2/devices.css/master/LICENSE
- https://www.jsdelivr.com/package/npm/css-device-frames y https://raw.githubusercontent.com/jhildenbiddle/css-device-frames/master/LICENSE
- https://github.com/pixelsign/html5-device-mockups
