import { type Warranty } from "../services/warrantyService";
import { parseWarrantyDate } from "./warrantyDates";

export type StatusFilterOption = "all" | "active" | "expiring" | "expired";

const SOON_THRESHOLD_DAYS = 30;

export function countWarrantiesByStatus(
  warranties: Warranty[]
): Record<StatusFilterOption, number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let active = 0;
  let expiring = 0;
  let expired = 0;

  for (const w of warranties) {
    if (!w.expirationDate) {
      active++;
      continue;
    }
    const exp = parseWarrantyDate(w.expirationDate);
    if (Number.isNaN(exp.getTime())) {
      active++;
      continue;
    }
    exp.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) expired++;
    else if (diffDays <= SOON_THRESHOLD_DAYS) expiring++;
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return warranties.filter((w) => {
    if (!w.expirationDate) return filter === "active";
    const exp = parseWarrantyDate(w.expirationDate);
    if (Number.isNaN(exp.getTime())) return filter === "active";
    exp.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (filter === "expired") return diffDays < 0;
    if (filter === "expiring")
      return diffDays >= 0 && diffDays <= SOON_THRESHOLD_DAYS;
    if (filter === "active") return diffDays > SOON_THRESHOLD_DAYS;
    return true;
  });
}
