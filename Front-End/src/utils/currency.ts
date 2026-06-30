import type { ClipboardEvent, KeyboardEvent } from "react";

export function formatCurrencyBRL(amount: number): string {
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Formata dígitos crus (centavos) para exibição em R$. */
export function formatCurrencyFromDigits(digits: string): string {
  if (!digits) return "";
  return formatCurrencyBRL(Number(digits) / 100);
}

/** Converte string formatada (R$ 1.234,56) em reais. */
export function parseCurrencyInput(value: string): number {
  if (!value.trim()) return 0;
  return Number(value.replace(/\D/g, "")) / 100;
}

export function calculateTotalFromUnit(
  unitValue: string,
  quantity: string
): string {
  const unitPrice = parseCurrencyInput(unitValue);
  const qty = Number(quantity);

  if (!unitPrice || !qty || qty <= 0) {
    return formatCurrencyBRL(0);
  }

  return formatCurrencyBRL(unitPrice * qty);
}

const CURRENCY_INPUT_ALLOWED_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
]);

export function handleCurrencyInputKeyDown(
  event: KeyboardEvent<HTMLInputElement>
): void {
  if (CURRENCY_INPUT_ALLOWED_KEYS.has(event.key)) return;
  if (event.ctrlKey || event.metaKey) return;
  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
}

export function handleCurrencyInputPaste(
  event: ClipboardEvent<HTMLInputElement>,
  onValue: (formatted: string) => void
): void {
  event.preventDefault();
  const digits = event.clipboardData.getData("text").replace(/\D/g, "");
  onValue(formatCurrencyFromDigits(digits));
}

export function parseDecimalValue(value: number | string | null | undefined): number {
  if (value == null || value === "") return NaN;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}
