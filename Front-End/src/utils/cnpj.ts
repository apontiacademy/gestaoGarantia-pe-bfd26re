/** Remove tudo que não for dígito. */
export function onlyCnpjDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 14);
}

/**
 * Formata CNPJ: 00.000.000/0000-00
 * Aceita string já formatada ou só dígitos.
 */
export function formatCnpj(value: string): string {
  const digits = onlyCnpjDigits(value);
  if (!digits) return "";

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}
