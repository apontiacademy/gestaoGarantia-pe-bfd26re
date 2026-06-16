import {
  buildWarrantyTitle,
  normalizeAttachment,
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
import { formatCnpj, onlyCnpjDigits } from "./cnpj";
import { formatCurrencyBRL, parseDecimalValue } from "./currency";
import type { ApiDocumentoFiscal } from "../services/documentoFiscalService";
import type { CreateDocumentoFiscalPayload } from "../services/documentoFiscalService";
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
  /** Legado — migrado para documento_fiscal */
  storeCnpj?: string;
  /** Legado — migrado para documento_fiscal */
  nfNumber?: string;
  /** Legado — migrado para documento_fiscal */
  quantity?: string;
  /** Legado — migrado para documento_fiscal */
  value?: string;
  /** Legado — migrado para documento_fiscal */
  unitValue?: string;
  /** Legado — migrado para documento_fiscal */
  totalValue?: string;
  /** Data de vencimento em DD/MM/AAAA (redundância para exibição) */
  expirationDate?: string;
  extendedWarrantyNumber?: string;
  extendedExtraMonths?: number;
  attachments?: StoredAttachmentMeta[];
}

interface StoredAttachmentMeta {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  publicId?: string;
  resourceType?: "image" | "raw";
  deleteToken?: string;
}

function attachmentsFromMeta(
  meta: WarrantyMeta
): WarrantyAttachment[] | undefined {
  if (!meta.attachments?.length) return undefined;
  return meta.attachments.map((file) =>
    normalizeAttachment({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      url: file.url,
      publicId: file.publicId,
      resourceType: file.resourceType,
      deleteToken: file.deleteToken,
    })
  );
}

function fileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split("/").pop() ?? "";
    return decodeURIComponent(base) || "Nota fiscal";
  } catch {
    return "Nota fiscal";
  }
}

function mimeFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes(".pdf")) return "application/pdf";
  if (lower.includes(".png")) return "image/png";
  if (lower.includes(".webp")) return "image/webp";
  if (lower.includes(".jpg") || lower.includes(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

const CHAVE_ACESSO_MAX_LENGTH = 44;

/** `chave_acesso` no back aceita no máximo 44 chars (chave NF-e). URLs de anexo não cabem. */
function resolveDocumentoFiscalChaveAcesso(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length > CHAVE_ACESSO_MAX_LENGTH) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return undefined;
  return trimmed;
}

function attachmentsFromChaveAcesso(
  doc?: ApiDocumentoFiscal
): WarrantyAttachment[] | undefined {
  const url = doc?.chave_acesso?.trim();
  if (!url || !/^https?:\/\//i.test(url)) return undefined;

  return [
    normalizeAttachment({
      id: `doc-fiscal-${doc!.id}`,
      name: fileNameFromUrl(url),
      mimeType: mimeFromUrl(url),
      size: 0,
      url,
    }),
  ];
}

function resolveWarrantyAttachments(
  meta: WarrantyMeta,
  passed?: WarrantyAttachment[],
  fromDocumento?: WarrantyAttachment[]
): WarrantyAttachment[] | undefined {
  if (fromDocumento?.length) return fromDocumento;
  const fromMeta = attachmentsFromMeta(meta);
  if (fromMeta?.length) return fromMeta;
  if (passed?.length) {
    return passed.map((file) => normalizeAttachment(file));
  }
  return undefined;
}

export function buildDocumentoFiscalPayload(
  produtoId: number,
  input: {
    cnpj?: string;
    nfNumber?: string;
    quantity?: string;
    value?: string;
    purchaseDate: string;
    storeName?: string;
    /** Chave NF-e (44 dígitos). URL de anexo não é enviada — coluna VARCHAR(44). */
    chaveAcesso?: string;
    attachmentUrl?: string;
  }
): CreateDocumentoFiscalPayload {
  const cnpjDigits = onlyCnpjDigits(input.cnpj ?? "");
  const qty = Math.max(1, Number(input.quantity) || 1);
  const unitNum = parseCurrencyToNumber(input.value);
  const dataCompra = warrantyDateToIso(input.purchaseDate) || input.purchaseDate;
  const storeName = input.storeName?.trim();
  const chaveAcesso =
    resolveDocumentoFiscalChaveAcesso(input.chaveAcesso) ??
    resolveDocumentoFiscalChaveAcesso(input.attachmentUrl);

  return {
    produto_id: produtoId,
    cnpj_emissor: cnpjDigits.length === 14 ? cnpjDigits : "00000000000000",
    valor: unitNum > 0 ? unitNum : 0.01,
    quantidade: qty,
    valorInformado: true,
    data_compra: dataCompra,
    numero_nf: input.nfNumber?.trim() || "S/N",
    serie_nota: storeName || undefined,
    chave_acesso: chaveAcesso,
    tipo: "Nota Fiscal",
  };
}

export function buildDocumentoFiscalPayloadFromWarranty(
  produtoId: number,
  warranty: Pick<
    Warranty,
    | "storeCnpj"
    | "nfNumber"
    | "quantity"
    | "unitValue"
    | "totalValue"
    | "value"
    | "purchaseDate"
    | "story"
    | "attachments"
  >
): CreateDocumentoFiscalPayload {
  const unitSource = warranty.unitValue ?? warranty.value;
  return buildDocumentoFiscalPayload(produtoId, {
    cnpj: warranty.storeCnpj,
    nfNumber: warranty.nfNumber,
    quantity: warranty.quantity,
    value: unitSource,
    purchaseDate: warranty.purchaseDate ?? "",
    storeName: warranty.story,
    attachmentUrl: warranty.attachments?.[0]?.url,
  });
}

function documentoFiscalToWarrantyFields(
  doc: ApiDocumentoFiscal
): Pick<
  Warranty,
  | "storeCnpj"
  | "nfNumber"
  | "quantity"
  | "value"
  | "unitValue"
  | "totalValue"
  | "purchaseDate"
  | "story"
> {
  const unitNum = parseDecimalValue(doc.valor_unitario);
  const totalNum = parseDecimalValue(doc.valor);
  const qty = doc.quantidade ?? 1;

  const unitValue =
    Number.isFinite(unitNum) && unitNum > 0
      ? formatCurrencyBRL(unitNum)
      : undefined;
  const totalValue =
    Number.isFinite(totalNum) && totalNum > 0
      ? formatCurrencyBRL(totalNum)
      : undefined;

  return {
    storeCnpj: doc.cnpj_emissor ? formatCnpj(doc.cnpj_emissor) : undefined,
    nfNumber: doc.numero_nf || undefined,
    quantity: String(qty),
    purchaseDate: formatDateBRFromIso(doc.data_compra) || undefined,
    story: doc.serie_nota?.trim() || undefined,
    unitValue,
    totalValue,
    value: totalValue ?? unitValue,
  };
}

export function warrantyDateToIso(date?: string): string {
  if (!date?.trim()) return "";
  const trimmed = date.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const d = parseWarrantyDate(trimmed);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computePrazoDiasFromDates(
  purchaseDate?: string,
  expirationDate?: string,
  fallbackDays?: number
): number {
  if (purchaseDate?.trim() && expirationDate?.trim()) {
    const start = parseWarrantyDate(purchaseDate);
    const end = parseWarrantyDate(expirationDate);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      const diffMs = end.getTime() - start.getTime();
      return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    }
  }
  if (typeof fallbackDays === "number" && fallbackDays > 0) {
    return fallbackDays;
  }
  return 1;
}

export function buildObservacaoFromWarranty(
  warranty: Pick<Warranty, "notes">
): string {
  return warranty.notes?.trim() ?? "";
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
  return form.notes?.trim() ?? "";
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

/** Mescla metadados de anexo (publicId, deleteToken) do cache local quando a URL coincide. */
export function mergeAttachmentMetadataFromLocal(
  warranty: Warranty,
  local?: Warranty
): Warranty {
  if (!local?.attachments?.length || !warranty.attachments?.length) {
    return warranty;
  }

  const localByUrl = new Map(
    local.attachments
      .filter((file) => file.url)
      .map((file) => [file.url!, file] as const)
  );

  const attachments = warranty.attachments.map((file) => {
    const cached = file.url ? localByUrl.get(file.url) : undefined;
    if (!cached) return file;
    return normalizeAttachment({
      ...file,
      publicId: file.publicId ?? cached.publicId,
      resourceType: file.resourceType ?? cached.resourceType,
      deleteToken: file.deleteToken ?? cached.deleteToken,
      name: file.name || cached.name,
      mimeType: file.mimeType || cached.mimeType,
      size: file.size || cached.size,
    });
  });

  return { ...warranty, attachments };
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
  const doc = produto?.documento_fiscal ?? undefined;
  const fiscalFromDoc = doc ? documentoFiscalToWarrantyFields(doc) : {};
  const fiscalFromMeta = {
    storeCnpj: meta.storeCnpj,
    nfNumber: meta.nfNumber,
    quantity: meta.quantity,
    story: meta.storeName,
    ...resolveValuesFromMeta(meta),
  };
  const attachmentsFromDoc = attachmentsFromChaveAcesso(doc);

  const purchaseDate =
    fiscalFromDoc.purchaseDate ||
    formatDateBRFromIso(
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
    story: fiscalFromDoc.story ?? fiscalFromMeta.story,
    storeCnpj: fiscalFromDoc.storeCnpj ?? fiscalFromMeta.storeCnpj,
    nfNumber: fiscalFromDoc.nfNumber ?? fiscalFromMeta.nfNumber,
    quantity: fiscalFromDoc.quantity ?? fiscalFromMeta.quantity,
    purchaseDate: purchaseDate || undefined,
    expirationDate: expirationDate || undefined,
    warrantyPeriodDays:
      typeof garantia.prazo_dias === "number" ? garantia.prazo_dias : undefined,
    warrantyType,
    value: fiscalFromDoc.value ?? fiscalFromMeta.value,
    unitValue: fiscalFromDoc.unitValue ?? fiscalFromMeta.unitValue,
    totalValue: fiscalFromDoc.totalValue ?? fiscalFromMeta.totalValue,
    notes: notes || undefined,
    attachments: resolveWarrantyAttachments(
      meta,
      attachments,
      attachmentsFromDoc
    ),
    status: mapApiStatusToUi(garantia.status) ?? statusInfo.status,
    daysToExpire: statusInfo.daysToExpire,
    deletedAt: garantia.deletado_em
      ? new Date(garantia.deletado_em).toISOString()
      : undefined,
  };
}
