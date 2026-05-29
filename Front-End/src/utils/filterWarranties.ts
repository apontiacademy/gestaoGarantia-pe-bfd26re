import { type Warranty } from "../services/warrantyService";
import {
  getWarrantyStatus,
  type WarrantyUiStatus,
} from "./warrantyStatus";

export type StatusFilterOption = "all" | "active" | "expiring" | "expired";

function resolveUiStatus(warranty: Warranty): WarrantyUiStatus {
  if (warranty.status) return warranty.status;
  return getWarrantyStatus(warranty).status;
}

function matchesFilter(
  uiStatus: WarrantyUiStatus,
  filter: StatusFilterOption
): boolean {
  if (filter === "all") return true;
  if (filter === "active") return uiStatus === "Ativo";
  if (filter === "expiring") return uiStatus === "A vencer";
  if (filter === "expired") return uiStatus === "Vencida";
  return true;
}

export function countWarrantiesByStatus(
  warranties: Warranty[]
): Record<StatusFilterOption, number> {
  let active = 0;
  let expiring = 0;
  let expired = 0;

  for (const w of warranties) {
    const uiStatus = resolveUiStatus(w);
    if (uiStatus === "Vencida") expired++;
    else if (uiStatus === "A vencer") expiring++;
    else active++;
  }

  return {
    all: warranties.length,
    active,
    expiring,
    expired,
  };
}

export function applyStatusFilter(
  warranties: Warranty[],
  filter: StatusFilterOption
): Warranty[] {
  if (filter === "all") return warranties;
  return warranties.filter((w) => matchesFilter(resolveUiStatus(w), filter));
}
