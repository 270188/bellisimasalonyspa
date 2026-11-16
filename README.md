# Bellísima Salon & Spa 💇‍♀️✨

Sitio web de un salón de belleza y spa de alta gama, construido con **Vite + TypeScript** (sin frameworks, carga ultrarrápida).

**Contacto configurado:** ☎ 990 073 634 · ✉ angelaruizleon2701@gmail.com

## Instalación

```bash
npm install
npm run dev       # servidor de desarrollo → http://localhost:5173
npm run build     # compila a /dist (listo para subir a Netlify, Vercel, Hostinger, etc.)
npm run preview   # vista previa de la versión compilada
npm test          # pruebas unitarias
```

## Desplegar en Vercel

El proyecto ya incluye `vercel.json` (Vite, salida `dist`, cabeceras de seguridad y caché).

**Opción A — desde GitHub (recomendada):**
1. Entra a [vercel.com/new](https://vercel.com/new) e inicia sesión con GitHub.
2. Importa el repositorio `bellisimasalonyspa` y selecciona la rama que quieras publicar.
3. Vercel detecta todo automáticamente: pulsa **Deploy**. Cada `git push` vuelve a publicar el sitio.

**Opción B — desde la terminal:**
```bash
npm i -g vercel
vercel          # vista previa
vercel --prod   # producción
```

## Qué editar

| Quiero cambiar… | Archivo |
|---|---|
| Teléfono, correo, dirección, redes sociales | `src/config.ts` |
| Horario de atención | `src/config.ts` (`OPENING_HOURS`) |
| Servicios, precios, duraciones e imágenes | `src/data/services.ts` |
| Equipo, galería y testimonios | `src/data/content.ts` |
| Colores y tipografías | `src/styles/main.css` (variables en `:root`) |
| Textos de secciones (nosotros, FAQ, privacidad) | `index.html` |

**Fotos propias:** colócalas en `public/images/` y usa `image: './images/mi-foto.jpg'` en el servicio.
Si alguna imagen no carga, el sitio muestra automáticamente una ilustración elegante con el nombre del servicio.

> Los testimonios incluidos son de ejemplo: reemplázalos por reseñas reales de tus clientas.

## Requerimientos funcionales

- **RF01** Catálogo con 38 servicios en 9 categorías (cabello, color, uñas, faciales, spa, maquillaje, cejas y pestañas, depilación, novias), cada uno con imagen, descripción, qué incluye, precio "desde" y duración.
- **RF02** Filtro por categoría, buscador (ignora tildes) y ordenamiento por precio, duración o nombre.
- **RF03** Ficha de detalle de cada servicio en ventana modal.
- **RF04** Selección de varios servicios para una misma cita, con total y duración estimados.
- **RF05** Formulario de reserva con validación: nombre, celular peruano, correo opcional, servicios, fecha (no pasada, máx. 90 días, solo días de atención) y hora (según horario y duración de los servicios).
- **RF06** Envío de la reserva por WhatsApp (990 073 634) o correo, con mensaje prellenado.
- **RF07** Botón flotante de WhatsApp y enlaces de llamada/correo.
- **RF08** Horario de atención con indicador "Abierto/Cerrado ahora".
- **RF09** Galería con visor ampliado (teclado y gestos táctiles), testimonios en carrusel, equipo, FAQ y política de privacidad (Ley 29733).
- **RF10** Guardado automático del borrador del formulario y de la selección de servicios.

## Requerimientos no funcionales

- **Rendimiento:** sin dependencias en tiempo de ejecución (~15 kB JS gzip), imágenes `lazy` con `srcset` responsivo, fuentes con `display=swap`.
- **Responsivo:** diseño adaptado a móvil, tablet y escritorio, sin desplazamiento horizontal.
- **Accesibilidad (WCAG 2.1 AA):** HTML semántico, enlace "saltar al contenido", foco visible, etiquetas ARIA, errores anunciados a lectores de pantalla, navegación por teclado, respeta "reducir movimiento".
- **SEO:** metaetiquetas, Open Graph, datos estructurados `BeautySalon` (JSON-LD), `robots.txt`, manifest.
- **Seguridad:** Content-Security-Policy, escape de todo texto dinámico, enlaces externos con `noopener`, sin almacenamiento de datos en servidores.
- **Mantenibilidad:** TypeScript estricto, datos separados de la lógica, pruebas unitarias con Vitest.
- **Resiliencia:** imágenes de respaldo automáticas, `localStorage` protegido ante errores, aviso si JavaScript está desactivado.
