import { describe, expect, it } from 'vitest';
import { isValidPhone, validateBooking, totalPrice, totalDuration } from '../src/lib/validation';
import { getTimeSlots } from '../src/lib/schedule';
import { buildBookingMessage } from '../src/lib/booking';
import { SERVICES } from '../src/data/services';
import type { BookingData } from '../src/types';

// Martes 17 nov 2026, 08:00
const NOW = new Date(2026, 10, 17, 8, 0);

const base: BookingData = {
  name: 'Angela Ruiz',
  phone: '990 073 634',
  email: '',
  services: ['manicure-gel'],
  date: '2026-11-18',
  time: '10:00',
  notes: '',
  consent: true,
};

describe('teléfono', () => {
  it('acepta celulares peruanos', () => {
    expect(isValidPhone('990 073 634')).toBe(true);
    expect(isValidPhone('+51 990073634')).toBe(true);
  });
  it('rechaza números inválidos', () => {
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidPhone('890073634')).toBe(false);
  });
});

describe('validateBooking', () => {
  it('acepta una reserva válida', () => {
    expect(validateBooking(base, NOW)).toEqual({});
  });
  it('exige campos obligatorios', () => {
    const e = validateBooking({ ...base, name: '', phone: '', services: [], date: '', time: '', consent: false }, NOW);
    expect(Object.keys(e).sort()).toEqual(['consent', 'date', 'name', 'phone', 'services', 'time']);
  });
  it('rechaza fechas pasadas y correos inválidos', () => {
    const e = validateBooking({ ...base, date: '2026-11-01', email: 'malo@' }, NOW);
    expect(e.date).toBeDefined();
    expect(e.email).toBeDefined();
  });
  it('rechaza horarios fuera de atención', () => {
    expect(validateBooking({ ...base, time: '22:00' }, NOW).time).toBeDefined();
  });
});

describe('horarios', () => {
  it('termina el servicio antes del cierre', () => {
    const slots = getTimeSlots('2026-11-18', 120, NOW);
    expect(slots[0]).toBe('09:00');
    expect(slots.at(-1)).toBe('18:00');
  });
  it('domingo tiene horario reducido', () => {
    const slots = getTimeSlots('2026-11-22', 60, NOW);
    expect(slots[0]).toBe('10:00');
    expect(slots.at(-1)).toBe('16:00');
  });
  it('hoy omite horas pasadas', () => {
    const slots = getTimeSlots('2026-11-17', 60, new Date(2026, 10, 17, 14, 10));
    expect(slots[0]).toBe('15:30');
  });
});

describe('catálogo y mensaje', () => {
  it('cada servicio tiene datos completos e id único', () => {
    const ids = new Set(SERVICES.map((s) => s.id));
    expect(ids.size).toBe(SERVICES.length);
    for (const s of SERVICES) {
      expect(s.image).toMatch(/^https:\/\/|^\.\//);
      expect(s.price).toBeGreaterThan(0);
      expect(s.includes.length).toBeGreaterThan(0);
    }
  });
  it('calcula totales y arma el mensaje', () => {
    const data = { ...base, services: ['manicure-gel', 'pedicure-spa'] };
    expect(totalPrice(data.services)).toBe(130);
    expect(totalDuration(data.services)).toBe(130);
    const msg = buildBookingMessage(data);
    expect(msg).toContain('Manicure en gel');
    expect(msg).toContain('S/ 130');
  });
});
