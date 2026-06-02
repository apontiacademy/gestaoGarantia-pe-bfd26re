import {
  buildWarrantyTitle,
  type Warranty,
  type WarrantyAttachment,
} from "../services/warrantyService";
import type { ApiGarantia } from "../services/garantiaService";
import type { ApiProduct } from "../services/productService";
import {
  computeExpirationDateBR,
  formatDateBR,
  formatDateBRFromIso,
  parseWarrantyDate,
} from "./warrantyDates";
import { formatCnpj } from "./cnpj";
import { formatCurrencyBRL } from "./currency";
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
  notes?: string;
  storeName?: string;
  storeCnpj?: string;
  nfNumber?: string;
  quantity?: string;
  value?: string;
  unitValue?: string;
  totalValue?: string;
  /** Data de vencimento em DD/MM/AAAA (redundância para exibição) */
  expirationDate?: string;
  extendedWarrantyNumber?: string;
  extendedExtraMonths?: number;
}

function buildPurchaseValuesMeta(
  form: CreateWarrantyFormData
): Pick<WarrantyMeta, "value" | "unitValue" | "totalValue" | "expirationDate"> {
  /** `form.value` é o preço unitário informado no cadastro */
  const unitNum = parseCurrencyToNumber(form.value);
  const expirationDate = computeExpirationDateBR(
    form.purchaseDate,
    form.warrantyPeriod,
    form.warrantyUnit,
    form.hasExtendedWarranty ? form.extendedExtraMonths : 0
  );

  const expirationPart = expirationDate
    ? { expirationDate }
    : {};

  if (unitNum <= 0) return expirationPart;

  const qty = Math.max(1, Number(form.quantity) || 1);
  const purchaseTotal = unitNum * qty;

  return {
    ...expirationPart,
    value: formatCurrencyBRL(purchaseTotal),
    unitValue: form.value?.trim() || formatCurrencyBRL(unitNum),
    totalValue: formatCurrencyBRL(purchaseTotal),
  };
}

function buildMetaObject(form: CreateWarrantyFormData): WarrantyMeta {
  return {
    notes: form.notes?.trim() || undefined,
    storeName: form.storeName?.trim() || undefined,
    storeCnpj: form.cnpj?.trim() ? formatCnpj(form.cnpj) : undefined,
    nfNumber: form.nfNumber?.trim() || undefined,
    quantity: form.quantity?.trim() || undefined,
    ...buildPurchaseValuesMeta(form),
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

function resolveExpirationDate(
  garantia: ApiGarantia,
  meta: WarrantyMeta
): string | undefined {
  const fromApi = formatDateBRFromIso(
    garantia.data_fim?.slice(0, 10) ?? String(garantia.data_fim ?? "")
  );
  if (fromApi) return fromApi;

  const fromMeta = meta.expirationDate?.trim();
  if (fromMeta) return fromMeta;

  const inicio =
    garantia.data_inicio?.slice(0, 10) ?? String(garantia.data_inicio ?? "");
  const prazo = garantia.prazo_dias;
  if (!inicio || typeof prazo !== "number" || prazo <= 0) return undefined;

  const start = parseWarrantyDate(formatDateBRFromIso(inicio) || inicio);
  if (Number.isNaN(start.getTime())) return undefined;

  const end = new Date(start);
  end.setDate(end.getDate() + prazo);
  return formatDateBR(end);
}

function resolveValuesFromMeta(meta: WarrantyMeta): Pick<
  Warranty,
  "unitValue" | "totalValue" | "value"
> {
  let unitValue = meta.unitValue?.trim() || undefined;
  const totalValue = meta.totalValue?.trim() || meta.value?.trim() || undefined;
  const qty = Math.max(1, Number(meta.quantity) || 1);

  if (!unitValue && totalValue) {
    const totalNum = parseCurrencyToNumber(totalValue);
    if (totalNum > 0) {
      unitValue = formatCurrencyBRL(totalNum / qty);
    }
  }

  if (!unitValue && !totalValue) {
    return {};
  }

  return {
    unitValue,
    totalValue,
    value: totalValue ?? unitValue,
  };
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
  const valueFields = resolveValuesFromMeta(meta);

  const purchaseDate = formatDateBRFromIso(
    garantia.data_inicio?.slice(0, 10) ?? String(garantia.data_inicio ?? "")
  );
  const expirationDate = resolveExpirationDate(garantia, meta);

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
    warrantyPeriodDays:
      typeof garantia.prazo_dias === "number" ? garantia.prazo_dias : undefined,
    warrantyType,
    ...valueFields,
    notes: notes || undefined,
    attachments,
    status: mapApiStatusToUi(garantia.status) ?? statusInfo.status,
    daysToExpire: statusInfo.daysToExpire,
    deletedAt: garantia.deletado_em
      ? new Date(garantia.deletado_em).toISOString()
      : undefined,
  };
}
