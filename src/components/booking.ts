import { CATEGORIES, SERVICES, findService } from '../data/services';
import { BUSINESS, mailUrl, whatsappUrl } from '../config';
import { buildBookingMessage } from '../lib/booking';
import { escapeHtml, formatDuration, formatPrice } from '../lib/format';
import { getTimeSlots, isOpenOn, parseISODate, toISODate } from '../lib/schedule';
import { storage } from '../lib/storage';
import { MAX_ADVANCE_DAYS, totalDuration, totalPrice, validateBooking } from '../lib/validation';
import type { BookingData, FieldErrors } from '../types';
import { $, toast } from './ui';
import { selection } from './state';

const DRAFT_KEY = 'bellisima:booking-draft';
type Draft = Pick<BookingData, 'name' | 'phone' | 'email' | 'notes'>;

const form = (): HTMLFormElement => $<HTMLFormElement>('#booking-form');
const input = (name: string): HTMLInputElement => form().elements.namedItem(name) as HTMLInputElement;

const readForm = (): BookingData => ({
  name: input('name').value,
  phone: input('phone').value,
  email: input('email').value,
  services: selection.get(),
  date: input('date').value,
  time: (form().elements.namedItem('time') as HTMLSelectElement).value,
  notes: (form().elements.namedItem('notes') as HTMLTextAreaElement).value,
  consent: input('consent').checked,
});

const ERROR_TARGETS: Record<keyof BookingData, { field: string; err: string }> = {
  name: { field: '#b-name', err: '#b-name-err' },
  phone: { field: '#b-phone', err: '#b-phone-err' },
  email: { field: '#b-email', err: '#b-email-err' },
  services: { field: '#b-service-add', err: '#b-services-err' },
  date: { field: '#b-date', err: '#b-date-err' },
  time: { field: '#b-time', err: '#b-time-err' },
  notes: { field: '#b-notes', err: '#b-notes-count' },
  consent: { field: '#b-consent', err: '#b-consent-err' },
};

const showErrors = (errors: FieldErrors, only?: keyof BookingData): void => {
  (Object.keys(ERROR_TARGETS) as (keyof BookingData)[]).forEach((key) => {
    if (only && key !== only) return;
    if (key === 'notes') return;
    const { field, err } = ERROR_TARGETS[key];
    const msg = errors[key] ?? '';
    $(err).textContent = msg;
    $(field).setAttribute('aria-invalid', String(Boolean(msg)));
    $(field).closest('.field')?.classList.toggle('has-error', Boolean(msg));
  });
};

const populateServiceSelect = (): void => {
  const select = $<HTMLSelectElement>('#b-service-add');
  const groups = CATEGORIES.map((c) => {
    const opts = SERVICES.filter((s) => s.category === c.id && !selection.has(s.id))
      .map((s) => `<option value="${s.id}">${escapeHtml(s.name)} — ${formatPrice(s.price)}</option>`)
      .join('');
    return opts ? `<optgroup label="${escapeHtml(c.name)}">${opts}</optgroup>` : '';
  }).join('');
  select.innerHTML = `<option value="">+ Agregar un servicio…</option>${groups}`;
};

const renderSelected = (ids: string[]): void => {
  $('#selected-services').innerHTML = ids
    .map((id) => findService(id))
    .filter((s) => s !== undefined)
    .map(
      (s) => `<li><span>${escapeHtml(s.name)} <small>${formatPrice(s.price)} · ${formatDuration(s.duration)}</small></span>
        <button type="button" data-remove="${s.id}" aria-label="Quitar ${escapeHtml(s.name)}">×</button></li>`,
    )
    .join('');
};

const renderSummary = (ids: string[]): void => {
  const el = $('#booking-summary');
  if (!ids.length) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = `<div><span>Duración estimada</span><strong>${formatDuration(totalDuration(ids))}</strong></div>
    <div><span>Total referencial</span><strong>${formatPrice(totalPrice(ids))}</strong></div>`;
};

const renderSlots = (): void => {
  const date = input('date').value;
  const select = $<HTMLSelectElement>('#b-time');
  const prev = select.value;
  if (!date) {
    select.innerHTML = '<option value="">Elige primero una fecha</option>';
    return;
  }
  const parsed = parseISODate(date);
  if (parsed && !isOpenOn(parsed)) {
    select.innerHTML = '<option value="">Cerrado ese día</option>';
    return;
  }
  const slots = getTimeSlots(date, totalDuration(selection.get()));
  select.innerHTML = slots.length
    ? `<option value="">Selecciona una hora</option>${slots
        .map((t) => `<option value="${t}" ${t === prev ? 'selected' : ''}>${t}</option>`)
        .join('')}`
    : '<option value="">Sin horarios disponibles</option>';
};

const renderSelectionBar = (ids: string[]): void => {
  const bar = $('#selection-bar');
  bar.hidden = ids.length === 0;
  $('#sel-count').textContent = String(ids.length);
  $('#sel-label').textContent = ids.length === 1 ? 'servicio' : 'servicios';
  $('#sel-total').textContent = formatPrice(totalPrice(ids));
};

const saveDraft = (): void => {
  const d = readForm();
  storage.set(DRAFT_KEY, { name: d.name, phone: d.phone, email: d.email, notes: d.notes } satisfies Draft);
};

const restoreDraft = (): void => {
  const d = storage.get<Partial<Draft>>(DRAFT_KEY, {});
  if (d.name) input('name').value = d.name;
  if (d.phone) input('phone').value = d.phone;
  if (d.email) input('email').value = d.email;
  if (d.notes) (form().elements.namedItem('notes') as HTMLTextAreaElement).value = d.notes;
};

const updateNotesCount = (): void => {
  const len = (form().elements.namedItem('notes') as HTMLTextAreaElement).value.length;
  $('#b-notes-count').textContent = `${len} / 500`;
};

export const initBooking = (): void => {
  const f = form();
  const today = new Date();
  const max = new Date(today);
  max.setDate(max.getDate() + MAX_ADVANCE_DAYS);
  input('date').min = toISODate(today);
  input('date').max = toISODate(max);

  restoreDraft();
  updateNotesCount();

  selection.subscribe((ids) => {
    populateServiceSelect();
    renderSelected(ids);
    renderSummary(ids);
    renderSelectionBar(ids);
    renderSlots();
    if (ids.length) showErrors({}, 'services');
  });

  $<HTMLSelectElement>('#b-service-add').addEventListener('change', (e) => {
    const sel = e.target as HTMLSelectElement;
    if (sel.value) selection.add(sel.value);
    sel.value = '';
  });

  $('#selected-services').addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-remove]');
    if (btn) selection.remove(btn.dataset.remove!);
  });

  input('date').addEventListener('change', () => {
    renderSlots();
    const errors = validateBooking(readForm());
    showErrors(errors, 'date');
  });

  f.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'notes') updateNotesCount();
    saveDraft();
    // Limpia el error del campo en cuanto la persona corrige
    const key = t.name as keyof BookingData;
    if (key in ERROR_TARGETS && t.getAttribute('aria-invalid') === 'true') {
      showErrors(validateBooking(readForm()), key);
    }
  });

  f.addEventListener('focusout', (e) => {
    const t = e.target as HTMLInputElement;
    const key = t.name as keyof BookingData;
    if (['name', 'phone', 'email'].includes(key) && t.value) showErrors(validateBooking(readForm()), key);
  });

  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitter = (e as SubmitEvent).submitter as HTMLButtonElement | null;
    const channel = submitter?.dataset.channel ?? 'whatsapp';
    const data = readForm();
    const errors = validateBooking(data);
    showErrors(errors);
    const firstKey = (Object.keys(ERROR_TARGETS) as (keyof BookingData)[]).find((k) => errors[k]);
    if (firstKey) {
      $(ERROR_TARGETS[firstKey].field).focus();
      toast('Revisa los campos marcados para continuar.');
      return;
    }
    const message = buildBookingMessage(data);
    const url =
      channel === 'email'
        ? mailUrl(`Reserva de cita – ${data.name.trim()}`, message)
        : whatsappUrl(message);
    if (channel === 'email') window.location.href = url;
    else window.open(url, '_blank', 'noopener,noreferrer');
    toast(
      channel === 'email'
        ? 'Abriendo tu correo… ¡Gracias por elegirnos!'
        : `Abriendo WhatsApp para enviar tu reserva a ${BUSINESS.shortName}…`,
    );
  });
};
