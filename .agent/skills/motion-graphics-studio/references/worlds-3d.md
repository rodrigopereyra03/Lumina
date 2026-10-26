# Mundos 3D con Three.js (probado en HyperFrames)

Funciona con captura por software (`--no-browser-gpu`). Código completo en `examples/flythrough-3d-cine.html`.

## Carga
```html
<script src="https://cdn.jsdelivr.net/npm/three@0.146.0/build/three.min.js"></script>
```
Usar r146: versiones nuevas dejaron de publicar el build global `three.min.js`. Sin OrbitControls ni postproceso (bloom, etc.): no probados.

## Base
```js
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(1920, 1080, false);
renderer.setClearColor(0x0E0C0B, 1);              // si no se fija, queda negro puro
scene.fog = new THREE.FogExp2(0x0E0C0B, 0.065);   // mismo color que el fondo; 0.03 es muy débil
const camera = new THREE.PerspectiveCamera(38, 1920/1080, 0.1, 200);
```
Niebla 0.065: los objetos a >25 unidades desaparecen y recién se revelan al acercarse (con 0.03 quedaban amontonados detrás del texto). Para el plano general, animar la densidad a ~0.014 con un proxy `F = {d}` y asignarla en `renderWorld` (`scene.fog.density = F.d`).

Luces: `AmbientLight(0x6a5a50, .9)` + `DirectionalLight` cálida + una `PointLight(color, 3-4, 16)` junto a cada objeto, del color del objeto.

## Materiales
`MeshStandardMaterial({color, roughness:.3-.55, metalness:.15-.35, emissive})`. Un `emissive` oscuro del mismo tono da el aspecto "neón suave" sin postproceso.

## Objetos por primitivas (sin assets)
- **Hueso:** cilindro (r .22, largo 2.2, `rotation.z = π/2`) + 4 esferas r .36 en los extremos.
- **Tazón con agua:** `LatheGeometry` con perfil `[[0,0],[.9,0],[1.5,.25],[1.85,1],[1.75,1.05],[1.4,.4],[.9,.12],[0,.12]]` (`side: DoubleSide`) + `CircleGeometry` azul emisivo + gota (esfera `scale.y=1.4`) + `RingGeometry` que escala y se desvanece (ondas).
- **Huella:** esfera aplastada (pad, scale 1.35/1/.55) + 4 esferas (dedos) en arco.
- **Cruz veterinaria:** cilindro-disco (`rotation.x = π/2`) + 2 cajas rojas.
- **Corazón:** `Shape` con 5 bezier + `ExtrudeGeometry({depth:.28, bevelEnabled, bevelThickness:.09, bevelSize:.09, bevelSegments:5})`, `geometry.center()`, `scale 3.2`, `rotation.z = π`; latido con `1 + max(0, sin(3.2 t)) * .07`.
- **Polvo flotante:** `Points` con 520 puntos (PRNG con semilla), `PointsMaterial({size:.07, opacity:.7, depthWrite:false})`.

## Determinismo
Todo se anima en `renderWorld(t)` con `t = tl.time()`: rotaciones, flotación, ondas, latidos. Nada de `requestAnimationFrame`, `Date.now()` ni `Math.random()` en el render.

## Costo
Unos 5 minutos de render por 30 s a 1920x1080 con captura por software. Iterar con `snapshot`, renderizar al final.

## Ideas no probadas (marcar como tales si se usan)
Postproceso (bloom/DOF real), modelos GLTF, texturas de imagen, sombras proyectadas.
