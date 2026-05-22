export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return fallback;
  }

  const response = (error as { response?: { data?: { error?: unknown } } })
    .response;
  const message = response?.data?.error;
  return typeof message === "string" ? message : fallback;
}
