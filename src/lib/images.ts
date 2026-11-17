import type { CategoryId } from '../types';

/** Paleta y motivo por categoría para las imágenes de respaldo. */
const THEMES: Record<CategoryId | 'default', { from: string; to: string; motif: string }> = {
  cabello: { from: '#2b2420', to: '#8a6a4a', motif: 'M-30 40 C 10 -20, 40 80, 80 20 S 140 -10, 170 50' },
  color: { from: '#3a2318', to: '#c08a5b', motif: 'M-20 60 C 30 0, 60 100, 100 30 S 160 0, 190 60' },
  unas: { from: '#3b1f27', to: '#c98b97', motif: 'M50 10 a20 30 0 1 0 0.1 0 M110 30 a18 28 0 1 0 0.1 0' },
  facial: { from: '#2a2a26', to: '#bfae8f', motif: 'M80 10 a60 60 0 1 0 0.1 0' },
  spa: { from: '#1f2a24', to: '#8fa88f', motif: 'M20 90 Q 80 20 140 90 M40 100 Q 80 50 120 100' },
  maquillaje: { from: '#2d1b24', to: '#b3727f', motif: 'M30 100 L 70 10 L 90 10 L 130 100' },
  'cejas-pestanas': { from: '#1f1f22', to: '#9b8a78', motif: 'M20 60 Q 80 10 140 60 M30 70 l -8 14 M50 66 l -6 16 M70 64 l -3 17 M90 64 l 3 17 M110 66 l 6 16 M130 70 l 8 14' },
  depilacion: { from: '#2e2622', to: '#d2b49a', motif: 'M10 70 C 50 40, 110 100, 150 60' },
  novias: { from: '#2a2522', to: '#e2d2bd', motif: 'M80 20 l 12 30 l 32 0 l -26 20 l 10 30 l -28 -18 l -28 18 l 10 -30 l -26 -20 l 32 0 z' },
  default: { from: '#1c1a19', to: '#b08d57', motif: 'M80 10 a60 60 0 1 0 0.1 0' },
};

/** Genera una imagen SVG elegante para usar cuando una foto no carga. */
export const fallbackImage = (label: string, category: string = 'default'): string => {
  const t = THEMES[category as CategoryId] ?? THEMES.default;
  const safe = label.replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.from}"/><stop offset="1" stop-color="${t.to}"/></linearGradient></defs>
<rect width="800" height="600" fill="url(#g)"/>
<g transform="translate(320 170) scale(1)" fill="none" stroke="#f5ecdf" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"><path d="${t.motif}"/></g>
${safe ? `<text x="400" y="380" text-anchor="middle" font-family="Georgia, serif" font-size="44" fill="#f8f1e7">${safe}</text>
<text x="400" y="430" text-anchor="middle" font-family="Georgia, serif" font-size="20" letter-spacing="6" fill="#f8f1e7" fill-opacity=".75">BELLÍSIMA SALON &amp; SPA</text>` : ''}
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * Sustituye automáticamente cualquier <img data-fallback> que falle al cargar
 * por una ilustración de respaldo con la marca.
 */
export const installImageFallback = (root: Document = document): void => {
  root.addEventListener(
    'error',
    (event) => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement) || img.dataset.fallbackApplied) return;
      if (img.dataset.fallback === undefined) return;
      img.dataset.fallbackApplied = 'true';
      img.removeAttribute('srcset');
      img.src = fallbackImage(img.dataset.fallback ?? '', img.dataset.category);
    },
    true,
  );
  // Imágenes que fallaron antes de que se registrara el listener
  root.querySelectorAll<HTMLImageElement>('img[data-fallback]').forEach((img) => {
    if (img.complete && img.naturalWidth === 0 && img.src) img.dispatchEvent(new Event('error'));
  });
};

/** Genera atributos srcset para imágenes de Unsplash. */
export const srcset = (url: string): string => {
  if (!/images\.(unsplash|pexels)\.com/.test(url)) return '';
  return [400, 800, 1200].map((w) => `${url.replace(/w=\d+/, `w=${w}`)} ${w}w`).join(', ');
};
