export interface WarrantyAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
}

import type { WarrantyUiStatus } from "../utils/warrantyStatus";

export interface Warranty {
  id: string;
  title: string;
  story?: string;
  storeCnpj?: string;
  nfNumber?: string;
  quantity?: string;
  purchaseDate?: string;
  expirationDate?: string;
  warrantyType?: string;
  /** Valor total formatado (legado / compatibilidade com cards) */
  value?: string;
  unitValue?: string;
  totalValue?: string;
  /** Prazo da garantia em dias (campo `prazo_dias` da API) */
  warrantyPeriodDays?: number;
  notes?: string;
  attachments?: WarrantyAttachment[];
  /** Status da UI — vindo do back (`Ativa` → `Ativo`, etc.) ou calculado localmente */
  status?: WarrantyUiStatus;
  /** Dias até vencer (`dias_restantes` do back); null se vencida */
  daysToExpire?: number | null;
  /** ISO 8601 — presente quando a garantia está na lixeira (soft delete). */
  deletedAt?: string;
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

export function persistWarranties(list: Warranty[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function isWarrantyDeleted(warranty: Warranty): boolean {
  return Boolean(warranty.deletedAt);
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

export function getActiveWarranties(): Warranty[] {
  return getWarranties().filter((w) => !isWarrantyDeleted(w));
}

export function getTrashedWarranties(): Warranty[] {
  return getWarranties().filter(isWarrantyDeleted);
}

export function getWarrantyById(id: string): Warranty | undefined {
  return getWarranties().find((w) => w.id === id);
}

export type WarrantyInput = Omit<Warranty, 'id' | 'deletedAt'>;

export type WarrantyUpdate = Partial<WarrantyInput> & {
  deletedAt?: string | null;
};

export function saveWarranty(data: WarrantyInput): Warranty {
  const prev = getWarranties();
  const newWarranty: Warranty = {
    ...data,
    id: crypto.randomUUID(),
  };
  persistWarranties([...prev, newWarranty]);
  return newWarranty;
}

/** Grava ou substitui garantia pelo id (ex.: após criar na API). */
export function persistWarranty(warranty: Warranty): Warranty {
  const list = getWarranties();
  const index = list.findIndex((w) => w.id === warranty.id);
  if (index >= 0) {
    const next = [...list];
    next[index] = warranty;
    persistWarranties(next);
  } else {
    persistWarranties([...list, warranty]);
  }
  return warranty;
}

const WARRANTY_SCALAR_FIELDS = [
  'title',
  'story',
  'storeCnpj',
  'nfNumber',
  'quantity',
  'purchaseDate',
  'expirationDate',
  'warrantyType',
  'value',
  'unitValue',
  'totalValue',
  'notes',
] as const satisfies readonly (keyof WarrantyInput)[];

function applyWarrantyUpdate(current: Warranty, updates: WarrantyUpdate): Warranty {
  const next: Warranty = { ...current };

  if ('deletedAt' in updates) {
    if (updates.deletedAt == null) {
      delete next.deletedAt;
    } else {
      next.deletedAt = updates.deletedAt;
    }
  }

  for (const field of WARRANTY_SCALAR_FIELDS) {
    if (field in updates) {
      const value = updates[field];
      if (value === undefined) {
        delete next[field];
      } else {
        next[field] = value;
      }
    }
  }

  if ("warrantyPeriodDays" in updates) {
    if (updates.warrantyPeriodDays === undefined) {
      delete next.warrantyPeriodDays;
    } else {
      next.warrantyPeriodDays = updates.warrantyPeriodDays;
    }
  }

  if ('attachments' in updates) {
    if (updates.attachments === undefined) {
      delete next.attachments;
    } else {
      next.attachments = updates.attachments;
    }
  }

  return next;
}

export function updateWarranty(
  id: string,
  updates: WarrantyUpdate
): { success: true; warranty: Warranty } | { success: false; error: string } {
  const list = getWarranties();
  const index = list.findIndex((w) => w.id === id);
  if (index === -1) {
    return { success: false, error: 'Garantia não encontrada.' };
  }

  const nextItem = applyWarrantyUpdate(list[index], updates);

  if (!nextItem.title.trim()) {
    return { success: false, error: 'O título é obrigatório.' };
  }

  const nextList = [...list];
  nextList[index] = nextItem;

  if (!persistWarranties(nextList)) {
    return { success: false, error: 'Não foi possível salvar. Tente novamente.' };
  }

  return { success: true, warranty: nextItem };
}

export function softDeleteWarranty(
  id: string
): { success: true } | { success: false; error: string } {
  const result = updateWarranty(id, {
    deletedAt: new Date().toISOString(),
  });
  if (!result.success) return result;
  return { success: true };
}

export function restoreWarranty(
  id: string
): { success: true; warranty: Warranty } | { success: false; error: string } {
  return updateWarranty(id, { deletedAt: null });
}

export function permanentlyDeleteWarranty(id: string): boolean {
  const list = getWarranties().filter((w) => w.id !== id);
  return persistWarranties(list);
}

/** @deprecated Use softDeleteWarranty para enviar à lixeira. */
export function deleteWarranty(id: string): void {
  permanentlyDeleteWarranty(id);
}
