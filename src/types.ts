export type CategoryId =
  | 'cabello'
  | 'color'
  | 'unas'
  | 'facial'
  | 'spa'
  | 'maquillaje'
  | 'cejas-pestanas'
  | 'depilacion'
  | 'novias';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  image: string;
}

export interface Service {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  /** Lo que incluye el servicio. */
  includes: string[];
  /** Precio referencial "desde", en soles. */
  price: number;
  /** Duración aproximada en minutos. */
  duration: number;
  image: string;
  featured?: boolean;
}

export interface BookingData {
  name: string;
  phone: string;
  email: string;
  services: string[];
  date: string;
  time: string;
  notes: string;
  consent: boolean;
}

export type FieldErrors = Partial<Record<keyof BookingData, string>>;
