import {
  buildWarrantyTitle,
  saveWarranty,
  type Warranty,
} from "./warrantyService";
import {
  computePrazoDias,
  resolveMesesAdicionais,
  type CreateWarrantyFormData,
} from "../utils/warrantyApiMapper";
import { computeExpirationDateBR } from "../utils/warrantyDates";

export function createLocalWarrantyFromForm(
  form: CreateWarrantyFormData
): Warranty {
  const title = buildWarrantyTitle(form.productName, form.brand, form.model);
  const prazoDias = computePrazoDias(form);
  const expirationDate = computeExpirationDateBR(
    form.purchaseDate,
    form.warrantyPeriod,
    form.warrantyUnit,
    resolveMesesAdicionais(form)
  );

  return saveWarranty({
    title,
    productName: form.productName?.trim() || undefined,
    brand: form.brand?.trim() || undefined,
    model: form.model?.trim() || undefined,
    purchaseDate: form.purchaseDate,
    expirationDate,
    warrantyType: form.hasExtendedWarranty
      ? "Garantia Estendida"
      : "Garantia de Fábrica",
    warrantyPeriodDays: prazoDias,
    extendedWarrantyNumber: form.extendedWarrantyNumber,
    extendedExtraMonths: form.hasExtendedWarranty
      ? resolveMesesAdicionais(form)
      : undefined,
    storeCnpj: form.cnpj,
    nfNumber: form.nfNumber,
    quantity: form.quantity,
    value: form.value,
    notes: form.notes,
    story: form.storeName,
    attachments: form.attachments,
  });
}
