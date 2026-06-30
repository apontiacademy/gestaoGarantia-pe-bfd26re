export function parseWarrantyDate(dateString: string): Date {
  const trimmed = dateString.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const parts = trimmed.split("/");
  if (parts.length === 3) {
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    return new Date(year, month - 1, day);
  }
  return new Date(NaN);
}

export function formatDateBR(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Converte ISO ou `AAAA-MM-DD` para `DD/MM/AAAA` sem deslocar fuso horário. */
export function formatDateBRFromIso(iso: string): string {
  const trimmed = iso.trim();
  if (!trimmed) return "";

  const datePart = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (datePart) {
    const [, year, month, day] = datePart;
    return `${day}/${month}/${year}`;
  }

  const d = parseWarrantyDate(trimmed);
  if (Number.isNaN(d.getTime())) return "";
  return formatDateBR(d);
}

/* Calcula vencimento a partir da data de compra + período de fábrica + meses extras (garantia estendida). */
export function computeExpirationDateBR(
  purchaseIso: string,
  periodAmount: number,
  unit: "days" | "months",
  extraMonths: number
): string {
  const base = parseWarrantyDate(purchaseIso);
  if (Number.isNaN(base.getTime()) || periodAmount <= 0) return "";
  const d = new Date(base);
  if (unit === "months") {
    d.setMonth(d.getMonth() + periodAmount);
  } else {
    d.setDate(d.getDate() + periodAmount);
  }
  if (extraMonths > 0) {
    d.setMonth(d.getMonth() + extraMonths);
  }
  return formatDateBR(d);
}
