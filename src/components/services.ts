import { CATEGORIES, SERVICES, findCategory, findService } from '../data/services';
import { escapeHtml, formatDuration, formatPrice, normalize } from '../lib/format';
import { srcset } from '../lib/images';
import type { CategoryId, Service } from '../types';
import { $, $$, openDialog, setupDialog, toast } from './ui';
import { selection } from './state';

type Filter = CategoryId | 'all';
type Sort = 'default' | 'price-asc' | 'price-desc' | 'duration' | 'name';

const state: { filter: Filter; query: string; sort: Sort } = { filter: 'all', query: '', sort: 'default' };

const img = (url: string, alt: string, category: string, sizes: string, eager = false): string => `
  <img src="${url}" ${srcset(url) ? `srcset="${srcset(url)}" sizes="${sizes}"` : ''}
       alt="${escapeHtml(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"
       width="800" height="600" data-fallback="${escapeHtml(alt)}" data-category="${category}" />`;

const addButton = (s: Service): string => {
  const on = selection.has(s.id);
  return `<button type="button" class="btn btn-sm ${on ? 'btn-gold' : 'btn-outline'}" data-add="${s.id}" aria-pressed="${on}">
    ${on ? '✓ Agregado' : '+ Agregar a mi cita'}</button>`;
};

const card = (s: Service): string => {
  const cat = findCategory(s.category);
  return `
  <article class="service-card" data-id="${s.id}">
    <button type="button" class="service-media" data-detail="${s.id}" aria-label="Ver detalle de ${escapeHtml(s.name)}">
      ${img(s.image, s.name, s.category, '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw')}
      ${s.featured ? '<span class="badge">Favorito</span>' : ''}
    </button>
    <div class="service-body">
      <p class="service-cat">${escapeHtml(cat?.name ?? '')}</p>
      <h3><button type="button" class="link-title" data-detail="${s.id}">${escapeHtml(s.name)}</button></h3>
      <p class="service-desc">${escapeHtml(s.description)}</p>
      <div class="service-meta">
        <span class="price"><small>desde</small> ${formatPrice(s.price)}</span>
        <span class="duration" aria-label="Duración ${formatDuration(s.duration)}">⏱ ${formatDuration(s.duration)}</span>
      </div>
      ${addButton(s)}
    </div>
  </article>`;
};

const visibleServices = (): Service[] => {
  const q = normalize(state.query);
  const list = SERVICES.filter((s) => {
    if (state.filter !== 'all' && s.category !== state.filter) return false;
    if (!q) return true;
    const cat = findCategory(s.category)?.name ?? '';
    return normalize(`${s.name} ${s.description} ${cat} ${s.includes.join(' ')}`).includes(q);
  });
  const sorters: Record<Sort, (a: Service, b: Service) => number> = {
    default: () => 0,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    duration: (a, b) => a.duration - b.duration,
    name: (a, b) => a.name.localeCompare(b.name, 'es'),
  };
  return [...list].sort(sorters[state.sort]);
};

const renderGrid = (): void => {
  const grid = $('#service-grid');
  const list = visibleServices();
  grid.innerHTML = list.length
    ? list.map(card).join('')
    : `<div class="empty"><p>No encontramos servicios para “${escapeHtml(state.query)}”.</p>
        <button type="button" class="btn btn-outline btn-sm" data-reset>Ver todos los servicios</button></div>`;
  $('#results-count').textContent = `${list.length} ${list.length === 1 ? 'servicio' : 'servicios'}`;
};

const renderChips = (): void => {
  const chips = [{ id: 'all', name: 'Todos' }, ...CATEGORIES]
    .map(
      (c) => `<button type="button" class="chip" data-filter="${c.id}" aria-pressed="${state.filter === c.id}">
        ${escapeHtml(c.name)}</button>`,
    )
    .join('');
  $('#filter-chips').innerHTML = chips;
};

export const setFilter = (filter: Filter): void => {
  state.filter = filter;
  renderChips();
  renderGrid();
};

const renderCategories = (): void => {
  $('#category-grid').innerHTML = CATEGORIES.map((c) => {
    const count = SERVICES.filter((s) => s.category === c.id).length;
    return `<a class="category-card reveal" href="#servicios" data-category-link="${c.id}">
      ${img(c.image, c.name, c.id, '(max-width: 640px) 50vw, 25vw')}
      <span class="category-overlay">
        <span class="category-name">${escapeHtml(c.name)}</span>
        <span class="category-count">${count} servicios</span>
      </span>
    </a>`;
  }).join('');
};

const renderFeatured = (): void => {
  $('#featured-track').innerHTML = SERVICES.filter((s) => s.featured)
    .map(
      (s) => `<article class="featured-card reveal">
        ${img(s.image, s.name, s.category, '(max-width: 640px) 85vw, 30vw')}
        <div class="featured-body">
          <p class="service-cat">${escapeHtml(findCategory(s.category)?.name ?? '')}</p>
          <h3>${escapeHtml(s.name)}</h3>
          <p>${escapeHtml(s.description)}</p>
          <div class="featured-foot">
            <span class="price"><small>desde</small> ${formatPrice(s.price)}</span>
            <button type="button" class="btn btn-sm btn-gold" data-detail="${s.id}">Ver detalle</button>
          </div>
        </div>
      </article>`,
    )
    .join('');
};

const openDetail = (id: string): void => {
  const s = findService(id);
  if (!s) return;
  const dialog = $<HTMLDialogElement>('#service-modal');
  $('#service-modal-body').innerHTML = `
    <button type="button" class="modal-close" data-close aria-label="Cerrar">×</button>
    <div class="detail">
      <div class="detail-media">${img(s.image.replace(/w=\d+/, 'w=1000'), s.name, s.category, '(max-width: 720px) 100vw, 50vw', true)}</div>
      <div class="detail-body">
        <p class="service-cat">${escapeHtml(findCategory(s.category)?.name ?? '')}</p>
        <h2 id="sm-title">${escapeHtml(s.name)}</h2>
        <p>${escapeHtml(s.description)}</p>
        <h3>Incluye</h3>
        <ul class="checklist">${s.includes.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
        <div class="service-meta">
          <span class="price"><small>desde</small> ${formatPrice(s.price)}</span>
          <span class="duration">⏱ ${formatDuration(s.duration)}</span>
        </div>
        <div class="detail-actions">
          ${addButton(s)}
          <a href="#reservar" class="btn btn-sm btn-ghost-dark" data-book-now="${s.id}">Reservar ahora</a>
        </div>
      </div>
    </div>`;
  openDialog(dialog);
};

const refreshAddButtons = (): void => {
  $$<HTMLButtonElement>('[data-add]').forEach((btn) => {
    const on = selection.has(btn.dataset.add!);
    btn.setAttribute('aria-pressed', String(on));
    btn.classList.toggle('btn-gold', on);
    btn.classList.toggle('btn-outline', !on);
    btn.textContent = on ? '✓ Agregado' : '+ Agregar a mi cita';
  });
};

export const initServices = (): void => {
  renderCategories();
  renderChips();
  renderGrid();
  renderFeatured();
  setupDialog($<HTMLDialogElement>('#service-modal'));

  let debounce: number | undefined;
  $<HTMLInputElement>('#service-search').addEventListener('input', (e) => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      state.query = (e.target as HTMLInputElement).value;
      renderGrid();
    }, 150);
  });
  $<HTMLSelectElement>('#service-sort').addEventListener('change', (e) => {
    state.sort = (e.target as HTMLSelectElement).value as Sort;
    renderGrid();
  });

  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const filter = t.closest<HTMLElement>('[data-filter]');
    if (filter) return setFilter(filter.dataset.filter as Filter);

    const catLink = t.closest<HTMLElement>('[data-category-link]');
    if (catLink) return setFilter(catLink.dataset.categoryLink as CategoryId);

    if (t.closest('[data-reset]')) {
      state.query = '';
      $<HTMLInputElement>('#service-search').value = '';
      return setFilter('all');
    }

    const detail = t.closest<HTMLElement>('[data-detail]');
    if (detail) return openDetail(detail.dataset.detail!);

    const add = t.closest<HTMLElement>('[data-add]');
    if (add) {
      const id = add.dataset.add!;
      const on = selection.toggle(id);
      toast(on ? `${findService(id)?.name} agregado a tu cita` : 'Servicio retirado de tu cita');
      return;
    }

    const bookNow = t.closest<HTMLElement>('[data-book-now]');
    if (bookNow) {
      selection.add(bookNow.dataset.bookNow!);
      $<HTMLDialogElement>('#service-modal').close();
    }
  });

  selection.subscribe(refreshAddButtons);
};
