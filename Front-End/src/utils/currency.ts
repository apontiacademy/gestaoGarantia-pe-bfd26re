export function formatCurrencyBRL(amount: number): string {
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function parseDecimalValue(value: number | string | null | undefined): number {
  if (value == null || value === "") return NaN;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}
