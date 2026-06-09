import { api } from "./api";

export interface ApiDocumentoFiscal {
  id: number;
  produto_id: number;
  cnpj_emissor: string;
  valor: number | string;
  valor_unitario: number | string;
  quantidade: number;
  data_compra: string;
  numero_nf: string;
  serie_nota?: string | null;
  chave_acesso?: string | null;
  tipo: string;
}

export interface CreateDocumentoFiscalPayload {
  produto_id: number;
  cnpj_emissor: string;
  valor: number;
  quantidade: number;
  valorInformado: boolean;
  data_compra: string;
  numero_nf: string;
  serie_nota?: string;
  chave_acesso?: string;
  tipo: string;
}

export const documentoFiscalService = {
  create: (data: CreateDocumentoFiscalPayload) =>
    api.post<ApiDocumentoFiscal>("/documento-fiscal", data),
};
