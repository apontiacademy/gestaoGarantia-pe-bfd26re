import type { Warranty } from "../services/warrantyService";
import { formatCurrencyBRL, parseCurrencyInput } from "./currency";
import { getWarrantyStatus, type WarrantyUiStatus } from "./warrantyStatus";

/** Número NF gravado no back quando o usuário não informou. */
export const PLACEHOLDER_NF_NUMBER = "S/N";

/** Valor unitário legado gravado quando o usuário não informou o preço. */
export const PLACEHOLDER_FISCAL_UNIT_AMOUNT = 0.01;

export function isInformedNfNumber(
  nfNumber?: string | null
): nfNumber is string {
  const trimmed = nfNumber?.trim();
  if (!trimmed) return false;
  return trimmed.toUpperCase() !== PLACEHOLDER_NF_NUMBER;
}

export function normalizeNfNumberForWarranty(
  nfNumber?: string | null
): string | undefined {
  return isInformedNfNumber(nfNumber) ? nfNumber.trim() : undefined;
}

export function isPlaceholderFiscalUnitAmount(amount: number): boolean {
  return (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    Math.abs(amount - PLACEHOLDER_FISCAL_UNIT_AMOUNT) < 0.001
  );
}

export function resolveWarrantyQuantity(
  warranty: Pick<Warranty, "quantity">
): number {
  return Math.max(1, Number(warranty.quantity) || 1);
}

export interface WarrantyFiscalDisplay {
  quantity: number;
  unitValue?: string;
  totalValue?: string;
  showTotalValue: boolean;
}

/** Valores exibidos a partir dos campos mapeados do documento fiscal (back-end). */
export function resolveWarrantyFiscalDisplay(
  warranty: Pick<Warranty, "quantity" | "unitValue" | "totalValue" | "value">
): WarrantyFiscalDisplay {
  const quantity = resolveWarrantyQuantity(warranty);

  let unitValue: string | undefined;
  if (warranty.unitValue?.trim()) {
    const unitNum = parseCurrencyInput(warranty.unitValue);
    if (!isPlaceholderFiscalUnitAmount(unitNum)) {
      unitValue = warranty.unitValue;
    }
  }

  let totalValue: string | undefined;
  const totalCandidate = warranty.totalValue ?? warranty.value;
  if (totalCandidate?.trim()) {
    const totalNum = parseCurrencyInput(totalCandidate);
    const impliedUnit = quantity > 0 ? totalNum / quantity : totalNum;
    if (!isPlaceholderFiscalUnitAmount(impliedUnit) && totalNum > 0) {
      totalValue = totalCandidate;
    }
  }

  if (unitValue && !totalValue && quantity > 1) {
    const unitNum = parseCurrencyInput(unitValue);
    totalValue = formatCurrencyBRL(unitNum * quantity);
  }

  return {
    quantity,
    unitValue,
    totalValue,
    showTotalValue: quantity > 1 && Boolean(totalValue),
  };
}

export function hasInformedFiscalValue(
  warranty: Pick<Warranty, "quantity" | "unitValue" | "totalValue" | "value">
): boolean {
  const fiscal = resolveWarrantyFiscalDisplay(warranty);
  return Boolean(fiscal.unitValue || fiscal.totalValue);
}

export function formatDaysToExpireLabel(
  daysToExpire: number | null | undefined,
  status: WarrantyUiStatus
): string | null {
  if (status === "Vencida") return "Garantia vencida";
  if (typeof daysToExpire !== "number" || Number.isNaN(daysToExpire)) {
    return null;
  }
  if (daysToExpire === 1) return "1 dia para expirar";
  return `${daysToExpire} dias para expirar`;
}

export function getWarrantyExpirationInfo(
  warranty: Pick<Warranty, "expirationDate" | "status" | "daysToExpire">
) {
  return getWarrantyStatus(warranty);
}
