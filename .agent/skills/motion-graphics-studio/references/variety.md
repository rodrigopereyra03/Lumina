# Motor de variedad

Objetivo: que dos videos consecutivos de la misma persona o proyecto NO se parezcan. La variedad se fuerza con un historial, no con "intentar variar" (el modelo converge a sus combinaciones favoritas).

## Qué varía (dimensiones)
- **Clave (se compara contra el historial):** formato, paleta, par tipográfico, personalidad de movimiento, cámara, apertura, cierre.
- **Complementarias:** texturas (2), tomas núcleo (3), fondo vivo, transición, aspecto.
- Tamaño actual del baúl (contado de `pools.json`): 6 formatos (los 6 con ejemplo renderizado), 14 paletas, 13 pares tipográficos, 4 personalidades de movimiento, 8 texturas, 6 cámaras, 7 aperturas, 5 cierres, 18 tomas núcleo, 7 fondos, 6 transiciones.

## Cómo se usa
```bash
# desde la carpeta del proyecto (el historial vive en ./motion-history.json)
node <skill>/scripts/roll.cjs --aspect landscape --save
# opciones: --aspect vertical | --format <id> | --allow-untested | --avoid 3 | --seed N | --history ruta.json
# ver variedad sin guardar:
node <skill>/scripts/roll.cjs --preview 8
```
Imprime un brief en markdown (con punteros a las secciones de `references/`) y un JSON.

## Reglas del motor
1. Compatibilidad: la paleta define un grupo (`groups` en `pools.json`) que limita tipografía, texturas y personalidad de movimiento. El formato limita cámara, apertura, cierre, tomas núcleo y fondos. `flythrough-3d` solo con paletas oscuras. Los fondos de bokeh/polvo se excluyen en paletas claras (el blanco no se ve).
2. Contra la última tirada: al menos 4 de las 7 dimensiones clave deben ser distintas.
3. Paleta y par tipográfico no pueden repetir ninguno de los últimos 3 videos.
4. El formato no repite en las 2 tiradas anteriores (si hay más de 2 formatos disponibles).
5. Si tras 600 intentos no hay candidato válido, usa el de menor penalización.

## Qué puede y qué no puede hacer el agente con la tirada
- **Debe** seguir el brief salvo restricción real del cliente (`brand.md`/`MOTION.md`, paleta de marca, tipografía obligatoria, assets). Esas restricciones pisan la tirada: fijar la dimensión y volver a tirar el resto.
- **Puede** cambiar UNA dimensión si la tirada es incoherente con el contenido, explicando por qué en una línea, y guardarlo en el historial.
- **No puede** elegir "lo que más le gusta" ignorando el brief.
- Si sale un formato/opción `untested`: avisar al usuario, validar con snapshots y, si funciona, pasarlo a `tested` en `pools.json` con su ejemplo.

## Cómo crecer el baúl
Agregar entradas a `pools.json` (paletas, tipografías, formatos, tomas) y su receta a `references/`. Cada entrada nueva debe tener un ejemplo renderizado en `examples/`, o quedar marcada `untested`. Lo que funcione se registra en `lockdowns.md` (errores) o `shot-types.md` (recetas).
