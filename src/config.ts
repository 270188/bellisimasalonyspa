/**
 * Configuración general del negocio.
 * Edita estos valores para actualizar los datos de contacto en todo el sitio.
 */
export const BUSINESS = {
  name: 'Bellísima Salon & Spa',
  shortName: 'Bellísima',
  tagline: 'Belleza de alta gama, hecha a tu medida',
  phoneDisplay: '990 073 634',
  /** Formato internacional sin "+" ni espacios (Perú: 51). */
  phoneIntl: '51990073634',
  email: 'angelaruizleon2701@gmail.com',
  currency: 'S/',
  /** Dirección: reemplázala por la dirección real del salón. */
  address: 'Lima, Perú',
  social: {
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
    tiktok: 'https://www.tiktok.com/',
  },
} as const;

/** Horario de atención. 0 = domingo … 6 = sábado. null = cerrado. */
export const OPENING_HOURS: Record<number, { open: string; close: string } | null> = {
  0: { open: '10:00', close: '17:00' },
  1: { open: '09:00', close: '20:00' },
  2: { open: '09:00', close: '20:00' },
  3: { open: '09:00', close: '20:00' },
  4: { open: '09:00', close: '20:00' },
  5: { open: '09:00', close: '20:00' },
  6: { open: '09:00', close: '20:00' },
};

/** Intervalo entre horarios de reserva, en minutos. */
export const SLOT_MINUTES = 30;

export const whatsappUrl = (message?: string): string =>
  `https://wa.me/${BUSINESS.phoneIntl}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

export const telUrl = `tel:+${BUSINESS.phoneIntl}`;
export const mailUrl = (subject?: string, body?: string): string => {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const qs = params.toString().replace(/\+/g, '%20');
  return `mailto:${BUSINESS.email}${qs ? `?${qs}` : ''}`;
};
