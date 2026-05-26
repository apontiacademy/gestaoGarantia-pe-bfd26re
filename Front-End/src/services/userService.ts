import { api } from "./api";

interface UserProfile {
  id: number;
  nomeCompleto: string;
  email: string;
  fotoPerfil?: string;
}

interface UpdateProfilePayload {
  nomeCompleto: string;
  fotoPerfil?: string;
}

interface ChangePasswordPayload {
  senhaAtual: string;
  novaSenha: string;
}

export const userService = {
  getProfile: () =>
    api.get<UserProfile>("/users/me"),

  updateProfile: (data: UpdateProfilePayload) =>
    api.put<UserProfile>("/users/me", data),

  changePassword: (data: ChangePasswordPayload) =>
    api.post<{ message: string }>("/auth/change-password", data),
};