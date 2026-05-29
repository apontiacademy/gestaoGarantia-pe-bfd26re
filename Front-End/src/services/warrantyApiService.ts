import { garantiaService } from "./garantiaService";
import {
  productService,
  type ApiProduct,
  type CreateProductPayload,
} from "./productService";
import {
  apiGarantiaToWarranty,
  buildObservacao,
  computePrazoDias,
  parseCurrencyToNumber,
  type CreateWarrantyFormData,
} from "../utils/warrantyApiMapper";
import type { Warranty } from "./warrantyService";

function isApiProduct(value: unknown): value is ApiProduct {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return typeof o.id === "number" && typeof o.nome === "string";
}

async function resolveProductId(payload: CreateProductPayload): Promise<number> {
  const response = await productService.create(payload);

  if (isApiProduct(response)) {
    return response.id;
  }

  const products = await productService.list();
  const matches = products
    .filter(
      (p) =>
        p.nome === payload.nome &&
        p.marca === payload.marca &&
        p.modelo === payload.modelo
    )
    .sort((a, b) => {
      const ta = new Date(a.data_cadastro ?? 0).getTime();
      const tb = new Date(b.data_cadastro ?? 0).getTime();
      return tb - ta;
    });

  if (matches.length === 0) {
    throw new Error(
      "Produto criado, mas não foi possível obter o identificador. Tente novamente."
    );
  }

  return matches[0].id;
}

export async function createWarrantyViaApi(
  form: CreateWarrantyFormData
): Promise<Warranty> {
  const nome = form.productName.trim();
  const marca = form.brand.trim();
  const modelo = form.model.trim();

  if (!nome || !marca || !modelo) {
    throw new Error("Nome, marca e modelo do produto são obrigatórios.");
  }

  const produtoId = await resolveProductId({ nome, marca, modelo });

  const garantia = await garantiaService.create({
    produto_id: produtoId,
    prazo_dias: computePrazoDias(form),
    data_inicio: form.purchaseDate,
    tipo: form.hasExtendedWarranty ? "Estendida" : "Normal",
    observacao: buildObservacao(form),
  });

  if (form.hasExtendedWarranty) {
    const numero = form.extendedWarrantyNumber?.trim();
    const seguradora = form.storeName?.trim() || "Não informada";

    if (numero) {
      try {
        await garantiaService.createExtended({
          garantia_id: garantia.id,
          numero_apolice: numero,
          nome_seguradora: seguradora,
          valor: parseCurrencyToNumber(form.value),
        });
      } catch {
        // Garantia principal já criada; dados da estendida permanecem em observacao
      }
    }
  }

  const garantiaComProduto = garantia.produto
    ? garantia
    : { ...garantia, produto: { id: produtoId, id_usuario: 0, nome, marca, modelo } };

  return apiGarantiaToWarranty(garantiaComProduto, form.attachments);
}

function getLoggedUserId(): number | null {
  try {
    const raw = localStorage.getItem("@garantias:user");
    if (!raw) return null;
    const user = JSON.parse(raw) as { id?: number };
    return typeof user.id === "number" ? user.id : null;
  } catch {
    return null;
  }
}

export function isApiWarrantyId(id: string): boolean {
  return /^\d+$/.test(id);
}

export async function trashWarrantyViaApi(id: string): Promise<void> {
  if (!isApiWarrantyId(id)) return;
  await garantiaService.moveToTrash(Number(id));
}

export async function restoreWarrantyViaApi(id: string): Promise<void> {
  if (!isApiWarrantyId(id)) return;
  await garantiaService.restore(Number(id));
}

export async function fetchWarrantiesFromApi(): Promise<Warranty[]> {
  const garantias = await garantiaService.list();
  const userId = getLoggedUserId();

  const filtered =
    userId != null
      ? garantias.filter((g) => g.produto?.id_usuario === userId)
      : garantias;

  return filtered.map((g) => apiGarantiaToWarranty(g));
}
