import type { Warranty } from "../services/warrantyService";
import { formatCnpj } from "./cnpj";
import { formatCurrencyBRL, parseCurrencyInput } from "./currency";
import { parseWarrantyDate } from "./warrantyDates";
import { resolveWarrantyFiscalDisplay } from "./warrantyDisplay";

export interface WarrantyFormValues {
  title: string;
  story: string;
  storeCnpj: string;
  nfNumber: string;
  quantity: string;
  purchaseDate: string;
  expirationDate: string;
  warrantyType: string;
  extendedWarrantyNumber: string;
  value: string;
  notes: string;
}

export const WARRANTY_TYPE_OPTIONS = [
  "Garantia de fábrica",
  "Garantia Estendida",
] as const;

export function warrantyToFormValues(warranty: Warranty): WarrantyFormValues {
  const fiscal = resolveWarrantyFiscalDisplay(warranty);

  return {
    title: warranty.title ?? "",
    story: warranty.story ?? "",
    storeCnpj: warranty.storeCnpj ? formatCnpj(warranty.storeCnpj) : "",
    nfNumber: warranty.nfNumber ?? "",
    quantity: warranty.quantity ?? "",
    purchaseDate: warranty.purchaseDate ?? "",
    expirationDate: warranty.expirationDate ?? "",
    warrantyType: warranty.warrantyType ?? WARRANTY_TYPE_OPTIONS[0],
    extendedWarrantyNumber: warranty.extendedWarrantyNumber ?? "",
    value: fiscal.unitValue ?? fiscal.totalValue ?? "",
    notes: warranty.notes ?? "",
  };
}

function isValidDateBR(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  const d = parseWarrantyDate(trimmed);
  return !Number.isNaN(d.getTime());
}

export function validateWarrantyForm(
  values: WarrantyFormValues
): Partial<Record<keyof WarrantyFormValues, string>> {
  const errors: Partial<Record<keyof WarrantyFormValues, string>> = {};

  if (!values.title.trim()) {
    errors.title = "Informe o nome do produto.";
  }

  if (!values.purchaseDate.trim()) {
    errors.purchaseDate = "Informe a data de compra.";
  }

  if (!values.expirationDate.trim()) {
    errors.expirationDate = "Informe a data de vencimento.";
  }

  if (!isValidDateBR(values.purchaseDate)) {
    errors.purchaseDate = "Data de compra inválida. Use DD/MM/AAAA.";
  }

  if (!isValidDateBR(values.expirationDate)) {
    errors.expirationDate = "Data de vencimento inválida. Use DD/MM/AAAA.";
  }

  if (
    values.purchaseDate.trim() &&
    values.expirationDate.trim() &&
    isValidDateBR(values.purchaseDate) &&
    isValidDateBR(values.expirationDate)
  ) {
    const purchase = parseWarrantyDate(values.purchaseDate);
    const expiration = parseWarrantyDate(values.expirationDate);
    if (expiration.getTime() < purchase.getTime()) {
      errors.expirationDate =
        "O vencimento não pode ser anterior à data de compra.";
    }
  }

  return errors;
}

export function formValuesToWarrantyUpdate(
  values: WarrantyFormValues
): Omit<Warranty, "id" | "deletedAt"> {
  const trim = (s: string) => s.trim();
  const qty = Math.max(1, Number(trim(values.quantity)) || 1);
  const unitNum = parseCurrencyInput(trim(values.value));
  const unitValue =
    unitNum > 0 ? formatCurrencyBRL(unitNum) : undefined;
  const totalValue =
    unitNum > 0 ? formatCurrencyBRL(unitNum * qty) : undefined;
  const isExtended = trim(values.warrantyType).toLowerCase().includes("estendida");

  return {
    title: trim(values.title),
    story: trim(values.story) || undefined,
    storeCnpj: trim(values.storeCnpj)
      ? formatCnpj(trim(values.storeCnpj))
      : undefined,
    nfNumber: trim(values.nfNumber) || undefined,
    quantity: trim(values.quantity) || undefined,
    purchaseDate: trim(values.purchaseDate) || undefined,
    expirationDate: trim(values.expirationDate) || undefined,
    warrantyType: trim(values.warrantyType) || undefined,
    extendedWarrantyNumber: isExtended
      ? trim(values.extendedWarrantyNumber) || undefined
      : undefined,
    unitValue,
    totalValue,
    value: totalValue ?? unitValue,
    notes: trim(values.notes) || undefined,
  };
}
