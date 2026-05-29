import {
  buildWarrantyTitle,
  type Warranty,
  type WarrantyAttachment,
} from "../services/warrantyService";
import type { ApiGarantia } from "../services/garantiaService";
import type { ApiProduct } from "../services/productService";
import {
  computeExpirationDateBR,
  formatDateBRFromIso,
  parseWarrantyDate,
} from "./warrantyDates";
import { formatCnpj } from "./cnpj";
import { getWarrantyStatus, mapApiStatusToUi } from "./warrantyStatus";

const META_MARKER = "---meta---";

export interface CreateWarrantyFormData {
  productName: string;
  brand: string;
  model: string;
  purchaseDate: string;
  warrantyPeriod: number;
  warrantyUnit: "days" | "months";
  hasExtendedWarranty: boolean;
  extendedExtraMonths: number;
  extendedWarrantyNumber?: string;
  storeName?: string;
  cnpj?: string;
  nfNumber?: string;
  quantity?: string;
  value?: string;
  notes?: string;
  attachments?: WarrantyAttachment[];
}

interface WarrantyMeta {
  /** Texto livre do campo Observações do formulário */
  notes?: string;
  storeName?: string;
  storeCnpj?: string;
  nfNumber?: string;
  quantity?: string;
  value?: string;
  extendedWarrantyNumber?: string;
  extendedExtraMonths?: number;
}

function buildMetaObject(form: CreateWarrantyFormData): WarrantyMeta {
  return {
    notes: form.notes?.trim() || undefined,
    storeName: form.storeName?.trim() || undefined,
    storeCnpj: form.cnpj?.trim() ? formatCnpj(form.cnpj) : undefined,
    nfNumber: form.nfNumber?.trim() || undefined,
    quantity: form.quantity?.trim() || undefined,
    value: form.value?.trim() || undefined,
    ...(form.hasExtendedWarranty
      ? {
          extendedWarrantyNumber:
            form.extendedWarrantyNumber?.trim() || undefined,
          extendedExtraMonths:
            form.extendedExtraMonths > 0
              ? form.extendedExtraMonths
              : undefined,
        }
      : {}),
  };
}

function metaToJson(meta: WarrantyMeta): string {
  const cleaned = Object.fromEntries(
    Object.entries(meta).filter(
      ([, v]) => v !== undefined && String(v).trim() !== ""
    )
  );
  return JSON.stringify(cleaned);
}

export function computePrazoDias(form: CreateWarrantyFormData): number {
  const expiration = computeExpirationDateBR(
    form.purchaseDate,
    form.warrantyPeriod,
    form.warrantyUnit,
    form.hasExtendedWarranty ? form.extendedExtraMonths : 0
  );
  const start = parseWarrantyDate(form.purchaseDate);
  const end = parseWarrantyDate(expiration);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

export function buildObservacao(form: CreateWarrantyFormData): string {
  const meta = buildMetaObject(form);
  const json = metaToJson(meta);
  if (json === "{}") return "";

  const userNotes = meta.notes ?? "";
  const metaBlock = `${META_MARKER}\n${json}`;

  // Texto legível no banco + JSON com todos os campos (incl. notes)
  if (userNotes) {
    return `${userNotes}\n\n${metaBlock}`;
  }
  return metaBlock;
}

function parseObservacao(observacao?: string | null): {
  notes: string;
  meta: WarrantyMeta;
} {
  if (!observacao?.trim()) {
    return { notes: "", meta: {} };
  }

  const idx = observacao.indexOf(META_MARKER);
  if (idx === -1) {
    return { notes: observacao.trim(), meta: {} };
  }

  const notes = observacao.slice(0, idx).trim();
  const jsonPart = observacao.slice(idx + META_MARKER.length).trim();

  try {
    const meta = JSON.parse(jsonPart) as WarrantyMeta;
    return {
      notes: meta.notes?.trim() || notes,
      meta,
    };
  } catch {
    return { notes: observacao.trim(), meta: {} };
  }
}

export function parseCurrencyToNumber(value?: string): number {
  if (!value?.trim()) return 0;
  return Number(value.replace(/\D/g, "")) / 100;
}

export function apiGarantiaToWarranty(
  garantia: ApiGarantia,
  attachments?: WarrantyAttachment[]
): Warranty {
  const produto: ApiProduct | undefined = garantia.produto;
  const nome = produto?.nome ?? "Produto";
  const title = buildWarrantyTitle(
    nome,
    produto?.marca,
    produto?.modelo
  );

  const { notes, meta } = parseObservacao(garantia.observacao);

  const purchaseDate = formatDateBRFromIso(
    garantia.data_inicio?.slice(0, 10) ?? ""
  );
  const expirationDate = formatDateBRFromIso(
    garantia.data_fim?.slice(0, 10) ?? ""
  );

  const warrantyType =
    garantia.tipo === "Estendida"
      ? "Garantia Estendida"
      : "Garantia de fábrica";

  const daysToExpire =
    typeof garantia.dias_restantes === "number"
      ? garantia.dias_restantes
      : undefined;

  const statusInfo = getWarrantyStatus({
    expirationDate: expirationDate || undefined,
    status: garantia.status,
    daysToExpire,
  });

  return {
    id: String(garantia.id),
    title,
    story: meta.storeName,
    storeCnpj: meta.storeCnpj,
    nfNumber: meta.nfNumber,
    quantity: meta.quantity,
    purchaseDate: purchaseDate || undefined,
    expirationDate: expirationDate || undefined,
    warrantyType,
    value: meta.value,
    notes: notes || undefined,
    attachments,
    status: mapApiStatusToUi(garantia.status) ?? statusInfo.status,
    daysToExpire: statusInfo.daysToExpire,
    deletedAt: garantia.deletado_em
      ? new Date(garantia.deletado_em).toISOString()
      : undefined,
  };
}
