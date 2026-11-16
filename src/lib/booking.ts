import type { BookingData } from '../types';
import { BUSINESS } from '../config';
import { findService } from '../data/services';
import { formatDuration, formatLongDate, formatPrice } from './format';
import { totalDuration, totalPrice } from './validation';

/** Construye el mensaje de reserva que se envía por WhatsApp o correo. */
export const buildBookingMessage = (data: BookingData): string => {
  const services = data.services
    .map((id) => findService(id))
    .filter((s) => s !== undefined)
    .map((s) => `• ${s.name} (${formatPrice(s.price)})`)
    .join('\n');
  const lines = [
    `Hola ${BUSINESS.name}, quisiera reservar una cita ✨`,
    '',
    `👤 Nombre: ${data.name.trim()}`,
    `📱 Celular: ${data.phone.trim()}`,
    data.email.trim() ? `✉️ Correo: ${data.email.trim()}` : '',
    '',
    '💅 Servicios:',
    services,
    '',
    `📅 Fecha: ${formatLongDate(data.date)}`,
    `🕐 Hora: ${data.time}`,
    `⏱️ Duración aprox.: ${formatDuration(totalDuration(data.services))}`,
    `💰 Total referencial: ${formatPrice(totalPrice(data.services))}`,
    data.notes.trim() ? `\n📝 Notas: ${data.notes.trim()}` : '',
  ];
  return lines.filter((l, i, arr) => !(l === '' && arr[i - 1] === '')).join('\n').trim();
};
