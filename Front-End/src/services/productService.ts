import { api } from "./api";

export interface ApiProduct {
  id: number;
  id_usuario: number;
  nome: string;
  marca: string;
  modelo: string;
  data_cadastro?: string;
}

export interface CreateProductPayload {
  nome: string;
  marca: string;
  modelo: string;
}

export const productService = {
  create: (data: CreateProductPayload) =>
    api.post<ApiProduct>("/produtos", data),

  list: () => api.get<ApiProduct[]>("/produtos"),
};
