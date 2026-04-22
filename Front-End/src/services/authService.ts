import { api } from "./api";

interface LoginPayload { email: string; senha: string; }
interface RegisterPayload { nome: string; email: string; senha: string; }
interface AuthResponse {
  token: string;
  user: { id: number; nome: string; email: string; role: "admin" | "user" };
}

export const authService = {
  login: (data: LoginPayload) => api.post<AuthResponse>("/auth/login", data),
  register: (data: RegisterPayload) => api.post<AuthResponse>("/auth/register", data),
};