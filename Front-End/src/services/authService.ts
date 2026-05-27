import { api } from "./api";
import type { User } from "../types/user";

interface LoginPayload { email: string; senha: string; }
interface RegisterPayload { nomeCompleto: string; email: string; senha: string; }

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: (data: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", data),

  register: (data: RegisterPayload) =>
    api.post<RegisterPayload>("/auth/register", data),

  forgotPassword: (email: string) =>
    api.post<{
      message: string;
      resetToken?: string;
    }>("/auth/forgot-password", { email }),

  verifyResetCode: (token: string, codigo: string) =>
    api.post<{
      message: string;
      token: string;
    }>("/auth/verify-reset-code", { token, codigo }),

  resetPassword: (token: string, novaSenha: string) =>
    api.post<{
      message: string;
    }>("/auth/reset-password", { token, novaSenha }),
};
