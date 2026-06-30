import type {
  ApiDocumentoFiscal,
  CreateDocumentoFiscalPayload,
  UpdateDocumentoFiscalPayload,
} from "./documentoFiscalService";
import { documentoFiscalService } from "./documentoFiscalService";
import type { ApiGarantia, ApiGarantiaEstendida } from "./garantiaService";
import { garantiaService } from "./garantiaService";
import {
  productService,
  type ApiProduct,
  type CreateProductPayload,
} from "./productService";
import {
  apiGarantiaToWarranty,
  applyExtendedWarrantyNumber,
  mergeAttachmentMetadataFromLocal,
  buildDocumentoFiscalPayload,
  buildDocumentoFiscalPayloadFromWarranty,
  buildObservacao,
  buildObservacaoFromWarranty,
  computePrazoDias,
  computePrazoDiasFromDates,
  parseCurrencyToNumber,
  warrantyDateToIso,
  type CreateWarrantyFormData,
} from "../utils/warrantyApiMapper";
import {
  type Warranty,
  type WarrantyUpdate,
} from "./warrantyService";

function toUpdateDocumentoFiscalPayload(
  payload: CreateDocumentoFiscalPayload
): UpdateDocumentoFiscalPayload {
  const { produto_id, ...updateBody } = payload;
  void produto_id;
  return updateBody;
}

let extendedWarrantyCache: ApiGarantiaEstendida[] | null = null;

async function loadExtendedWarranties(): Promise<ApiGarantiaEstendida[]> {
  if (extendedWarrantyCache) return extendedWarrantyCache;
  try {
    extendedWarrantyCache = await garantiaService.listExtended();
    return extendedWarrantyCache;
  } catch {
    return [];
  }
}

function invalidateExtendedWarrantyCache(): void {
  extendedWarrantyCache = null;
}

async function findExtendedWarrantyByGarantiaId(
  garantiaId: number
): Promise<ApiGarantiaEstendida | undefined> {
  const list = await loadExtendedWarranties();
  return list.find((item) => item.garantia_id === garantiaId);
}

async function enrichWarrantyWithExtendedData(
  warranty: Warranty
): Promise<Warranty> {
  if (!isApiWarrantyId(warranty.id)) return warranty;

  const extended = await findExtendedWarrantyByGarantiaId(Number(warranty.id));
  return applyExtendedWarrantyNumber(warranty, extended?.numero_apolice);
}

async function syncExtendedWarrantyRecord(
  garantiaId: number,
  warranty: Warranty
): Promise<void> {
  const isExtended =
    warranty.warrantyType === "Garantia Estendida" ||
    warranty.warrantyType?.toLowerCase().includes("estendida");
  const numero = warranty.extendedWarrantyNumber?.trim();

  if (!isExtended || !numero) return;

  const existing = await findExtendedWarrantyByGarantiaId(garantiaId);
  const seguradora = warranty.story?.trim() || "Não informada";
  const valor = parseCurrencyToNumber(warranty.unitValue ?? warranty.value);

  try {
    if (existing) {
      await garantiaService.updateExtended(garantiaId, {
        numero_apolice: numero,
        nome_seguradora: seguradora,
        valor,
      });
    } else {
      await garantiaService.createExtended({
        garantia_id: garantiaId,
        numero_apolice: numero,
        nome_seguradora: seguradora,
        valor,
      });
    }
    invalidateExtendedWarrantyCache();
  } catch {
    // Dados da estendida permanecem em observacao como fallback.
  }
}

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

  const documentoPayload = buildDocumentoFiscalPayload(produtoId, {
    cnpj: form.cnpj,
    nfNumber: form.nfNumber,
    quantity: form.quantity,
    value: form.value,
    purchaseDate: form.purchaseDate,
    storeName: form.storeName,
    attachmentUrl: form.attachments?.[0]?.url,
  });

  let documentoFiscal = await documentoFiscalService.create(documentoPayload);

  const attachmentUrl = form.attachments?.[0]?.url;
  if (attachmentUrl && !documentoFiscal.urlCloudinary) {
    documentoFiscal = await documentoFiscalService.update(
      produtoId,
      toUpdateDocumentoFiscalPayload(documentoPayload)
    );
  }

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
        invalidateExtendedWarrantyCache();
      } catch {
        // Garantia principal já criada; dados da estendida permanecem em observacao
      }
    }
  }

  const produtoBase = garantia.produto ?? {
    id: produtoId,
    id_usuario: 0,
    nome,
    marca,
    modelo,
  };
  const garantiaComProduto = {
    ...garantia,
    produto: { ...produtoBase, documento_fiscal: documentoFiscal },
  };

  const mapped = apiGarantiaToWarranty(garantiaComProduto, form.attachments);
  return {
    ...applyExtendedWarrantyNumber(mapped, form.extendedWarrantyNumber),
    extendedWarrantyNumber:
      form.extendedWarrantyNumber?.trim() || mapped.extendedWarrantyNumber,
  };
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

async function syncDocumentoFiscalForProduto(
  produtoId: number,
  warranty: Warranty,
  existing?: ApiDocumentoFiscal | null
): Promise<ApiDocumentoFiscal> {
  const payload = buildDocumentoFiscalPayloadFromWarranty(produtoId, warranty);

  if (existing) {
    return documentoFiscalService.update(
      produtoId,
      toUpdateDocumentoFiscalPayload(payload)
    );
  }

  return documentoFiscalService.create(payload);
}

function attachDocumentoToProduto<T extends { produto?: ApiProduct | null }>(
  garantia: T,
  documento?: ApiDocumentoFiscal | null
): T {
  if (!documento || !garantia.produto) return garantia;
  return {
    ...garantia,
    produto: { ...garantia.produto, documento_fiscal: documento },
  };
}

function hasDocumentoFiscal(garantia: ApiGarantia): boolean {
  return Boolean(garantia.produto?.documento_fiscal);
}

async function enrichGarantiaWithDocumento(
  garantia: ApiGarantia
): Promise<ApiGarantia> {
  if (hasDocumentoFiscal(garantia)) return garantia;

  try {
    const detail = await garantiaService.getById(garantia.id);
    if (!detail.produto?.documento_fiscal) return garantia;

    return {
      ...garantia,
      produto: {
        ...(garantia.produto ?? detail.produto)!,
        documento_fiscal: detail.produto!.documento_fiscal,
      },
    };
  } catch {
    return garantia;
  }
}

async function enrichGarantiasWithDocumento(
  garantias: ApiGarantia[]
): Promise<ApiGarantia[]> {
  const needsEnrich = garantias.filter((g) => !hasDocumentoFiscal(g));
  if (needsEnrich.length === 0) return garantias;

  const enrichedById = new Map<number, ApiGarantia>();
  await Promise.all(
    needsEnrich.map(async (garantia) => {
      enrichedById.set(garantia.id, await enrichGarantiaWithDocumento(garantia));
    })
  );

  return garantias.map(
    (garantia) => enrichedById.get(garantia.id) ?? garantia
  );
}

export async function trashWarrantyViaApi(id: string): Promise<void> {
  if (!isApiWarrantyId(id)) return;
  await garantiaService.moveToTrash(Number(id));
}

export async function permanentlyDeleteWarrantyViaApi(id: string): Promise<void> {
  if (!isApiWarrantyId(id)) return;
  await garantiaService.permanentDelete(Number(id));
}

export async function restoreWarrantyViaApi(id: string): Promise<void> {
  if (!isApiWarrantyId(id)) return;
  await garantiaService.restore(Number(id));
}

export async function updateWarrantyViaApi(
  id: string,
  updates: WarrantyUpdate,
  current: Warranty
): Promise<Warranty> {
  if (!isApiWarrantyId(id)) {
    throw new Error(
      "Esta garantia foi criada apenas localmente e não pode ser sincronizada com o servidor."
    );
  }

  const garantiaId = Number(id);
  const garantia = await garantiaService.getById(garantiaId);
  const produto = garantia.produto;

  if (!produto) {
    throw new Error("Produto da garantia não encontrado no servidor.");
  }

  const { deletedAt, ...scalarUpdates } = updates;
  void deletedAt;
  const merged: Warranty = { ...current, ...scalarUpdates };
  const dataInicio = warrantyDateToIso(merged.purchaseDate);
  if (!dataInicio) {
    throw new Error("Data de compra inválida.");
  }

  const prazoDias = computePrazoDiasFromDates(
    merged.purchaseDate,
    merged.expirationDate,
    merged.warrantyPeriodDays ?? garantia.prazo_dias
  );

  const tipo =
    merged.warrantyType === "Garantia Estendida" ? "Estendida" : "Normal";

  const observacao = buildObservacaoFromWarranty(merged);

  const newProductName = merged.productName?.trim() || merged.title.trim();
  const newBrand = merged.brand?.trim() || produto.marca?.trim() || "—";
  const newModel = merged.model?.trim() || produto.modelo?.trim() || "—";

  let produtoAtualizado = produto;
  const productChanged =
    newProductName !== (produto.nome ?? "") ||
    newBrand !== (produto.marca?.trim() ?? "") ||
    newModel !== (produto.modelo?.trim() ?? "");

  if (newProductName && productChanged) {
    await productService.update(produto.id, {
      nome: newProductName,
      marca: newBrand,
      modelo: newModel,
    });
    produtoAtualizado = {
      ...produto,
      nome: newProductName,
      marca: newBrand,
      modelo: newModel,
    };
  }

  await garantiaService.update(garantiaId, {
    produto_id: garantia.produto_id,
    prazo_dias: prazoDias,
    data_inicio: dataInicio,
    tipo,
    observacao,
  });

  await syncExtendedWarrantyRecord(garantiaId, merged);

  const enrichedGarantia = await garantiaService.getById(garantiaId);
  const produtoAfterGarantia = enrichedGarantia.produto ?? produtoAtualizado;
  const existingDoc = produtoAfterGarantia.documento_fiscal ?? null;

  const documentoFiscal = await syncDocumentoFiscalForProduto(
    produto.id,
    merged,
    existingDoc
  );

  const refreshed = await garantiaService.getById(garantiaId);
  const produtoComDocumento = attachDocumentoToProduto(
    { ...refreshed, produto: refreshed.produto ?? produtoAtualizado },
    documentoFiscal ?? refreshed.produto?.documento_fiscal ?? existingDoc
  );

  return enrichWarrantyWithExtendedData(
    apiGarantiaToWarranty(produtoComDocumento, merged.attachments)
  );
}

export async function fetchWarrantyByIdFromApi(
  id: string,
  local?: Warranty
): Promise<Warranty | null> {
  if (!isApiWarrantyId(id)) return null;

  const garantia = await garantiaService.getById(Number(id));
  const userId = getLoggedUserId();

  if (userId != null && garantia.produto?.id_usuario !== userId) {
    return null;
  }

  const mapped = apiGarantiaToWarranty(garantia);
  const enriched = await enrichWarrantyWithExtendedData(mapped);
  if (!local) return enriched;

  return mergeAttachmentMetadataFromLocal(
    {
      ...enriched,
      attachments: enriched.attachments?.length
        ? enriched.attachments
        : local.attachments,
    },
    local
  );
}

export async function fetchTrashedWarrantiesFromApi(): Promise<Warranty[]> {
  const garantias = await garantiaService.listTrashed();
  const userId = getLoggedUserId();

  const filtered =
    userId != null
      ? garantias.filter((g) => g.produto?.id_usuario === userId)
      : garantias;

  return filtered.map((g) => apiGarantiaToWarranty(g));
}

export async function fetchWarrantiesFromApi(): Promise<Warranty[]> {
  const garantias = await garantiaService.list();
  const userId = getLoggedUserId();

  const filtered =
    userId != null
      ? garantias.filter((g) => g.produto?.id_usuario === userId)
      : garantias;

  const enriched = await enrichGarantiasWithDocumento(filtered);

  return enriched.map((g) => apiGarantiaToWarranty(g));
}
