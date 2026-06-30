import { parseWarrantyDate } from "./warrantyDates";

/** Status exibido na UI (cards, filtros, detalhe). */
export type WarrantyUiStatus = "Ativo" | "A vencer" | "Vencida";

export interface WarrantyStatusInfo {
  status: WarrantyUiStatus;
  daysToExpire: number | null;
}

/** Valores retornados por `calcularStatusGarantia` no back-end. */
export type ApiWarrantyStatus = "Ativa" | "Próxima do vencimento" | "Vencida";

/**
 * Converte o status calculado no back para o rótulo da UI.
 * Back: Ativa | Próxima do vencimento | Vencida (regra: ≤ 30 dias = próxima).
 */
export function mapApiStatusToUi(
  apiStatus?: string | null
): WarrantyUiStatus | null {
  if (!apiStatus?.trim()) return null;
  const normalized = apiStatus.trim().toLowerCase();

  if (normalized === "vencida") return "Vencida";
  if (
    normalized.includes("próxima") ||
    normalized.includes("proxima") ||
    normalized.includes("vencer")
  ) {
    return "A vencer";
  }
  if (normalized === "ativa" || normalized === "ativo") return "Ativo";

  return null;
}

/** Fallback local quando não há status da API (ex.: cache antigo). */
export function calculateWarrantyStatusFromDate(
  expirationDate?: string
): WarrantyStatusInfo {
  if (!expirationDate) {
    return { status: "Ativo", daysToExpire: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiration = parseWarrantyDate(expirationDate);
  if (Number.isNaN(expiration.getTime())) {
    return { status: "Ativo", daysToExpire: null };
  }
  expiration.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return { status: "Vencida", daysToExpire: null };
  }

  if (diffDays <= 30) {
    return { status: "A vencer", daysToExpire: diffDays };
  }

  return { status: "Ativo", daysToExpire: diffDays };
}

export interface WarrantyStatusSource {
  expirationDate?: string;
  /** Status já normalizado para UI ou bruto do back */
  status?: string;
  daysToExpire?: number | null;
}

/**
 * Prioriza status do back (`status` + `dias_restantes` via mapper).
 * Se ausente, calcula pela data de vencimento (mesma janela de 30 dias do back).
 */
export function getWarrantyStatus(
  source: WarrantyStatusSource
): WarrantyStatusInfo {
  const fromApi = mapApiStatusToUi(source.status);
  if (fromApi) {
    const days = source.daysToExpire;
    return {
      status: fromApi,
      daysToExpire:
        fromApi === "Vencida"
          ? null
          : typeof days === "number" && !Number.isNaN(days)
            ? Math.max(0, days)
            : null,
    };
  }

  return calculateWarrantyStatusFromDate(source.expirationDate);
}

/** @deprecated Use getWarrantyStatus */
export function calculateWarrantyStatus(expirationDate?: string) {
  return calculateWarrantyStatusFromDate(expirationDate);
}
