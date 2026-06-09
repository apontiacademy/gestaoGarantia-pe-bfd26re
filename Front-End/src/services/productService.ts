import { api } from "./api";
import type { ApiDocumentoFiscal } from "./documentoFiscalService";

export interface ApiProduct {
  id: number;
  id_usuario: number;
  nome: string;
  marca: string;
  modelo: string;
  data_cadastro?: string;
  documento_fiscal?: ApiDocumentoFiscal | null;
}

export interface CreateProductPayload {
  nome: string;
  marca: string;
  modelo: string;
}

export interface UpdateProductPayload {
  nome: string;
  marca: string;
  modelo: string;
}

export const productService = {
  create: (data: CreateProductPayload) =>
    api.post<ApiProduct>("/produtos", data),

  list: () => api.get<ApiProduct[]>("/produtos"),

  update: (id: number, data: UpdateProductPayload) =>
    api.put<{ message: string }>(`/produtos/${id}`, data),
};
