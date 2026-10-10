# Sitio Santiago Nievas — CLAUDE.md

Sitio estático (HTML + CSS + JS vanilla) de **Santiago Nievas**, programador y consultor SAP Basis (Buenos Aires).
Rediseño total del sitio anterior (`../index.html` + `../pagos.css`, que quedan solo como **referencia de textos**; no se tocan).

## Reglas duras (no romper)
- **Sin build, sin npm, sin frameworks.** Tiene que funcionar abriendo `index.html` con doble clic y subiendo la carpeta a cualquier hosting estático.
- **Sin backend:** nada de pagos, login, admin ni llamadas a APIs (el sitio viejo tenía MercadoPago, agenda en el servidor y un panel admin; todo eso se descartó a propósito).
- **JS en IIFE con `<script defer>`**, nunca `type="module"` (rompe en `file://`).
- **Animar solo `transform` y `opacity`.** Respetar `prefers-reduced-motion` (bloque al final de `styles.css` + chequeos `prefersReduced()` en JS).
- **El contenido va hardcodeado en el HTML;** JS solo lo mejora. Si JS falla, la página se lee igual (red de seguridad: `.js:not(.reveal-on) [data-reveal]` muestra todo a los 6 s).
- Cada init de JS corre envuelto en `safe(fn, nombre)`: si uno falla, los demás siguen.
- **Cache-buster `?v=AAAAMMDD`** en `styles.css` y `script.js` de **las 5 páginas**. Subirlo en cada deploy (hoy: `20261011`; también en `404.html`).
- **Deploy:** GitHub Pages desde `main` (raíz) → https://axeljaviersalomon.github.io/Santiiweb/. Push = deploy.
- `.htaccess` en la raíz: HTML/CSS/JS sin caché, imágenes 1 mes (Apache/LiteSpeed).
- Textos en **español argentino (voseo)**, conservados del sitio original. No inventar copy de marketing.

## Estructura
```
sitio/
  index.html        Inicio: héroe con frase "Tengo [x] y necesito [y]" en bloques giratorios → banda "La primera consulta no se cobra" → propuesta + form rápido WhatsApp, marquesina, problemas, credenciales SAP, CTA
  servicios.html    Qué hago (4 servicios) + Cómo trabajamos (4 pasos) + formas de pago
  perfil.html       Bento: SAP Basis, +4 años, certificación SAP a lo ancho (#certificacion: insignia + qué acredita), incidentes, UTN (#formacion), desarrollador, código + frase
  presupuesto.html  Cotizador (servicio / tamaño / plazo → estimación en vivo) + datos → WhatsApp  ← FORMULARIO PRINCIPAL
  contacto.html     Canales + agenda de consulta (turno por WhatsApp) + preguntas frecuentes
  styles.css        Todo el CSS (tokens en :root)
  script.js         Todo el JS
  .htaccess
  robots.txt / sitemap.xml   SEO (URL base de GitHub Pages; cambiarla si hay dominio propio)
  404.html          Página de error con la estética del sitio (noindex, sin header ni JS)
  assets/brand/     Logos en WebP + capas del isotipo para animar + favicon.png + apple-touch-icon.png + og-image.jpg (1200x630, para compartir)
  assets/cert/      Insignia oficial de la certificación SAP HANA 2.0 SPS05 (PNG de Credly)
  assets/hero/      Fondos de los héroes (uno por página), fotos CC0 de Openverse (StockSnap / rawpixel), WebP 1600 px desaturadas
```
Nav: Inicio · Servicios · Perfil · Presupuesto · Contacto (header compacto de 64 px, sin subtítulo en la marca).
Header, menú móvil, footer, sprite de íconos SVG, preloader y cortina están **duplicados en las 5 páginas**: si cambiás uno, cambialo en todas. (`aria-current="page"` solo en la nav del header y del menú, no en el footer).

## Constantes clave (inicio de `script.js`)
- `WHATSAPP_NUMBER = '5491168489382'` — el número de todos los links de WhatsApp.
- `CONTACT.phone` / `phoneLabel` = `+5491168489382` / `+54 9 11 6848-9382`.
- `CONTACT.email`, `linkedin` y `github` están **vacíos a propósito** (en el sitio viejo eran placeholders). Si están vacíos, se ocultan los elementos con `data-cfg="email|linkedin|github"`. Para activarlos, completar el valor y listo.
- `PRICING`, `TIMES`, `PLANS`: precios en USD, multiplicadores por plazo y textos de propuesta, copiados del sitio original.
- `AGENDA`: lunes a viernes, 09–12 y 18–20 h, turnos de 30 min, 12 h de anticipación, 21 días hacia adelante, zona horaria UTC-3 fija (Argentina).

## Formularios → WhatsApp
- `buildMessage(intro, rows)`: **un renglón por campo** (`Campo: valor`); omite los vacíos y aplana los saltos de línea. Se codifica con `encodeURIComponent` en `waUrl()`.
- `sendToWhatsApp(form, btn, text)`: botón **cargando (850 ms) → listo (650 ms) → `location.href = wa.me/...`**. Deja en `[data-status]` un link de respaldo "tocá acá".
- Validación propia (sin `alert()`): `required`, `data-min`, `type="email"`, `data-phone` (8 a 15 dígitos), `data-msg` (mensaje cuando falta), `data-label`. Los errores van al `<p class="field-error">` referenciado por `aria-describedby`, con `aria-invalid`.
- Hay tres formularios: rápido (inicio), presupuesto y agenda. `presupuesto.html?s=web|tienda|auto|sistema|sap|nose` preselecciona el servicio.

## Diseño
- Paleta del logo: navy `#1D2837` / fondos `#070D16`–`#162336`, oro `#D1A33D` (+ `#E6C987`), marfil `#F6F4EF`. Oro como texto sobre fondo claro → usar `--gold-ink #85621A` (contraste AA).
- Tipografía: **Helvetica** (Helvetica Neue, Arial de respaldo) en todo el sitio, sin fuentes web. Sin guiones largos (—) ni numeración 01/02; solo se numeran los 4 pasos de "Cómo trabajamos".
- Motivo de marca: **esquina cortada + cuña dorada** en las tarjetas (`.card`, `.plan`, `.cta-panel`, `--cut`): la cuña es una banda paralela al corte, en la mitad de adentro del cuadrado (la de afuera la recorta el `clip-path`). En escritorio aparece con hover; en táctil, siempre. Los héroes van centrados y sin retícula decorativa. Botones cuadrados con hover clásico; radios chicos en todo (`--r-*` de 2 a 4 px) para mantener el lenguaje angular.
- Contraste: `--muted #4A5465` (7:1), `--gold-ink #7A5914`, `--wa #178046` (texto blanco AA), bordes de campos `--line-strong` y sobre oscuro `--line-dark-strong` (3:1). Foco: navy en claro, oro en oscuro (variable `--focus`).
- Cada h1 de héroe lleva una bajada (`.hero-kicker`) adentro del mismo h1, en oro claro.
- Breakpoints de referencia: 375 / 768 / 960 (nav de escritorio) / 1000 (cotizador en 2 columnas) / 1440.

## Consulta sin cargo y SAP (pedido del cliente, 2026-10-10)
- La primera consulta **sin cargo** tiene que verse siempre: banda dorada `.free-band` (Inicio y Servicios), primer dato del héroe, CTAs "Agendar consulta sin cargo", primera pregunta del FAQ y etiqueta en la agenda.
- **La certificación SAP está vencida y la carrera de la UTN no está terminada.** Se mencionan sin mentir ni exponerlo: "certificación aprobada" (nunca año ni link a Credly, que muestra el vencimiento) y "estudios en la UTN" (nunca "técnico", "título" ni "recibido").
- SAP Basis, la certificación y la UTN van destacados (sección de credenciales en Inicio, tarjetas grandes en Perfil).
- Sin guiones decorativos en eyebrows ni viñetas, sin brillos radiales (`.glow`), sin punto verde "Disponible", sin punto final en titulares. Evitar muletillas tipo "sin vueltas", "del otro lado", "no X, sino Y".

## Animaciones
- **Frase del héroe:** dos carteles split-flap (`.flap`, estilo reloj de mesa / tablero de aeropuerto): mitades fijas + dos paletas que giran sobre la bisagra; antes de la palabra final pasan `FLAP_SPINS` paletas rápidas. Cada `PRISM_EVERY` (3 s) cambia el par (`PAIRS`, `FLAP_FAST`, `FLAP_FINAL` en `script.js`); la propuesta de abajo sigue al par visible. Se pausa fuera de pantalla, con el mouse encima, o al elegir un punto (tocar un cartel la vuelve a hacer girar); no hay botón de pausa. Con movimiento reducido cambia sin animar. La propuesta solo se anuncia a lectores de pantalla cuando el cambio lo pide la persona (`aria-live` dinámico). En celular (<560 px) cada parte de la frase va en su renglón.
- **Preloader en todas las páginas:** el isotipo se arma por capas (`mark-s-light`, `mark-g-bar`, `mark-g-wedge`, `mark-g-bl`), entra el nombre, se dibuja la línea dorada y la pantalla sube. CSS keyframes escalados por `--k`: primera visita de la sesión completa (~2,3 s); después (`.pl-fast`, decidido por el script inline del `<head>` con `sessionStorage 'sn-seen'`) al 60 %. `INTRO_DELAY` en JS acompaña esos tiempos.
- **Cortina de salida:** al hacer clic en un link interno sube una cortina navy (500 ms) y la página nueva arranca con el preloader, así se ve continuo. Con movimiento reducido no hay cortina.
- **Héroes con foto:** `.hero-bg` (parallax) bajo un velo navy (`.hero::after`); la foto entra con zoom lento cuando aparece `.is-ready`.
- **Panel "Siguiente paso"** (`.cta-panel`, en Inicio, Servicios y Perfil): navy con esquina cortada, isotipo grande que se arma por capas al entrar en pantalla (`data-assemble`) y sigue al cursor (`data-tilt` + `data-depth` en los `span.tilt`).
- **Cómo trabajamos:** escalera ascendente (cada paso sube un escalón, entra desde abajo en orden y dibuja su peldaño dorado).
- **Botones:** hover sutil, barrido del tono de hover con `scaleX` + flecha que avanza 4 px. Nada gira.
- Texto sobre fondo oscuro en blanco (`--on-dark #FFF`, `--on-dark-muted` al 86 %); eyebrows con guion dorado.
- Revelado por scroll (`data-reveal`, `--d` para escalonar), titulares por palabra (`data-split`), parallax (`data-parallax="factor"`), isotipo del héroe que sigue al cursor (`data-tilt` + `data-depth`), botones magnéticos (`data-magnetic`), spotlight (`.spot`), contador (`data-count`), header que se oculta al bajar, barra de progreso.

## SEO
- Cada página: title y description propios, canonical y og:url con la URL de GitHub Pages, Open Graph + Twitter con `og-image.jpg` absoluta, JSON-LD (`@graph`: WebSite, Person, ProfessionalService, ItemList de servicios, ProfilePage, ContactPage + FAQPage, BreadcrumbList).
- El teléfono no va en el JSON-LD (se ocultó a propósito de los textos visibles). No se declara `hasCredential` ni `alumniOf` (certificación vencida, carrera sin terminar).
- **Si cambia el dominio:** reemplazar `https://axeljaviersalomon.github.io/Santiiweb/` en las 5 páginas, `robots.txt` y `sitemap.xml`.

## Pendiente / decisiones del usuario
- Email, LinkedIn y GitHub reales (hoy ocultos).
- Foto de Santiago (el sitio viejo tenía un "Tu foto va acá"; el rediseño no la necesita, pero suma en Perfil).
- Logo oficial de la UTN (hoy hay una insignia de texto "UTN").
- Dominio propio: cuando esté, cambiar la URL base (ver SEO) y dar de alta el sitemap en Google Search Console.

## Cómo probar
`python -m http.server 8765` dentro de `sitio/` → http://localhost:8765/. También anda con doble clic en `index.html`.
Revisar: consola sin errores, enviar los formularios vacíos y con datos inválidos, y que el link `wa.me` decodificado tenga un renglón por campo.

## Estado al 2026-10-02
- Último commit: `c7c1ead` (Contacto: logo sin deformar y número de WhatsApp oculto en textos visibles). Rama `main`, deploy por push a GitHub Pages.
- En la raíz hay PNG sueltos sin commitear (`favicon.png`, `logo-completo*.png`, `marca*.png`): son originales de logo; los que usa el sitio están en `assets/brand/` (WebP).
- `.claude/` es config local, no va al deploy.
- Exportado el proyecto completo en zip (`santi-weeb.zip`, en el Escritorio).
