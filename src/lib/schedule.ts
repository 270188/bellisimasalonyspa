import { OPENING_HOURS, SLOT_MINUTES } from '../config';

const toMinutes = (hhmm: string): number => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const toHHMM = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** Convierte "YYYY-MM-DD" a fecha local (sin desfase por zona horaria). */
export const parseISODate = (iso: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
};

export const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const isOpenOn = (date: Date): boolean => OPENING_HOURS[date.getDay()] != null;

/**
 * Devuelve los horarios disponibles de un día, dejando margen para que
 * el servicio (duración en minutos) termine antes del cierre.
 * Si la fecha es hoy, se omiten horas pasadas (+1 h de anticipación).
 */
export const getTimeSlots = (iso: string, durationMinutes = 60, now: Date = new Date()): string[] => {
  const date = parseISODate(iso);
  if (!date) return [];
  const hours = OPENING_HOURS[date.getDay()];
  if (!hours) return [];
  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  const lastStart = close - Math.min(durationMinutes, close - open);
  let earliest = open;
  if (toISODate(now) === iso) {
    const nowMin = now.getHours() * 60 + now.getMinutes() + 60;
    earliest = Math.max(open, Math.ceil(nowMin / SLOT_MINUTES) * SLOT_MINUTES);
  }
  const slots: string[] = [];
  for (let t = earliest; t <= lastStart; t += SLOT_MINUTES) slots.push(toHHMM(t));
  return slots;
};

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** Agrupa días con el mismo horario para mostrarlos de forma compacta. */
export const describeOpeningHours = (): { days: string; hours: string }[] => {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const groups: { days: number[]; hours: string }[] = [];
  for (const d of order) {
    const h = OPENING_HOURS[d];
    const label = h ? `${h.open} – ${h.close}` : 'Cerrado';
    const last = groups[groups.length - 1];
    if (last && last.hours === label) last.days.push(d);
    else groups.push({ days: [d], hours: label });
  }
  return groups.map((g) => ({
    days:
      g.days.length > 1
        ? `${DAY_NAMES[g.days[0]!]} a ${DAY_NAMES[g.days[g.days.length - 1]!]}`
        : DAY_NAMES[g.days[0]!]!,
    hours: g.hours,
  }));
};
