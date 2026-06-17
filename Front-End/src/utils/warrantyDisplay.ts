import type { Warranty } from "../services/warrantyService";
import { getWarrantyStatus, type WarrantyUiStatus } from "./warrantyStatus";

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
  const unitValue = warranty.unitValue;
  const totalValue = warranty.totalValue ?? warranty.value;

  return {
    quantity,
    unitValue,
    totalValue,
    showTotalValue: quantity > 1 && Boolean(totalValue),
  };
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
