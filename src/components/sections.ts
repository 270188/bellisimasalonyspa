import { BUSINESS, OPENING_HOURS, mailUrl, telUrl, whatsappUrl } from '../config';
import { GALLERY, TEAM, TESTIMONIALS } from '../data/content';
import { SERVICES } from '../data/services';
import { escapeHtml } from '../lib/format';
import { describeOpeningHours } from '../lib/schedule';
import { $, $$, openDialog, prefersReducedMotion, setupDialog } from './ui';

/** Rellena teléfonos, correos, enlaces y redes desde la configuración. */
export const initContactInfo = (): void => {
  $$('[data-phone]').forEach((el) => (el.textContent = BUSINESS.phoneDisplay));
  $$('[data-email]').forEach((el) => (el.textContent = BUSINESS.email));
  $$('[data-address]').forEach((el) => (el.textContent = BUSINESS.address));
  $$<HTMLAnchorElement>('[data-tel]').forEach((a) => (a.href = telUrl));
  $$<HTMLAnchorElement>('[data-mail]').forEach((a) => (a.href = mailUrl('Consulta desde la web')));
  $$<HTMLAnchorElement>('[data-whatsapp]').forEach((a) => {
    a.href = whatsappUrl(`Hola ${BUSINESS.name}, quisiera información sobre sus servicios.`);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
  $$<HTMLAnchorElement>('[data-social]').forEach((a) => {
    const key = a.dataset.social as keyof typeof BUSINESS.social;
    a.href = BUSINESS.social[key];
  });
  $('#year').textContent = String(new Date().getFullYear());
  const servicesStat = document.querySelector<HTMLElement>('[data-stat="services"]');
  if (servicesStat) servicesStat.dataset.count = String(SERVICES.length);
};

export const initHeader = (): void => {
  const header = $('.site-header');
  const toggle = $<HTMLButtonElement>('.nav-toggle');
  const nav = $('#main-nav');
  const backTop = $<HTMLButtonElement>('#back-to-top');

  const setOpen = (open: boolean): void => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('open', open);
    document.body.classList.toggle('no-scroll', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  const onScroll = (): void => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    backTop.hidden = y < 800;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }),
  );

  // Resalta el enlace de la sección visible
  const links = $$<HTMLAnchorElement>('.main-nav a[href^="#"]');
  const sections = links
    .map((a) => document.querySelector<HTMLElement>(a.getAttribute('href')!))
    .filter((s): s is HTMLElement => s !== null);
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) =>
          a.getAttribute('href') === `#${entry.target.id}`
            ? a.setAttribute('aria-current', 'true')
            : a.removeAttribute('aria-current'),
        );
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => spy.observe(s));
};

export const initTeam = (): void => {
  $('#team-grid').innerHTML = TEAM.map(
    (t) => `<article class="team-card reveal">
      <img src="${t.image}" alt="${escapeHtml(t.role)}" loading="lazy" decoding="async" width="600" height="600"
           data-fallback="${escapeHtml(t.role)}" data-category="${t.category}" />
      <h3>${escapeHtml(t.role)}</h3>
      <p>${escapeHtml(t.description)}</p>
    </article>`,
  ).join('');
};

export const initGallery = (): void => {
  const gallery = $('#gallery');
  gallery.innerHTML = GALLERY.map(
    (g, i) => `<button type="button" class="gallery-item ${g.tall ? 'tall' : ''} reveal" data-index="${i}"
        aria-label="Ampliar imagen: ${escapeHtml(g.alt)}">
      <img src="${g.src}" alt="${escapeHtml(g.alt)}" loading="lazy" decoding="async" width="900" height="${g.tall ? 1200 : 700}"
           data-fallback="${escapeHtml(g.alt)}" data-category="${g.category}" />
    </button>`,
  ).join('');

  const box = $<HTMLDialogElement>('#lightbox');
  const boxImg = $<HTMLImageElement>('#lightbox-img');
  const caption = $('#lightbox-caption');
  setupDialog(box);
  let index = 0;

  const show = (i: number): void => {
    index = (i + GALLERY.length) % GALLERY.length;
    const item = GALLERY[index]!;
    const thumb = gallery.querySelector<HTMLImageElement>(`[data-index="${index}"] img`);
    delete boxImg.dataset.fallbackApplied;
    boxImg.dataset.fallback = item.alt;
    boxImg.dataset.category = item.category;
    boxImg.src = thumb?.dataset.fallbackApplied ? thumb.src : item.src.replace(/w=\d+/, 'w=1600');
    boxImg.alt = item.alt;
    caption.textContent = `${item.alt} · ${index + 1} de ${GALLERY.length}`;
  };

  gallery.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-index]');
    if (!btn) return;
    show(Number(btn.dataset.index));
    openDialog(box);
  });
  box.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-prev]')) show(index - 1);
    if (t.closest('[data-next]')) show(index + 1);
  });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  // Gesto de deslizamiento en móviles
  let startX = 0;
  box.addEventListener('touchstart', (e) => (startX = e.touches[0]?.clientX ?? 0), { passive: true });
  box.addEventListener('touchend', (e) => {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
};

export const initTestimonials = (): void => {
  const root = $('#testimonials');
  root.innerHTML = `
    <div class="t-viewport">
      ${TESTIMONIALS.map(
        (t, i) => `<figure class="t-slide" role="group" aria-roledescription="diapositiva"
            aria-label="${i + 1} de ${TESTIMONIALS.length}" ${i === 0 ? '' : 'hidden'}>
          <p class="stars" aria-label="${t.rating} de 5 estrellas">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</p>
          <blockquote><p>“${escapeHtml(t.text)}”</p></blockquote>
          <figcaption><strong>${escapeHtml(t.name)}</strong> · ${escapeHtml(t.service)}</figcaption>
        </figure>`,
      ).join('')}
    </div>
    <div class="t-controls">
      <button type="button" class="t-btn" data-t="prev" aria-label="Opinión anterior">‹</button>
      <div class="t-dots">${TESTIMONIALS.map(
        (_, i) => `<button type="button" class="t-dot" data-t="${i}" aria-label="Ver opinión ${i + 1}" aria-current="${i === 0}"></button>`,
      ).join('')}</div>
      <button type="button" class="t-btn" data-t="next" aria-label="Opinión siguiente">›</button>
    </div>`;

  const slides = $$('.t-slide', root);
  const dots = $$('.t-dot', root);
  let current = 0;
  const go = (i: number): void => {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, j) => (s.hidden = j !== current));
    dots.forEach((d, j) => d.setAttribute('aria-current', String(j === current)));
  };
  root.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-t]');
    if (!t) return;
    const v = t.dataset.t!;
    go(v === 'prev' ? current - 1 : v === 'next' ? current + 1 : Number(v));
  });

  if (prefersReducedMotion()) return;
  let timer = window.setInterval(() => go(current + 1), 7000);
  const pause = (): void => window.clearInterval(timer);
  const resume = (): void => {
    pause();
    timer = window.setInterval(() => go(current + 1), 7000);
  };
  root.addEventListener('mouseenter', pause);
  root.addEventListener('mouseleave', resume);
  root.addEventListener('focusin', pause);
  root.addEventListener('focusout', resume);
};

export const initHours = (): void => {
  $('#hours-table tbody').innerHTML = describeOpeningHours()
    .map((r) => `<tr><th scope="row">${r.days}</th><td>${r.hours}</td></tr>`)
    .join('');
  const now = new Date();
  const h = OPENING_HOURS[now.getDay()];
  const mins = now.getHours() * 60 + now.getMinutes();
  const toMin = (s: string): number => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  const open = h ? mins >= toMin(h.open) && mins < toMin(h.close) : false;
  const status = $('#open-status');
  status.textContent = open ? `● Abierto ahora · cerramos a las ${h!.close}` : '● Cerrado ahora · reserva tu cita para mañana';
  status.classList.toggle('is-open', open);
};

/** Animaciones de aparición y contadores, respetando "reducir movimiento". */
export const initReveal = (): void => {
  const items = $$('.reveal');
  const counters = $$<HTMLElement>('[data-count]');
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('visible'));
    counters.forEach((el) => (el.textContent = `+${Number(el.dataset.count).toLocaleString('es-PE')}`));
    return;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }),
    { threshold: 0.12 },
  );
  items.forEach((el) => io.observe(el));

  counters.forEach((el) => {
    const target = Number(el.dataset.count);
    const start = performance.now();
    const tick = (t: number): void => {
      const p = Math.min(1, (t - start) / 1600);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = `+${Math.round(target * eased).toLocaleString('es-PE')}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
};

export const initPrivacy = (): void => {
  const dialog = $<HTMLDialogElement>('#privacy-modal');
  setupDialog(dialog);
  document.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-open-privacy]')) openDialog(dialog);
  });
};
