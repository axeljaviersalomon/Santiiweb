/* ==========================================================================
   Santiago Nievas, script.js
   Sin dependencias. Patrón IIFE (sin módulos ES) para que funcione abriendo
   index.html con doble clic. Cada init corre aislado en safe(): si uno falla,
   el resto sigue funcionando.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Datos de contacto (lo único que hace falta editar) ---------- */
  var WHATSAPP_NUMBER = '5491168489382';           // 549 + área + número, sin "+", espacios ni 15
  var CONTACT = {
    phone: '+5491168489382',                        // para los enlaces tel:
    phoneLabel: '+54 9 11 6848-9382',
    email: '',                                      // ej. 'hola@tudominio.com' (vacío = se oculta)
    linkedin: '',                                   // ej. 'https://www.linkedin.com/in/usuario'
    github: ''                                      // ej. 'https://github.com/usuario'
  };
  var WA_GREETING = 'Hola Santiago, vi tu web y te quería consultar algo.';

  /* ---------- Utilidades ---------- */
  var root = document.documentElement;
  root.classList.add('reveal-on'); // desactiva la red de seguridad CSS: JS está vivo
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReduced = function () { return reduceMQ.matches; };
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var safe = function (fn, name) {
    try { fn(); } catch (err) { console.error('[init:' + name + ']', err); }
  };

  function waUrl(text) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  // Un renglón por campo; los vacíos se omiten y los saltos internos se aplanan.
  function buildMessage(intro, rows) {
    var lines = rows
      .filter(function (r) { return r[1] != null && String(r[1]).trim() !== ''; })
      .map(function (r) { return r[0] + ': ' + String(r[1]).trim().replace(/\s+/g, ' '); });
    return [intro, ''].concat(lines).join('\n');
  }

  // Cuándo empieza a revelarse la página: al terminar de armarse el logo del preloader.
  var INTRO_DELAY = prefersReduced() ? 650
    : root.classList.contains('pl-fast') ? 1250 : 2050;

  /* ---------- Contacto: enlaces centralizados ---------- */
  function initContact() {
    $$('.js-wa').forEach(function (a) { a.href = waUrl(WA_GREETING); });
    $$('.js-tel').forEach(function (a) { a.href = 'tel:' + CONTACT.phone; });
    $$('.js-tel-text').forEach(function (el) { el.textContent = CONTACT.phoneLabel; });
    ['email', 'linkedin', 'github'].forEach(function (key) {
      if (!CONTACT[key]) { $$('[data-cfg="' + key + '"]').forEach(function (el) { el.hidden = true; }); }
    });
    if (CONTACT.email) {
      $$('.js-mail').forEach(function (a) { a.href = 'mailto:' + CONTACT.email; });
      $$('.js-mail-text').forEach(function (el) { el.textContent = CONTACT.email; });
    }
    if (CONTACT.linkedin) { $$('.js-linkedin').forEach(function (a) { a.href = CONTACT.linkedin; }); }
    if (CONTACT.github) { $$('.js-github').forEach(function (a) { a.href = CONTACT.github; }); }
    $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  /* ---------- Preloader ---------- */
  function initPreloader() {
    var pl = $('.preloader');
    if (!pl) { return; }
    var remove = function () { if (pl.parentNode) { pl.parentNode.removeChild(pl); } };
    pl.addEventListener('animationend', function (e) { if (e.target === pl) { remove(); } });
    window.setTimeout(remove, INTRO_DELAY + 1400); // red de seguridad
  }

  /* ---------- Transición entre páginas (cortina) ---------- */
  function initTransitions() {
    var curtain = $('.curtain');
    if (!curtain) { return; }
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
      var a = e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) { return; }
      var url;
      try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
      var samePage = url.pathname === location.pathname;
      if (url.protocol !== location.protocol || url.host !== location.host || samePage) { return; }
      if (!/\.html?$/.test(url.pathname) && url.pathname.slice(-1) !== '/') { return; }
      if (prefersReduced()) { return; }
      e.preventDefault();
      curtain.classList.add('is-leaving');
      window.setTimeout(function () { location.href = url.href; }, 500);
    });
    // Volver con el botón "atrás" (bfcache): limpiar estados
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        curtain.classList.remove('is-leaving');
        $$('.btn.is-loading, .btn.is-done').forEach(resetButton);
      }
    });
  }

  /* ---------- Encabezado, progreso y botón flotante ---------- */
  function initScrollUi() {
    var header = $('[data-header]');
    var bar = $('.progress i');
    var fab = $('.wa-float');
    var lastY = window.scrollY;
    var ticking = false;
    function update() {
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (header) {
        header.classList.toggle('is-scrolled', y > 24);
        var menuOpen = document.body.classList.contains('no-scroll');
        if (!menuOpen && y > 320 && y - lastY > 6) { header.classList.add('is-hidden'); }
        else if (lastY - y > 6 || y < 320) { header.classList.remove('is-hidden'); }
      }
      if (bar) { bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')'; }
      if (fab) { fab.classList.toggle('is-visible', y > 520); }
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
    // Si el foco entra al encabezado oculto, mostrarlo
    if (header) { header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); }); }
  }

  /* ---------- Menú móvil ---------- */
  function initMenu() {
    var btn = $('.menu-btn');
    var menu = $('#menu');
    if (!btn || !menu) { return; }
    var focusables = function () { return [btn].concat($$('a, button', menu)); };
    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('no-scroll', open);
      if (open) { window.setTimeout(function () { var f = $('a', menu); if (f) { f.focus(); } }, 80); }
    }
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { setOpen(false); } });
    document.addEventListener('keydown', function (e) {
      if (!menu.classList.contains('is-open')) { return; }
      if (e.key === 'Escape') { setOpen(false); btn.focus(); return; }
      if (e.key === 'Tab') {
        var list = focusables();
        var i = list.indexOf(document.activeElement);
        var next = e.shiftKey ? (i <= 0 ? list.length - 1 : i - 1) : (i === list.length - 1 ? 0 : i + 1);
        e.preventDefault();
        list[next].focus();
      }
    });
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (e) { if (e.matches) { setOpen(false); } });
  }

  /* ---------- Titulares por palabra ---------- */
  function initSplit() {
    $$('[data-split]').forEach(function (el) {
      if (el.classList.contains('is-split') || el.children.length) { return; }
      var text = el.textContent.trim().replace(/\s+/g, ' ');
      el.textContent = '';
      // Copia legible para lectores de pantalla (las palabras animadas van ocultas)
      var sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = text;
      el.appendChild(sr);
      text.split(' ').forEach(function (word, i) {
        var w = document.createElement('span');
        w.className = 'w';
        w.setAttribute('aria-hidden', 'true');
        var inner = document.createElement('span');
        inner.style.setProperty('--wi', String(i));
        inner.textContent = word;
        w.appendChild(inner);
        el.appendChild(w);
        el.appendChild(document.createTextNode(' '));
      });
      el.classList.add('is-split');
    });
  }

  /* ---------- Revelado al hacer scroll ---------- */
  function initReveal() {
    var items = $$('[data-reveal], [data-split], [data-assemble]');
    var show = function (el) { el.classList.add('is-in'); };
    if (!('IntersectionObserver' in window)) { items.forEach(show); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    window.setTimeout(function () {
      root.classList.add('is-ready');
      items.forEach(function (el) { io.observe(el); });
    }, INTRO_DELAY);
    // Red de seguridad: lo que esté en pantalla y siga oculto, se muestra
    window.setTimeout(function () {
      items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) { show(el); }
      });
    }, INTRO_DELAY + 6000);
  }

  /* ---------- Parallax sutil ---------- */
  function initParallax() {
    if (prefersReduced()) { return; }
    var els = $$('[data-parallax]');
    if (!els.length) { return; }
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var host = el.parentElement.getBoundingClientRect();
        if (host.bottom < -200 || host.top > vh + 200) { return; }
        var offset = (host.top + host.height / 2 - vh / 2) * parseFloat(el.getAttribute('data-parallax'));
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Isotipos en capas que siguen al cursor (con suavidad) ---------- */
  function initTilt() {
    var marks = $$('[data-tilt]');
    if (!marks.length || !finePointer || prefersReduced()) { return; }
    var layers = [];
    marks.forEach(function (m) { layers = layers.concat($$('[data-depth]', m)); });
    var target = { x: 0, y: 0 };
    var cur = { x: 0, y: 0 };
    var running = false;
    function loop() {
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      layers.forEach(function (img) {
        var d = parseFloat(img.getAttribute('data-depth'));
        img.style.transform = 'translate3d(' + (cur.x * d).toFixed(2) + 'px,' + (cur.y * d).toFixed(2) + 'px,0)';
      });
      if (Math.abs(target.x - cur.x) > 0.001 || Math.abs(target.y - cur.y) > 0.001) {
        window.requestAnimationFrame(loop);
      } else { running = false; }
    }
    window.addEventListener('pointermove', function (e) {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!running) { running = true; window.requestAnimationFrame(loop); }
    }, { passive: true });
  }

  /* ---------- Botones magnéticos y spotlight en tarjetas ---------- */
  function initPointerFx() {
    if (!finePointer || prefersReduced()) { return; }
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.32;
        el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    $$('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Contadores ---------- */
  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length || !('IntersectionObserver' in window) || prefersReduced()) { return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        io.unobserve(entry.target);
        var el = entry.target;
        var to = parseInt(el.getAttribute('data-count'), 10);
        var t0 = performance.now();
        var dur = 1200;
        (function step(t) {
          var k = Math.min(1, (t - t0) / dur);
          el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
          if (k < 1) { window.requestAnimationFrame(step); }
        })(t0);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { el.textContent = '0'; io.observe(el); });
  }

  /* ==========================================================================
     Formularios: validación y envío a WhatsApp
     ========================================================================== */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function errorFor(input) {
    var v = input.value.trim();
    var label = input.getAttribute('data-label') || 'este dato';
    var min = parseInt(input.getAttribute('data-min') || '0', 10);
    if (input.required && !v) { return input.getAttribute('data-msg') || 'Falta ' + label + '.'; }
    if (v && min && v.length < min) {
      return input.tagName === 'TEXTAREA'
        ? 'Contame un poco más (al menos ' + min + ' caracteres).'
        : 'Revisá ' + label + ': parece incompleto.';
    }
    if (v && input.type === 'email' && !EMAIL_RE.test(v)) { return 'Revisá el email, parece incompleto (ej.: nombre@correo.com).'; }
    if (v && input.hasAttribute('data-phone')) {
      if (!/^[+\d\s().-]+$/.test(v)) { return 'Usá solo números, espacios o guiones.'; }
      var digits = v.replace(/\D/g, '').length;
      if (digits < 8 || digits > 15) { return 'Revisá el teléfono: tiene que tener entre 8 y 15 números.'; }
    }
    return '';
  }

  function setError(input, msg) {
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    var id = (input.getAttribute('aria-describedby') || '').split(' ')[0];
    var box = id && document.getElementById(id);
    if (box) { box.textContent = msg; }
  }

  function bindValidation(form) {
    $$('input, textarea', form).forEach(function (input) {
      if (input.type === 'radio') { return; }
      input.addEventListener('blur', function () {
        if (input.value.trim() || input.getAttribute('aria-invalid') === 'true') { setError(input, errorFor(input)); }
      });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') { setError(input, errorFor(input)); }
      });
    });
  }

  function validateForm(form) {
    var firstBad = null;
    $$('input:not([type="radio"]), textarea', form).forEach(function (input) {
      var msg = errorFor(input);
      setError(input, msg);
      if (msg && !firstBad) { firstBad = input; }
    });
    if (firstBad) { firstBad.focus({ preventScroll: false }); }
    return !firstBad;
  }

  function resetButton(btn) {
    btn.classList.remove('is-loading', 'is-done');
    btn.removeAttribute('aria-busy');
    btn.disabled = false;
  }

  // Feedback visible (cargando → listo) y recién después se abre WhatsApp.
  function sendToWhatsApp(form, btn, text) {
    if (btn.classList.contains('is-loading') || btn.classList.contains('is-done')) { return; }
    var status = $('[data-status]', form);
    var url = waUrl(text);
    var quick = prefersReduced();
    btn.classList.add('is-loading');
    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;
    if (status) { status.className = status.className.replace(/\bis-(ok|error)\b/g, ''); status.textContent = 'Preparando tu mensaje…'; }
    window.setTimeout(function () {
      btn.classList.remove('is-loading');
      btn.classList.add('is-done');
      if (status) {
        status.classList.add('is-ok');
        status.innerHTML = 'Listo, abriendo WhatsApp. Si no se abre, <a href="' + esc(url) + '" target="_blank" rel="noopener">tocá acá</a>.';
      }
      window.setTimeout(function () {
        window.location.href = url;
        window.setTimeout(function () { resetButton(btn); }, 2500);
      }, quick ? 150 : 650);
    }, quick ? 150 : 850);
  }

  function showFormError(form, msg) {
    var status = $('[data-status]', form);
    if (!status) { return; }
    status.classList.remove('is-ok');
    status.classList.add('is-error');
    status.textContent = msg;
  }

  /* ---------- Datos de servicios y precios ---------- */
  var PRICING = {
    web: { label: 'Página web', sizes: [['Landing de una página', 600, 1000], ['Web institucional, hasta 6 secciones', 1100, 2000], ['Web a medida con funciones (reservas, panel)', 2200, 3800]] },
    tienda: { label: 'Tienda online', sizes: [['Hasta 50 productos', 2400, 3800], ['Hasta 300 productos', 3800, 5800], ['Catálogo grande o integraciones', 5800, 9000]] },
    auto: { label: 'Automatización', sizes: [['Una tarea puntual', 450, 950], ['Un proceso completo', 1000, 2400], ['Integración entre sistemas', 2400, 4800]] },
    sistema: { label: 'Sistema a medida', sizes: [['Simple, un módulo', 3200, 5500], ['Mediano, varios módulos y usuarios', 5500, 9500], ['Complejo, a definir por etapas', 9500, 16000]] },
    sap: { label: 'Soporte SAP Basis', sizes: [['Por hora', 50, 70, 'por hora'], ['Paquete de 20 horas al mes', 950, 1300, 'por mes'], ['Paquete de 40 horas al mes', 1800, 2400, 'por mes']] },
    nose: { label: 'Consulta inicial', sizes: [['Diagnóstico de 30 minutos', 0, 0]] }
  };
  var TIMES = [
    { id: 'flex', name: 'Flexible', hint: 'más de 2 meses', sapHint: 'se agenda con una semana', mult: 0.95 },
    { id: 'normal', name: 'Normal', hint: '1 a 2 meses', sapHint: 'respuesta en 48 h hábiles', mult: 1 },
    { id: 'prio', name: 'Prioritario', hint: '2 a 4 semanas', sapHint: 'respuesta en el día', mult: 1.25 },
    { id: 'urg', name: 'Urgente', hint: 'menos de 2 semanas', sapHint: 'fuera de horario o fin de semana', mult: 1.5 }
  ];
  var PLANS = {
    web: { title: 'Página web profesional',
      intro: 'Una web pensada para que quien entra entienda rápido qué ofrecés y te contacte. Diseño propio, preparada para celular y para aparecer en Google.',
      items: [['Diseño a medida', 'Estructura y textos pensados para tu cliente, con tu identidad visual.'],
        ['Contacto directo', 'WhatsApp, formulario y ubicación para que te escriban en un clic.'],
        ['Rápida y adaptable', 'Carga en pocos segundos y se ve bien en cualquier pantalla.'],
        ['Lista para Google', 'Estructura y datos técnicos para que te encuentren en las búsquedas.'],
        ['Puesta online', 'Dominio, hosting, certificado de seguridad y mantenimiento.']],
      first: 'Una reunión corta para definir objetivos, secciones y contenido. Con eso te paso alcance, plazos y precio cerrado.' },
    tienda: { title: 'Tienda online propia',
      intro: 'Vendé desde tu propia web, sin pagar comisiones mensuales a una plataforma de tiendas. Los pagos entran directo a tu cuenta y cada pedido queda registrado.',
      items: [['Catálogo administrable', 'Productos, fotos, precios y stock que podés actualizar vos.'],
        ['Cobro online', 'MercadoPago integrado: tarjetas, débito y dinero en cuenta.'],
        ['Gestión de pedidos', 'Panel con el estado de cada pedido y aviso cuando entra un pago.'],
        ['Envíos o retiro', 'Configurado según cómo entregás hoy.'],
        ['Seguridad', 'Certificado SSL; la tienda nunca guarda datos de tarjetas.']],
      first: 'Revisamos tus productos, cómo entregás y cómo cobrás hoy para definir el alcance.' },
    auto: { title: 'Automatización de procesos',
      intro: 'Identifico las tareas repetitivas que consumen horas de tu equipo y las convierto en procesos automáticos que quedan documentados.',
      items: [['Relevamiento', 'Medimos cuánto tiempo y cuántos errores genera hoy la tarea.'],
        ['Desarrollo', 'Programas en Python o Java que procesan planillas, archivos, informes o datos.'],
        ['Integraciones', 'Conexión con otros sistemas, bases de datos y correo.'],
        ['Puesta en marcha', 'Ejecución programada y registro de errores para que funcione solo.'],
        ['Documentación', 'Instrucciones claras para que tu equipo lo use y lo mantenga.']],
      first: 'Me mostrás la tarea una vez, tal cual la hacen hoy. Con eso estimo el ahorro y el esfuerzo.' },
    sistema: { title: 'Sistema a medida',
      intro: 'Software pensado para la forma en que ya trabaja tu negocio. Centraliza la información y reemplaza planillas sueltas y cuadernos.',
      items: [['Análisis funcional', 'Entiendo tu proceso actual y defino qué tiene que resolver el sistema.'],
        ['Backend sólido', 'Java y Spring Boot con base de datos SQL, pensado para crecer.'],
        ['Interfaz web', 'Se usa desde el navegador, sin instalar nada, en compu o celular.'],
        ['Usuarios y permisos', 'Cada persona ve y hace solo lo que le corresponde.'],
        ['Capacitación y soporte', 'Te acompaño en el arranque y después de la entrega.']],
      first: 'Relevamos cómo registrás hoy pedidos, stock o clientes, aunque sea en papel o Excel, y definimos la primera versión.' },
    sap: { title: 'Soporte SAP Basis',
      intro: 'Soporte técnico para entornos SAP, con más de cuatro años de experiencia en servicios AMS y la certificación SAP HANA 2.0 aprobada.',
      items: [['Monitoreo proactivo', 'Procesos en segundo plano, logs y alertas antes de que impacten en el negocio.'],
        ['Gestión de incidentes', 'Diagnóstico, resolución y seguimiento hasta el cierre, con evidencia.'],
        ['Transportes', 'Control y seguimiento de cambios entre ambientes.'],
        ['Documentación', 'Procedimientos e informes técnicos para tu equipo.'],
        ['Coordinación', 'Comunicación con equipos funcionales, de desarrollo y usuarios.']],
      first: 'Revisamos tu entorno y definimos la modalidad: horas mensuales, tareas puntuales o cobertura por un período.' },
    nose: { title: 'Consulta inicial sin cargo',
      intro: 'No hace falta saber el nombre técnico de lo que necesitás. Contame el problema y te digo si se puede resolver con tecnología y cómo.',
      items: [['Diagnóstico', 'Entiendo qué te está costando tiempo o dinero hoy.'],
        ['Opciones', 'Te propongo alternativas, con sus costos y plazos.'],
        ['Si no es lo mío', 'Te lo digo y te oriento hacia quien lo pueda resolver.']],
      first: 'Agendás 30 minutos o me escribís contándome la situación con tus palabras. No se cobra.' }
  };
  var fmtNum = function (n) { return Math.round(n).toLocaleString('es-AR'); };
  var usd = function (n) { return 'USD ' + fmtNum(n); };
  var roundTo = function (n, step) { return Math.round(n / step) * step; };
  function fromText(key) {
    var s = PRICING[key].sizes[0];
    return s[2] ? 'Desde ' + usd(s[1]) + (s[3] ? ' ' + s[3] : '') : 'Sin cargo';
  }

  /* ---------- Inicio: frase con carteles de paletas + propuesta ----------
     Cada cartel es un split-flap: dos mitades fijas y dos paletas que giran
     sobre la bisagra (solo transform). Para cambiar de texto pasan un par de
     paletas rápidas con otras opciones y cae la final, como en un tablero de
     aeropuerto. Las dos frases van de a pares y la propuesta de abajo sigue al
     par visible. Se pausa fuera de pantalla, con el mouse encima o a mano. */
  var PAIRS = [
    ['una empresa', 'ayuda con SAP', 'sap'],
    ['un comercio', 'vender online', 'tienda'],
    ['una PyME', 'automatizar tareas', 'auto'],
    ['un emprendimiento', 'una página web', 'web'],
    ['un estudio profesional', 'un sistema a medida', 'sistema'],
    ['una duda', 'una consulta sin cargo', 'nose']
  ];
  var PRISM_EVERY = 3000;     // ms entre un par y el siguiente
  var FLAP_FAST = 70;         // ms por media paleta en las pasadas rápidas
  var FLAP_FINAL = 230;       // ms por media paleta en la caída final
  var FLAP_SPINS = 2;         // paletas rápidas antes de la final

  // Un cartel split-flap: guarda su texto y sabe pasar a otro, con o sin pasadas rápidas.
  function makeFlap(el) {
    var halves = $$('.flap-half > span', el); // [top, bottom, foldTop, foldBottom]
    var api = { text: halves[0].textContent, token: 0, timer: null };
    function set(i, t) { halves[i].textContent = t; }
    function one(to, dur, done) {
      var from = api.text;
      set(0, to); set(1, from); set(2, from); set(3, to);
      el.style.setProperty('--fd', dur + 'ms');
      el.classList.remove('is-flipping');
      void el.offsetWidth; // reinicia las animaciones
      el.classList.add('is-flipping');
      api.text = to;
      window.clearTimeout(api.timer);
      api.timer = window.setTimeout(function () {
        set(1, to);
        el.classList.remove('is-flipping');
        if (done) { done(); }
      }, dur * 2 + 20);
    }
    api.show = function (to, spins) {
      var my = ++api.token; // un pedido nuevo cancela la secuencia anterior
      if (prefersReduced()) {
        window.clearTimeout(api.timer);
        el.classList.remove('is-flipping');
        api.text = to; set(0, to); set(1, to);
        return;
      }
      var seq = (spins || []).concat([to]);
      (function next(i) {
        if (my !== api.token) { return; }
        var last = i === seq.length - 1;
        one(seq[i], last ? FLAP_FINAL : FLAP_FAST, last ? null : function () { next(i + 1); });
      })(0);
    };
    return api;
  }

  function initSentence() {
    var plan = $('#plan');
    var flapEls = $$('[data-flap]');
    if (!plan || flapEls.length !== 2) { return; }
    var flaps = flapEls.map(makeFlap);
    var planBox = plan.parentElement;
    var srText = $('#sentenceText');
    var ctrl = $('#prismCtrl');
    var dotsEl = ctrl && $('.prism-dots', ctrl);
    var state = { i: 0, paused: false, hover: false, visible: true };
    var timer = null;

    function planHtml(pair) {
      var key = pair[2];
      var p = PLANS[key];
      return '<p class="eyebrow">Para ' + esc(pair[0]) + ' que necesita ' + esc(pair[1]) + '</p>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p class="plan-intro">' + esc(p.intro) + '</p>' +
        '<dl class="incl">' + p.items.map(function (it) { return '<div><dt>' + esc(it[0]) + '</dt><dd>' + esc(it[1]) + '</dd></div>'; }).join('') + '</dl>' +
        '<p class="plan-first"><b>Cómo arrancamos.</b> ' + esc(p.first) + (key === 'nose' ? '' : ' Esa primera charla es sin cargo.') + '</p>' +
        '<div class="plan-foot"><p class="plan-from"><small>Estimación</small>' + esc(fromText(key)) + '</p>' +
        '<a class="link-arrow" href="presupuesto.html?s=' + key + '" id="planCalc"><span>Calcular mi presupuesto</span><svg aria-hidden="true"><use href="#i-arrow"/></svg></a></div>';
    }
    function renderPlan(animate) {
      var pair = PAIRS[state.i];
      if (!animate || prefersReduced()) { plan.innerHTML = planHtml(pair); return; }
      plan.classList.add('is-out');
      window.setTimeout(function () {
        plan.innerHTML = planHtml(PAIRS[state.i]);
        plan.classList.remove('is-out');
      }, 260);
    }
    function drawDots() {
      if (!dotsEl) { return; }
      $$('.prism-dot', dotsEl).forEach(function (d, i) { d.setAttribute('aria-current', String(i === state.i)); });
    }
    // Textos al azar de la misma columna (ni el actual ni el destino) para las pasadas rápidas
    function spinsFor(k, from, to) {
      var pool = PAIRS.map(function (p) { return p[k]; }).filter(function (t, i) { return i !== from && i !== to; });
      var out = [];
      while (out.length < FLAP_SPINS && pool.length) { out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); }
      return out;
    }
    // Lleva los dos carteles al par "to". Solo se anuncia a lectores de pantalla
    // cuando lo elige la persona (la rotación automática no interrumpe).
    function go(to, byUser) {
      to = (to + PAIRS.length) % PAIRS.length;
      if (to === state.i) { return; }
      var from = state.i;
      state.i = to;
      flaps.forEach(function (f, k) {
        var spins = spinsFor(k, from, to);
        if (k === 0) { f.show(PAIRS[to][k], spins); }
        else { window.setTimeout(function () { if (state.i === to) { f.show(PAIRS[to][k], spins); } }, prefersReduced() ? 0 : 120); }
      });
      if (planBox) { planBox.setAttribute('aria-live', byUser ? 'polite' : 'off'); }
      if (srText) { srText.textContent = 'Tengo ' + PAIRS[to][0] + ' y necesito ' + PAIRS[to][1] + '.'; }
      drawDots();
      renderPlan(true);
    }
    function running() { return !state.paused && !state.hover && state.visible && !document.hidden && !prefersReduced(); }
    function schedule() {
      window.clearTimeout(timer);
      if (running()) { timer = window.setTimeout(function () { go(state.i + 1); schedule(); }, PRISM_EVERY); }
    }
    function setPaused(p) { state.paused = p; schedule(); }

    if (ctrl && dotsEl) {
      dotsEl.innerHTML = PAIRS.map(function (p, i) {
        return '<button type="button" class="prism-dot" data-i="' + i + '" aria-label="' + esc('Tengo ' + p[0] + ' y necesito ' + p[1]) + '"></button>';
      }).join('');
      ctrl.hidden = false;
      dotsEl.addEventListener('click', function (e) {
        var b = e.target.closest('.prism-dot');
        if (!b) { return; }
        go(+b.getAttribute('data-i'), true);
        setPaused(true); // eligió una: queda fija (tocar un cartel la vuelve a hacer girar)
      });
    }
    flapEls.forEach(function (p) {
      p.addEventListener('click', function () { go(state.i + 1, true); setPaused(false); });
      p.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { state.hover = true; schedule(); } });
      p.addEventListener('pointerleave', function () { state.hover = false; schedule(); });
    });
    var hero = $('.hero-home');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        state.visible = entries[0].isIntersecting;
        schedule();
      }, { threshold: 0.35 }).observe(hero);
    }
    document.addEventListener('visibilitychange', schedule);
    drawDots();
    renderPlan(false);
    // Arranca a girar cuando termina la intro
    window.setTimeout(schedule, INTRO_DELAY + 600);

    var form = $('#quickForm');
    if (!form) { return; }
    bindValidation(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) { return; }
      var text = buildMessage(WA_GREETING, [
        ['Tengo', PAIRS[state.i][0]],
        ['Necesito', PAIRS[state.i][1]],
        ['Detalle', $('#quickMsg').value]
      ]);
      sendToWhatsApp(form, $('button[type="submit"]', form), text);
    });
  }

  /* ---------- Presupuesto ---------- */
  function initQuote() {
    var form = $('#quoteForm');
    if (!form) { return; }
    var sizeList = $('#sizeList');
    var timeList = $('#timeList');
    var timeStep = $('#timeStep');
    var amountEl = $('#estAmount');
    var shown = null;
    var tweenId = 0;

    var param = new URLSearchParams(location.search).get('s');
    if (param && PRICING[param]) { var pre = $('#s-' + param); if (pre) { pre.checked = true; } }

    var checked = function (name) { var el = $('input[name="' + name + '"]:checked', form); return el ? el.value : null; };

    function renderSizes(key) {
      var prev = parseInt(checked('tamano') || '0', 10);
      var sizes = PRICING[key].sizes;
      var keep = prev < sizes.length ? prev : 0;
      sizeList.innerHTML = sizes.map(function (s, i) {
        var price = s[2] ? usd(s[1]) + ' a ' + fmtNum(s[2]) + (s[3] ? ' ' + s[3] : '') : 'Sin cargo';
        return '<div class="opt-chip"><input type="radio" name="tamano" id="z-' + i + '" value="' + i + '"' + (i === keep ? ' checked' : '') + '>' +
          '<label for="z-' + i + '">' + esc(s[0]) + '<small>' + esc(price) + '</small></label></div>';
      }).join('');
    }
    function renderTimes(key) {
      var free = key === 'nose';
      timeStep.hidden = free;
      var cur = checked('plazo') || 'normal';
      timeList.innerHTML = TIMES.map(function (t) {
        return '<div class="opt-chip"><input type="radio" name="plazo" id="t-' + t.id + '" value="' + t.id + '"' + (t.id === cur ? ' checked' : '') + '>' +
          '<label for="t-' + t.id + '">' + esc(t.name) + '<small>' + esc(key === 'sap' ? t.sapHint : t.hint) + '</small></label></div>';
      }).join('');
    }
    function quote() {
      var key = checked('servicio');
      var size = PRICING[key].sizes[parseInt(checked('tamano') || '0', 10)];
      var time = key === 'nose' ? TIMES[1] : TIMES.filter(function (t) { return t.id === (checked('plazo') || 'normal'); })[0];
      var step = size[3] === 'por hora' ? 5 : 50;
      return { key: key, size: size, time: time, unit: size[3] || '', lo: size[1], hi: size[2],
        min: roundTo(size[1] * time.mult, step), max: roundTo(size[2] * time.mult, step) };
    }
    function paint(min, max, unit) {
      amountEl.innerHTML = 'USD ' + fmtNum(min) + ' a ' + fmtNum(max) + (unit ? '<span class="unit">' + esc(unit) + '</span>' : '');
    }
    function update(bump) {
      var q = quote();
      $('#estSvc').textContent = PRICING[q.key].label;
      var adj = $('#estAdj');
      adj.className = 'est-adj';
      if (!q.hi) {
        tweenId++;
        amountEl.textContent = 'Sin cargo';
        $('#estBase').textContent = 'Sin cargo';
        $('#estTime').firstChild.textContent = 'A coordinar · ';
        adj.textContent = 'Sin recargo';
        shown = null;
      } else {
        $('#estBase').textContent = usd(q.lo) + ' a ' + fmtNum(q.hi);
        $('#estTime').firstChild.textContent = q.time.name + ' · ';
        if (q.time.mult > 1) { adj.textContent = '+' + Math.round((q.time.mult - 1) * 100) + '% por urgencia'; adj.classList.add('up'); }
        else if (q.time.mult < 1) { adj.textContent = Math.round((1 - q.time.mult) * 100) + '% de descuento'; adj.classList.add('down'); }
        else { adj.textContent = 'Sin recargo'; }
        var from = shown || [q.min, q.max];
        if (prefersReduced() || !shown) { paint(q.min, q.max, q.unit); }
        else {
          var id = ++tweenId; // una animación nueva cancela la anterior
          var t0 = performance.now();
          var dur = 480;
          (function step(t) {
            if (id !== tweenId) { return; }
            var k = Math.min(1, Math.max(0, (t - t0) / dur));
            var e = 1 - Math.pow(1 - k, 3);
            paint(from[0] + (q.min - from[0]) * e, from[1] + (q.max - from[1]) * e, q.unit);
            if (k < 1) { window.requestAnimationFrame(step); }
          })(t0);
        }
        shown = [q.min, q.max];
      }
      if (bump && !prefersReduced()) {
        amountEl.classList.remove('bump');
        void amountEl.offsetWidth;
        amountEl.classList.add('bump');
      }
    }
    form.addEventListener('change', function (e) {
      if (e.target.name === 'servicio') { renderSizes(e.target.value); renderTimes(e.target.value); }
      if (e.target.type === 'radio') { update(true); }
    });
    // En pantallas chicas la estimación va pegada a las opciones, no al final del formulario
    var aside = $('.estimate');
    var wrap = aside && aside.parentElement;
    var mq = window.matchMedia('(max-width: 999px)');
    var place = function () {
      if (!aside) { return; }
      if (mq.matches) { timeStep.parentNode.insertBefore(aside, timeStep.nextSibling); }
      else if (aside.parentElement !== wrap) { wrap.appendChild(aside); }
    };
    place();
    mq.addEventListener('change', place);

    var initial = checked('servicio');
    renderSizes(initial);
    renderTimes(initial);
    update(false);

    bindValidation(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) { showFormError(form, 'Revisá los campos marcados para poder enviar tu pedido.'); return; }
      var q = quote();
      var estimate = q.hi ? usd(q.min) + ' a ' + fmtNum(q.max) + (q.unit ? ' ' + q.unit : '') : 'Sin cargo';
      var text = buildMessage('Hola Santiago, quiero pedir un presupuesto.', [
        ['Servicio', PRICING[q.key].label],
        ['Tamaño', q.size[0]],
        ['Plazo', q.key === 'nose' ? '' : q.time.name + ' (' + (q.key === 'sap' ? q.time.sapHint : q.time.hint) + ')'],
        ['Estimación orientativa', estimate],
        ['Nombre', form.nombre.value],
        ['Empresa', form.empresa.value],
        ['Email', form.email.value],
        ['Teléfono', form.telefono.value],
        ['Detalle', form.detalle.value]
      ]);
      sendToWhatsApp(form, $('button[type="submit"]', form), text);
    });
  }

  /* ---------- Agenda de consultas (se pide el turno por WhatsApp) ---------- */
  var AGENDA = { duracion: 30, dias: [1, 2, 3, 4, 5], franjas: [['09:00', '12:00'], ['18:00', '20:00']], anticipacionHoras: 12, diasAdelante: 21 };
  var BA_OFFSET_MIN = -180; // Argentina: UTC-3 todo el año
  var DAY_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var MONTH_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var DAY_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MONTH_LONG = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var pad2 = function (n) { return String(n).padStart(2, '0'); };
  var toMin = function (hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; };

  function availability() {
    var nowBA = new Date(Date.now() + BA_OFFSET_MIN * 60000); // leer con getUTC*
    var limit = nowBA.getTime() + AGENDA.anticipacionHoras * 3600000;
    var out = [];
    for (var i = 0; i <= AGENDA.diasAdelante; i++) {
      var d = new Date(Date.UTC(nowBA.getUTCFullYear(), nowBA.getUTCMonth(), nowBA.getUTCDate() + i));
      if (AGENDA.dias.indexOf(d.getUTCDay()) === -1) { continue; }
      var slots = [];
      AGENDA.franjas.forEach(function (f) {
        for (var t = toMin(f[0]); t + AGENDA.duracion <= toMin(f[1]); t += AGENDA.duracion) {
          if (d.getTime() + t * 60000 >= limit) { slots.push(pad2(Math.floor(t / 60)) + ':' + pad2(t % 60)); }
        }
      });
      if (slots.length) { out.push({ date: d, slots: slots }); }
    }
    return out;
  }
  var longDate = function (d) { return DAY_LONG[d.getUTCDay()] + ' ' + d.getUTCDate() + ' de ' + MONTH_LONG[d.getUTCMonth()]; };

  function initAgenda() {
    var form = $('#bookForm');
    if (!form) { return; }
    var daysEl = $('#days');
    var slotsEl = $('#slots');
    var label = $('#bookLabel');
    var slotErr = $('#slot-err');
    var days = availability();
    var state = { day: 0, time: null };

    function drawDays() {
      if (!days.length) {
        daysEl.innerHTML = '<p class="muted">No hay turnos libres en las próximas semanas. Escribime y lo coordinamos.</p>';
        return;
      }
      daysEl.innerHTML = days.map(function (d, i) {
        return '<button type="button" class="day" data-i="' + i + '" aria-pressed="' + (i === state.day) + '" aria-label="' + esc(longDate(d.date)) + '">' +
          '<small>' + DAY_SHORT[d.date.getUTCDay()] + '</small><b>' + d.date.getUTCDate() + '</b><i>' + MONTH_SHORT[d.date.getUTCMonth()] + '</i></button>';
      }).join('');
    }
    function drawSlots() {
      var day = days[state.day];
      if (!day) { slotsEl.innerHTML = ''; return; }
      $('#dayLabel').textContent = '· ' + longDate(day.date);
      var am = day.slots.filter(function (h) { return toMin(h) < 13 * 60; });
      var pm = day.slots.filter(function (h) { return toMin(h) >= 13 * 60; });
      var group = function (title, list) {
        return list.length ? '<div class="slot-group"><p>' + title + '</p><div class="slot-list">' + list.map(function (h) {
          return '<button type="button" class="slot" data-t="' + h + '" aria-pressed="' + (h === state.time) + '">' + h + '</button>';
        }).join('') + '</div></div>' : '';
      };
      slotsEl.innerHTML = group('Mañana', am) + group('Tarde', pm);
      updateLabel();
    }
    function updateLabel() {
      var day = days[state.day];
      label.textContent = state.time && day
        ? 'Pedir turno: ' + DAY_LONG[day.date.getUTCDay()] + ' ' + day.date.getUTCDate() + ' a las ' + state.time
        : 'Elegí un horario';
    }
    daysEl.addEventListener('click', function (e) {
      var b = e.target.closest('.day');
      if (!b) { return; }
      state.day = +b.getAttribute('data-i');
      state.time = null;
      $$('.day', daysEl).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      drawSlots();
    });
    slotsEl.addEventListener('click', function (e) {
      var b = e.target.closest('.slot');
      if (!b) { return; }
      state.time = b.getAttribute('data-t');
      $$('.slot', slotsEl).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      slotErr.textContent = '';
      updateLabel();
    });
    var prev = $('#dayPrev');
    var next = $('#dayNext');
    var step = function () { return Math.max(160, daysEl.clientWidth - 80); };
    prev.addEventListener('click', function () { daysEl.scrollBy({ left: -step(), behavior: prefersReduced() ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { daysEl.scrollBy({ left: step(), behavior: prefersReduced() ? 'auto' : 'smooth' }); });
    // Bordes difuminados y flechas desactivadas según haya más días a cada lado
    function edges() {
      var max = daysEl.scrollWidth - daysEl.clientWidth;
      var atStart = daysEl.scrollLeft <= 4;
      var atEnd = daysEl.scrollLeft >= max - 4;
      daysEl.classList.toggle('can-left', !atStart);
      daysEl.classList.toggle('can-right', !atEnd);
      prev.disabled = atStart;
      next.disabled = atEnd;
    }
    daysEl.addEventListener('scroll', edges, { passive: true });
    window.addEventListener('resize', edges);
    drawDays();
    drawSlots();
    edges();

    bindValidation(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var okFields = validateForm(form);
      if (!state.time) {
        slotErr.textContent = 'Elegí un día y un horario para la consulta.';
        if (okFields) { var first = $('.slot', slotsEl) || $('.day', daysEl); if (first) { first.focus(); } }
        return;
      }
      if (!okFields) { return; }
      var day = days[state.day];
      var text = buildMessage('Hola Santiago, quiero agendar una consulta.', [
        ['Día', longDate(day.date)],
        ['Horario', state.time + ' h (hora de Argentina)'],
        ['Modalidad', ($('input[name="modalidad"]:checked', form) || {}).value],
        ['Motivo', form.motivo.value],
        ['Nombre', form.nombre.value],
        ['Teléfono', form.telefono.value],
        ['Email', form.email.value],
        ['Mensaje', form.mensaje.value]
      ]);
      sendToWhatsApp(form, $('#bookBtn'), text);
    });
  }

  /* ---------- Arranque ---------- */
  function boot() {
    safe(initContact, 'contact');
    safe(initPreloader, 'preloader');
    safe(initTransitions, 'transitions');
    safe(initScrollUi, 'scroll-ui');
    safe(initMenu, 'menu');
    safe(initSplit, 'split');
    safe(initReveal, 'reveal');
    safe(initParallax, 'parallax');
    safe(initTilt, 'tilt');
    safe(initPointerFx, 'pointer-fx');
    safe(initCounters, 'counters');
    safe(initSentence, 'sentence');
    safe(initQuote, 'quote');
    safe(initAgenda, 'agenda');
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();
