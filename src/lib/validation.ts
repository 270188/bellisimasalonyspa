import type { BookingData, FieldErrors } from '../types';
import { SERVICES } from '../data/services';
import { getTimeSlots, parseISODate, toISODate, isOpenOn } from './schedule';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Acepta celulares peruanos (9 dígitos que empiezan en 9) con o sin +51, o teléfonos internacionales de 8–15 dígitos. */
export const isValidPhone = (raw: string): boolean => {
  const digits = raw.replace(/[\s\-().]/g, '');
  if (/^(\+?51)?9\d{8}$/.test(digits)) return true;
  return /^\+\d{8,15}$/.test(digits);
};

export const MAX_ADVANCE_DAYS = 90;

export const validateBooking = (data: BookingData, now: Date = new Date()): FieldErrors => {
  const errors: FieldErrors = {};
  const name = data.name.trim();
  if (name.length < 3) errors.name = 'Ingresa tu nombre completo (mínimo 3 caracteres).';
  else if (name.length > 80) errors.name = 'El nombre es demasiado largo.';
  else if (!/^[\p{L}\s'.-]+$/u.test(name)) errors.name = 'El nombre solo puede contener letras.';

  if (!data.phone.trim()) errors.phone = 'Ingresa tu número de celular.';
  else if (!isValidPhone(data.phone)) errors.phone = 'Ingresa un celular válido (ej. 990 073 634).';

  if (data.email.trim() && !EMAIL_RE.test(data.email.trim()))
    errors.email = 'Ingresa un correo electrónico válido.';

  const validIds = new Set(SERVICES.map((s) => s.id));
  if (data.services.length === 0) errors.services = 'Selecciona al menos un servicio.';
  else if (data.services.some((id) => !validIds.has(id))) errors.services = 'Hay un servicio no válido.';

  const date = parseISODate(data.date);
  const today = parseISODate(toISODate(now))!;
  if (!data.date) errors.date = 'Selecciona una fecha.';
  else if (!date) errors.date = 'Fecha no válida.';
  else if (date < today) errors.date = 'La fecha no puede ser anterior a hoy.';
  else if ((date.getTime() - today.getTime()) / 86_400_000 > MAX_ADVANCE_DAYS)
    errors.date = `Puedes reservar con hasta ${MAX_ADVANCE_DAYS} días de anticipación.`;
  else if (!isOpenOn(date)) errors.date = 'El salón no atiende ese día.';

  if (!data.time) errors.time = 'Selecciona un horario.';
  else if (!errors.date && !getTimeSlots(data.date, totalDuration(data.services), now).includes(data.time))
    errors.time = 'Ese horario no está disponible.';

  if (data.notes.length > 500) errors.notes = 'Máximo 500 caracteres.';
  if (!data.consent) errors.consent = 'Debes aceptar la política de privacidad.';
  return errors;
};

export const totalDuration = (ids: string[]): number =>
  ids.reduce((acc, id) => acc + (SERVICES.find((s) => s.id === id)?.duration ?? 0), 0) || 60;

export const totalPrice = (ids: string[]): number =>
  ids.reduce((acc, id) => acc + (SERVICES.find((s) => s.id === id)?.price ?? 0), 0);
