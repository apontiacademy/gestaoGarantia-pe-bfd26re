import { api } from "./api";
import type { ApiProduct } from "./productService";

export interface ApiGarantia {
  id: number;
  produto_id: number;
  prazo_dias: number;
  data_inicio: string;
  data_fim: string;
  tipo: string;
  observacao?: string | null;
  data_cadastro?: string;
  deletado_em?: string | null;
  produto?: ApiProduct;
  status?: string;
  dias_restantes?: number;
}

export interface CreateGarantiaPayload {
  produto_id: number;
  prazo_dias: number;
  data_inicio: string;
  tipo: "Normal" | "Estendida";
  observacao?: string;
}

export interface UpdateGarantiaPayload {
  produto_id: number;
  prazo_dias: number;
  data_inicio: string;
  tipo: "Normal" | "Estendida";
  observacao?: string;
}

export interface CreateGarantiaEstendidaPayload {
  garantia_id: number;
  numero_apolice: string;
  nome_seguradora: string;
  valor: number;
}

export interface UpdateGarantiaEstendidaPayload {
  numero_apolice: string;
  nome_seguradora?: string;
  valor?: number;
}

export interface ApiGarantiaEstendida {
  id: number;
  garantia_id: number;
  numero_apolice: string;
  nome_seguradora: string;
  valor: number | string;
}

export const garantiaService = {
  create: (data: CreateGarantiaPayload) =>
    api.post<ApiGarantia>("/garantias", data),

  list: () => api.get<ApiGarantia[]>("/garantias"),

  listTrashed: () => api.get<ApiGarantia[]>("/garantias/lixeira"),

  getById: (id: number) => api.get<ApiGarantia>(`/garantias/${id}`),

  update: (id: number, data: UpdateGarantiaPayload) =>
    api.put<ApiGarantia>(`/garantias/${id}`, data),

  /** Soft delete — envia para lixeira no servidor */
  moveToTrash: (id: number) =>
    api.delete<{ mensagem: string }>(`/garantias/${id}`),

  /** Hard delete — remove permanentemente do banco */
  permanentDelete: (id: number) =>
    api.delete<{ mensagem: string }>(`/garantias/${id}/permanente`),

  /** Restaura garantia da lixeira */
  restore: (id: number) =>
    api.patch<ApiGarantia>(`/garantias/${id}/restaurar`, {}),

  createExtended: (data: CreateGarantiaEstendidaPayload) =>
    api.post<ApiGarantiaEstendida>("/garantias-estendidas", data),

  listExtended: () =>
    api.get<ApiGarantiaEstendida[]>("/garantias-estendidas"),

  updateExtended: (garantiaId: number, data: UpdateGarantiaEstendidaPayload) =>
    api.put<ApiGarantiaEstendida>(`/garantias-estendidas/${garantiaId}`, data),
};
