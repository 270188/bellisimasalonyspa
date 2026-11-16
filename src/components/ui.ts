/** Utilidades de interfaz: selección de elementos, toast y diálogos accesibles. */
export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T => {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Elemento no encontrado: ${sel}`);
  return el;
};

export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(sel));

let toastTimer: number | undefined;
export const toast = (message: string): void => {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 3200);
};

const lastFocus = new WeakMap<HTMLDialogElement, Element | null>();

export const openDialog = (dialog: HTMLDialogElement): void => {
  lastFocus.set(dialog, document.activeElement);
  dialog.showModal();
  document.body.classList.add('no-scroll');
};

export const closeDialog = (dialog: HTMLDialogElement): void => {
  if (dialog.open) dialog.close();
};

/** Cierre por botón [data-close], clic en el fondo y restauración del foco. */
export const setupDialog = (dialog: HTMLDialogElement): void => {
  dialog.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target === dialog || target.closest('[data-close]')) closeDialog(dialog);
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('no-scroll');
    const prev = lastFocus.get(dialog);
    if (prev instanceof HTMLElement) prev.focus();
  });
};

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
