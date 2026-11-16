import { storage } from '../lib/storage';
import { SERVICES } from '../data/services';

const KEY = 'bellisima:selected-services';
type Listener = (ids: string[]) => void;

/** Estado compartido: servicios seleccionados para la cita. */
const valid = new Set(SERVICES.map((s) => s.id));
let selected: string[] = storage.get<string[]>(KEY, []).filter((id) => valid.has(id));
const listeners = new Set<Listener>();

const emit = (): void => {
  storage.set(KEY, selected);
  listeners.forEach((fn) => fn([...selected]));
};

export const selection = {
  get: (): string[] => [...selected],
  has: (id: string): boolean => selected.includes(id),
  add(id: string): void {
    if (!valid.has(id) || selected.includes(id)) return;
    selected = [...selected, id];
    emit();
  },
  remove(id: string): void {
    selected = selected.filter((s) => s !== id);
    emit();
  },
  toggle(id: string): boolean {
    if (selected.includes(id)) this.remove(id);
    else this.add(id);
    return selected.includes(id);
  },
  clear(): void {
    selected = [];
    emit();
  },
  subscribe(fn: Listener): void {
    listeners.add(fn);
    fn([...selected]);
  },
};
