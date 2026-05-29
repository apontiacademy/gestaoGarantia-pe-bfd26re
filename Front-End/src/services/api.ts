const BASE_URL = import.meta.env.VITE_API_URL;

// Busca o token sempre na hora da chamada (não no momento do import)
function getToken(): string | null {
  return localStorage.getItem("@garantias:token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      (typeof body === "object" && body !== null
        ? (body as Record<string, unknown>).error ??
          (body as Record<string, unknown>).erro ??
          (body as Record<string, unknown>).message
        : undefined) ?? `Erro ${response.status}`;
    throw new Error(String(message));
  }

  // 204 No Content não tem body
  if (response.status === 204) return null as T;
  return response.json();
}

// Funções prontas para cada verbo HTTP
export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};