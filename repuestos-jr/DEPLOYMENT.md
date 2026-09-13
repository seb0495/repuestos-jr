# Cambios y puesta en producción

Se reemplazaron Chevrolet y GMC usando los archivos proporcionados. Se agregaron
Hummer, Lincoln, Mercury, Plymouth, Saturn y Buick. Se conservaron Ford, Dodge, Jeep,
Chrysler, Cadillac y Pontiac. `images.jfif` se identificó como Buick por confirmación del usuario.
Los nuevos archivos se copiaron sin pérdida; no se recortaron ni deformaron.
Se conserva `object-fit: contain` y el diseño responsive existente.
El teléfono principal 7216-1081 se añadió al pie de página. El contacto anterior
se conserva porque también se usa como canal directo de WhatsApp.

## Vercel y Redis

1. Crear una base Upstash Redis en modalidad gratuita, sin activar planes pagos.
2. Configurar en Vercel las variables de `.env.example`: URL y token REST de
   Upstash, y `WHATSAPP_REDIS_KEY=repuestos-jr:whatsapp:v1` en Production.
   No compartir los secretos en el chat ni incorporarlos a Git.
3. Para Preview usar otra base o una clave distinta, por ejemplo
   `repuestos-jr:whatsapp:preview:v1`, para no consumir turnos de producción.
4. Configurar Root Directory de Vercel como `repuestos-jr` (no `dist`).
   Framework: Other; sin compilación; salida: `dist`, declarada en `vercel.json`.
   Vercel detecta `api/whatsapp.js` como función Node.js.
5. Revisar y subir los cambios a la rama vinculada a Vercel, incluyendo los
   archivos nuevos de `assets`, `dist/assets`, `api` y `vercel.json`.
   No cambiar dominios, DNS ni `.openai/hosting.json`.
6. En Preview, ejecutar seis solicitudes distintas y dos simultáneas. Verificar
   la secuencia 7216-1081 → 7216-1161 → 8800-7211, dos veces. Luego publicar.

La función valida antes de consultar Redis. Un script Lua lee la posición y usa
un único HSET para guardar tanto la siguiente posición como la asignación del
identificador de solicitud. Redis ejecuta Lua atómicamente. Un reintento del mismo
identificador devuelve la asignación original; cambiar sus datos devuelve 409.
Solo se almacenan identificadores, hashes de los datos y posiciones; no los campos
del cliente. Las asignaciones no caducan: vigilar el almacenamiento del plan
gratuito. No borrar la clave ni activar expulsión de estos datos: reiniciaría la
secuencia y perdería la protección contra duplicados.

El frontend bloquea envíos mientras espera, omite campos opcionales vacíos y
codifica el mensaje. Navega en la misma pestaña para evitar bloqueos de ventanas.
Reintentar los mismos datos en la misma página reutiliza la asignación. Una nueva
consulta con datos distintos obtiene otro identificador. No hay carga de archivos
en el formulario original.

Si Redis falla o no está configurado, se abre el número de respaldo. Un fallo de
red después de confirmar Redis puede haber consumido un turno aunque el cliente
use el respaldo: no es posible prometer reparto estricto durante esos fallos.
Los registros contienen únicamente `whatsapp_assignment_unavailable`.

## Verificación

`node tests/whatsapp.cjs` cubre seis asignaciones, concurrencia, duplicados,
validación, conflicto de datos y respaldo con almacenamiento simulado.
No sustituye una prueba de atomicidad contra Redis real.
No hay dependencias, compilador ni suite previa en el proyecto.
La activación real, las pruebas con Redis y la comprobación visual en navegadores
quedan pendientes hasta contar con acceso a esos servicios.
