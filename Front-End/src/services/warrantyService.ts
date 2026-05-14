export interface Warranty {
  id: string;
  title: string;
  story?: string;
  nfNumber?: string;
  quantity?: string;
  purchaseDate?: string;
  expirationDate?: string;
  warrantyType?: string;
  value?: string;
}

const STORAGE_KEY = '@garantias:warranties';

/** Separador interno de `title` (nome + marca + modelo). */
export const WARRANTY_TITLE_JOIN_SEP = ' ';

export function buildWarrantyTitle(
  productName: string,
  brand?: string,
  model?: string
): string {
  return [productName.trim(), brand?.trim(), model?.trim()]
    .filter((s): s is string => Boolean(s && s.length > 0))
    .join(WARRANTY_TITLE_JOIN_SEP);
}

function isStoredWarrantyItem(value: unknown): value is Warranty {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.title === 'string';
}

export function getWarranties(): Warranty[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw.trim() === '') return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredWarrantyItem);
  } catch {
    return [];
  }
}

export type WarrantyInput = Omit<Warranty, 'id'>;

export function saveWarranty(data: WarrantyInput): Warranty {
  const prev = getWarranties();
  const newWarranty: Warranty = {
    ...data,
    id: crypto.randomUUID(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, newWarranty]));
  } catch {
    /* quota cheia ou storage indisponível */
  }
  return newWarranty;
}

export function deleteWarranty(id: string): void {
  const list = getWarranties().filter((w) => w.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    //
  }
}
