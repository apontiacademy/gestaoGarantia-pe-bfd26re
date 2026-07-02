import type { Warranty } from "../services/warrantyService";
import { getWarrantyStatus } from "./warrantyStatus";

export const EXPIRATION_ALERT_DAYS = 30;

export interface ExpiringWarranty extends Warranty {
  daysToExpire: number;
}

export function getExpiringWarranties(
  warranties: Warranty[]
): ExpiringWarranty[] {
  return warranties
    .map((warranty) => {
      const { status, daysToExpire } = getWarrantyStatus(warranty);

      if (
        status !== "A vencer" ||
        daysToExpire === null ||
        daysToExpire > EXPIRATION_ALERT_DAYS
      ) {
        return null;
      }

      return { ...warranty, daysToExpire };
    })
    .filter((warranty): warranty is ExpiringWarranty => warranty !== null)
    .sort((a, b) => a.daysToExpire - b.daysToExpire);
}
