# Repuestos JR

Sitio web de Repuestos JR, especializado en refacciones y repuestos para automóviles americanos.

## Sitio local

Abre `index.html` en un navegador o sirve la carpeta con cualquier servidor web estático.

## Publicación y SEO

La página es estática: no necesita un backend para que Google lea su contenido.
La carpeta `dist` contiene una copia para publicar. Al modificar HTML, CSS,
JavaScript o assets, actualiza también los archivos correspondientes en `dist`.
Publica el contenido de una sola de estas carpetas como raíz del sitio.

El HTML incluye la verificación de Search Console, metadatos locales y datos
estructurados de AutoPartsStore basados en el contacto visible del negocio.
No se declaran horarios, inventario ni puntuaciones sin confirmar.

URL principal configurada: `https://www.repuestosjr.com/`.

Ambas carpetas incluyen la URL canónica, `og:url`, la imagen social y las URLs
del negocio en JSON-LD. `sitemap.xml` contiene la página principal y está
referenciado en `robots.txt`.

Pendiente después de publicar:

- Verificar en producción que la página, los assets, robots y sitemap respondan correctamente.
- En Search Console, verificar la propiedad, enviar `https://www.repuestosjr.com/sitemap.xml` y solicitar indexación de la página principal.
- Configurar en el hosting redirecciones permanentes de HTTP a HTTPS y del dominio sin `www` al dominio principal, si aún no existen.

Mantén el nombre, teléfono y dirección consistentes con el Perfil de Empresa
de Google. La indexación y posición en resultados dependen de Google; estos
cambios no garantizan una posición ni una actualización inmediata.

