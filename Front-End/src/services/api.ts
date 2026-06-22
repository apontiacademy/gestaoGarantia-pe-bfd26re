import {
  AUTH_TOKEN_KEY,
  isAuthTokenExpired,
} from "../utils/authToken";
import { emitSessionExpired } from "./authSession";

const BASE_URL = import.meta.env.VITE_API_URL;

const PUBLIC_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/verify-reset-code",
  "/auth/reset-password",
];

function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function isPublicAuthEndpoint(endpoint: string): boolean {
  return PUBLIC_AUTH_ENDPOINTS.some((path) => endpoint.startsWith(path));
}

function getResponseMessage(body: Record<string, unknown>): string {
  const message =
    body.error ?? body.erro ?? body.message ?? body.mensagem;
  return typeof message === "string" ? message : "";
}

function isSessionExpiredResponse(
  status: number,
  body: Record<string, unknown>
): boolean {
  if (status !== 401 && status !== 403) return false;

  const text = getResponseMessage(body).toLowerCase();
  return (
    text.includes("token expirado") ||
    text.includes("sessão expirada") ||
    text.includes("sessao expirada")
  );
}

function ensureValidToken(endpoint: string, token: string | null): void {
  if (!token || isPublicAuthEndpoint(endpoint)) return;

  if (isAuthTokenExpired(token)) {
    emitSessionExpired();
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  ensureValidToken(endpoint, token);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    if (
      token &&
      !isPublicAuthEndpoint(endpoint) &&
      isSessionExpiredResponse(response.status, body)
    ) {
      emitSessionExpired();
    }

    const message = getResponseMessage(body) || `Erro ${response.status}`;
    throw new Error(message);
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
