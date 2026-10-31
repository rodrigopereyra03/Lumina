# Three.js Modern API & Deterministic Video Bridge (r180+)
*Inspirado en CloudAI-X/threejs-skills adaptado a renderizado de video determinístico con HyperFrames.*

Las versiones modernas de Three.js (r180 a r186+) cambiaron drásticamente respecto al código antiguo con el que suelen entrenarse los LLMs. En producción para video, usar APIs obsoletas provoca pantallas negras, errores de contexto WebGL o desincronización de frames.

---

## 1. Tabla de APIs: Obsoleta vs. Moderna (r180+)

| API Obsoleta (Alucinación frecuente) | API Moderna (Estándar r180+) | Por qué importa |
|---|---|---|
| `new THREE.Clock()` | `new THREE.Timer()` o **Proxy GSAP** | `Clock.getDelta()` depende del reloj del CPU; rompe el determinismo de HyperFrames. |
| `RGBELoader` | `HDRLoader` | `RGBELoader` fue renombrado en r182+. |
| `renderer.outputEncoding = THREE.sRGBEncoding` | `renderer.outputColorSpace = THREE.SRGBColorSpace` | `outputEncoding` está deprecado y genera colores lavados/oscuros. |
| `renderer.physicallyCorrectLights = true` | `renderer.useLegacyLights = false` (o default r180+) | Las luces físicas ahora son el estándar por defecto. |
| `THREE.Geometry` | `THREE.BufferGeometry` | `Geometry` fue eliminado por completo de Three.js. |
| `renderer.shadowMap.type = THREE.PCFSoftShadowMap` | `THREE.PCFSoftShadowMap` configurado con bias explícito | Evita shadow acne en tarjetas headless/CI. |
| `requestAnimationFrame(animate)` libre | **Render dirigido por el Timeline de GSAP** | El video DEBE renderizarse al tick exacto de GSAP, no al frame rate del monitor. |

---

## 2. El Puente Determinístico: GSAP $\rightarrow$ Three.js (Crucial para HyperFrames)

En HyperFrames, el navegador avanza el tiempo de forma discreta (frame 0, frame 1, frame 2... a 60 fps). Si Three.js tiene un `requestAnimationFrame` tradicional, el renderizador 3D irá a una velocidad distinta a los textos y capas HTML.

### El Patrón Maestro de Sincronización:
```javascript
// 1. Setup básico Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('three-canvas'),
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(width, height);
renderer.setPixelRatio(1); // En render headless mantener 1 o 2 fijo

// 2. Objeto Proxy para controlar el estado 3D
const state3D = {
  camX: 0,
  camY: 4,
  camZ: 12,
  lookX: 0,
  lookY: 0,
  lookZ: 0,
  meshRotY: 0,
  uniformTime: 0
};

// 3. Función de dibujo único (se ejecuta cada vez que GSAP avanza un frame)
function render3DFrame() {
  camera.position.set(state3D.camX, state3D.camY, state3D.camZ);
  camera.lookAt(state3D.lookX, state3D.lookY, state3D.lookZ);
  mesh.rotation.y = state3D.meshRotY;
  
  if (customMaterial.uniforms) {
    customMaterial.uniforms.uTime.value = state3D.uniformTime;
  }
  
  renderer.render(scene, camera);
}

// 4. Conectar al Timeline Principal de HyperFrames
// El timeline maestro de la composición se encarga de llamar al render
tl.to(state3D, {
  camZ: 3,
  camY: 1,
  meshRotY: Math.PI * 2,
  uniformTime: 5.0,
  duration: 5,
  ease: "power2.inOut",
  onUpdate: render3DFrame
}, 0); // en el segundo 0
```

---

## 3. Shaders Procedurales determinísticos (Sin `Math.random()`)

En shaders WebGL, nunca dependas del reloj del sistema. Pasa siempre un uniform `uTime` controlado por el timeline de GSAP:

```glsl
// Vertex Shader
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment Shader (ejemplo: onda cinética de brillo)
uniform float uTime;
uniform vec3 uColor;
varying vec2 vUv;

void main() {
  // Gradiente dinámico determinístico
  float wave = sin(vUv.y * 10.0 + uTime * 3.0) * 0.5 + 0.5;
  vec3 finalColor = mix(uColor * 0.2, uColor * 1.5, wave);
  gl_FragColor = vec4(finalColor, 1.0);
}
```

---

## 4. Iluminación Cinematográfica de 3 Puntos (Listo para Motion Graphics)

En vez de colocar luces arbitrarias que aplanan la escena, usa siempre el setup cinematográfico clásico:

```javascript
// 1. Key Light (Luz principal dominante con sombra)
const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(5, 8, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.bias = -0.0001;
scene.add(keyLight);

// 2. Fill Light (Luz de relleno suave, tono complementario)
const fillLight = new THREE.DirectionalLight(0x4466ff, 1.0);
fillLight.position.set(-6, 2, -2);
scene.add(fillLight);

// 3. Rim/Back Light (Luz de recorte para separar el objeto del fondo)
const rimLight = new THREE.DirectionalLight(0xffaa44, 3.5);
rimLight.position.set(0, 5, -8);
scene.add(rimLight);

// 4. Ambiente mínimo de oclusión
const ambient = new THREE.AmbientLight(0x0a0d14, 0.4);
scene.add(ambient);
```

---

## 5. Prevención de Fugas de Memoria en Headless Renderers
Al finalizar o en cada toma que cambie de escena:
```javascript
function disposeScene(scene) {
  scene.traverse(object => {
    if (!object.isMesh) return;
    object.geometry.dispose();
    if (Array.isArray(object.material)) {
      object.material.forEach(mat => mat.dispose());
    } else {
      object.material.dispose();
    }
  });
}
```
