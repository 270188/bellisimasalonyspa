import type { CategoryId } from '../types';
import { unsplash } from './services';

export interface TeamRole {
  role: string;
  description: string;
  image: string;
  category: CategoryId;
}

/** Áreas del equipo. Reemplaza las imágenes por fotos reales de tu equipo cuando las tengas. */
export const TEAM: TeamRole[] = [
  {
    role: 'Estilistas & colorimetristas',
    description: 'Especialistas en corte, balayage, rubios y tratamientos de reconstrucción.',
    image: unsplash('1522337360788-8b13dee7a37e', 600),
    category: 'cabello',
  },
  {
    role: 'Manicuristas',
    description: 'Expertas en gel, acrílico, soft gel y nail art de tendencia.',
    image: unsplash('1610992015732-2449b76344bc', 600),
    category: 'unas',
  },
  {
    role: 'Cosmetólogas',
    description: 'Diagnóstico de piel, faciales con aparatología y peelings.',
    image: unsplash('1570172619644-dfd03ed5d881', 600),
    category: 'facial',
  },
  {
    role: 'Terapeutas de spa',
    description: 'Masajes terapéuticos, relajantes y rituales corporales.',
    image: unsplash('1600334089648-b0d9d3028eb2', 600),
    category: 'spa',
  },
  {
    role: 'Maquilladoras',
    description: 'Maquillaje social, editorial y de novias con técnica HD.',
    image: unsplash('1516975080664-ed2fc6a32937', 600),
    category: 'maquillaje',
  },
];

export interface GalleryItem {
  src: string;
  alt: string;
  category: CategoryId;
  tall?: boolean;
}

export const GALLERY: GalleryItem[] = [
  { src: unsplash('1562322140-8baeececf3df', 900), alt: 'Balayage en tonos miel', category: 'color', tall: true },
  { src: unsplash('1604654894610-df63bc536371', 900), alt: 'Manicure en tonos nude', category: 'unas' },
  { src: unsplash('1544161515-4ab6ce6db874', 900), alt: 'Masaje relajante en cabina', category: 'spa' },
  { src: unsplash('1487412947147-5cebf100ffc2', 900), alt: 'Maquillaje social luminoso', category: 'maquillaje', tall: true },
  { src: unsplash('1560066984-138dadb4c035', 900), alt: 'Área de estilismo del salón', category: 'cabello' },
  { src: unsplash('1570172619644-dfd03ed5d881', 900), alt: 'Tratamiento facial con mascarilla', category: 'facial' },
  { src: unsplash('1519014816548-bf5fe059798b', 900), alt: 'Pedicure spa', category: 'unas', tall: true },
  { src: unsplash('1457972729786-0411a3b2b626', 900), alt: 'Peinado y maquillaje de novia', category: 'novias' },
  { src: unsplash('1600334089648-b0d9d3028eb2', 900), alt: 'Ritual con piedras calientes', category: 'spa' },
];

export interface Testimonial {
  name: string;
  service: string;
  text: string;
  rating: number;
}

/** Testimonios de ejemplo: reemplázalos por reseñas reales de tus clientas. */
export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Clienta frecuente',
    service: 'Balayage de autor',
    text: 'El color quedó exactamente como lo soñaba: natural, luminoso y con el cabello súper sano. La atención es de otro nivel.',
    rating: 5,
  },
  {
    name: 'Novia 2026',
    service: 'Paquete novia Bellísima',
    text: 'Me sentí la mujer más linda en mi boda. El maquillaje duró toda la noche y el peinado no se movió ni con el baile.',
    rating: 5,
  },
  {
    name: 'Clienta de spa',
    service: 'Masaje con piedras calientes',
    text: 'Un espacio de paz en medio de la ciudad. Salí renovada, el ambiente y el trato son impecables.',
    rating: 5,
  },
  {
    name: 'Clienta de uñas',
    service: 'Manicure en gel',
    text: 'Mis uñas duran perfectas casi un mes. Súper detallistas y todo es muy higiénico.',
    rating: 5,
  },
];
