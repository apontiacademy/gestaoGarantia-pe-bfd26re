export interface WarrantyAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
}

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
  value?: string;
  notes?: string;
  attachments?: WarrantyAttachment[];
  /** ISO 8601 — presente quando a garantia está na lixeira (soft delete). */
  deletedAt?: string;
}

// 1. Chaves separadas para manter os dados organizados e isolados
const STORAGE_KEY_EMPLOYEE = '@garantias:warranties';
const STORAGE_KEY_VISITOR = '@garantias:visitor_warranties';

/** Separador interno de `title` (nome + marca + modelo). */
export const WARRANTY_TITLE_JOIN_SEP = ' ';

// 2. Função auxiliar dinâmica para descobrir qual chave usar baseada no usuário atual
function getActiveStorageKey(): string {
  try {
    const savedUser = localStorage.getItem("@garantias:user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'visitor') {
        return STORAGE_KEY_VISITOR;
      }
    }
  } catch {
    // Se der erro no parse, por segurança mantém a chave padrão
  }
  return STORAGE_KEY_EMPLOYEE;
}

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

function persistWarranties(list: Warranty[]): boolean {
  try {
    // Usa a chave dinâmica definida pelo tipo de sessão ativo
    localStorage.setItem(getActiveStorageKey(), JSON.stringify(list));
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
    // Busca da chave dinâmica (Employee ou Visitor)
    const raw = localStorage.getItem(getActiveStorageKey());
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