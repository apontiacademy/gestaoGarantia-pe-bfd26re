/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { useNotifications } from "../hooks/useNotifications";
import {
  getWarranties,
  isWarrantyDeleted,
  persistWarranty,
  persistWarranties,
  setWarrantyStorageKey,
  updateWarranty as updateWarrantyInStorage,
  softDeleteWarranty,
  restoreWarranty,
  permanentlyDeleteWarranty,
  buildWarrantyTitle,
  type Warranty,
  type WarrantyUpdate,
} from "../services/warrantyService";
import {
  createWarrantyViaApi,
  fetchWarrantiesFromApi,
  fetchTrashedWarrantiesFromApi,
  permanentlyDeleteWarrantyViaApi,
  restoreWarrantyViaApi,
  trashWarrantyViaApi,
  updateWarrantyViaApi,
  isApiWarrantyId,
} from "../services/warrantyApiService";
import type { CreateWarrantyFormData } from "../utils/warrantyApiMapper";
import { computePrazoDias, mergeAttachmentMetadataFromLocal } from "../utils/warrantyApiMapper";
import { deleteWarrantyAttachmentsFromCloudinary } from "../utils/warrantyCloudinaryCleanup";
import { GARANTIAS_SESSION_EVENT, useAuth } from "./AuthContext";

interface WarrantyContextData {
  warranties: Warranty[];
  activeWarranties: Warranty[];
  trashedWarranties: Warranty[];
  addWarranty: (form: CreateWarrantyFormData) => Promise<Warranty>;
  updateWarranty: (
    id: string,
    updates: WarrantyUpdate
  ) => Promise<ReturnType<typeof updateWarrantyInStorage>>;
  moveToTrash: (
    id: string
  ) => Promise<ReturnType<typeof softDeleteWarranty>>;
  restoreFromTrash: (
    id: string
  ) => Promise<ReturnType<typeof restoreWarranty>>;
  permanentlyDelete: (id: string) => Promise<boolean>;
  refreshWarranties: () => void;
  loadWarrantiesFromApi: () => Promise<void>;
  isLoadingWarranties: boolean;
}

const WarrantyContext = createContext<WarrantyContextData>(
  {} as WarrantyContextData
);

function formToLocalWarranty(form: CreateWarrantyFormData): Warranty {
  const title = buildWarrantyTitle(form.productName, form.brand, form.model);
  const prazoDias = computePrazoDias(form);

  let expirationDate: string | undefined;
  if (form.purchaseDate && prazoDias > 0) {
    const [year, month, day] = form.purchaseDate.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    start.setDate(start.getDate() + prazoDias);
    const d = String(start.getDate()).padStart(2, '0');
    const m = String(start.getMonth() + 1).padStart(2, '0');
    expirationDate = `${d}/${m}/${start.getFullYear()}`;
  }

  return {
    id: crypto.randomUUID(),
    title,
    productName: form.productName?.trim() || undefined,
    brand: form.brand?.trim() || undefined,
    model: form.model?.trim() || undefined,
    purchaseDate: form.purchaseDate,
    expirationDate,
    warrantyType: form.hasExtendedWarranty ? 'Garantia Estendida' : 'Garantia de Fábrica',
    warrantyPeriodDays: prazoDias,
    extendedWarrantyNumber: form.extendedWarrantyNumber,
    storeCnpj: form.cnpj,
    nfNumber: form.nfNumber,
    quantity: form.quantity,
    value: form.value,
    notes: form.notes,
    story: form.storeName,
    attachments: form.attachments,
  };
}

export function WarrantyProvider({ children }: { children: ReactNode }) {
  const { refresh: refreshNotifications } = useNotifications();
  const { isAuthenticated, user } = useAuth();
  const [warranties, setWarranties] = useState<Warranty[]>(() => {
    return getWarranties() || [];
  });
  const [isLoadingWarranties, setIsLoadingWarranties] = useState(false);

  const refreshWarranties = useCallback(() => {
    setWarranties(getWarranties());
  }, []);

  const loadWarrantiesFromApi = useCallback(async () => {
    if (!isAuthenticated) {
      setWarranties(getWarranties() || []);
      return;
    }

    setIsLoadingWarranties(true);
    try {
      const [fromApi, trashedFromApi] = await Promise.all([
        fetchWarrantiesFromApi(),
        fetchTrashedWarrantiesFromApi().catch(() => [] as Warranty[]),
      ]);
      const local = getWarranties();
      const localById = new Map(local.map((w) => [w.id, w] as const));

      const activeFromApi = fromApi.map((w) => {
        const cached = localById.get(w.id);
        return mergeAttachmentMetadataFromLocal(
          {
            ...w,
            attachments: w.attachments?.length ? w.attachments : cached?.attachments,
          },
          cached
        );
      });

      const trashedFromApiMerged = trashedFromApi.map((w) => {
        const cached = localById.get(w.id);
        return mergeAttachmentMetadataFromLocal(
          {
            ...w,
            attachments: w.attachments?.length ? w.attachments : cached?.attachments,
          },
          cached
        );
      });

      const activeIds = new Set(activeFromApi.map((w) => w.id));
      const apiTrashedIds = new Set(trashedFromApiMerged.map((w) => w.id));

      const trashedLocal = local
        .filter(isWarrantyDeleted)
        .filter((w) => !activeIds.has(w.id) && !apiTrashedIds.has(w.id))
        .map((w) => ({
          ...w,
          attachments: w.attachments ?? localById.get(w.id)?.attachments,
        }));

      const merged = [...activeFromApi, ...trashedFromApiMerged, ...trashedLocal];
      persistWarranties(merged);
      setWarranties(merged);
    } catch {
      refreshWarranties();
    } finally {
      setIsLoadingWarranties(false);
    }
  }, [isAuthenticated, refreshWarranties]);

  // Troca a namespace de armazenamento quando o usuário faz login ou logout.
  // Deve rodar ANTES do effect de sincronização da API.
  useEffect(() => {
    const userId = user?.id != null ? String(user.id) : null;
    setWarrantyStorageKey(userId);
    setWarranties(getWarranties());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    void loadWarrantiesFromApi();

    const onSessionUpdated = () => {
      void loadWarrantiesFromApi();
    };
    window.addEventListener(GARANTIAS_SESSION_EVENT, onSessionUpdated);
    return () => {
      window.removeEventListener(GARANTIAS_SESSION_EVENT, onSessionUpdated);
    };
  }, [loadWarrantiesFromApi]);

  const activeWarranties = useMemo(
    () => warranties.filter((w) => !isWarrantyDeleted(w)),
    [warranties]
  );

  const trashedWarranties = useMemo(
    () => warranties.filter(isWarrantyDeleted),
    [warranties]
  );

  const addWarranty = useCallback(
    async (form: CreateWarrantyFormData) => {
      if (!isAuthenticated) {
        const warranty = formToLocalWarranty(form);
        const saved = persistWarranty(warranty);
        refreshWarranties();
        refreshNotifications();
        return saved;
      }

      const created = await createWarrantyViaApi(form);
      const saved = persistWarranty(created);
      await loadWarrantiesFromApi();
      refreshNotifications();
      return saved;
    },
    [isAuthenticated, loadWarrantiesFromApi, refreshNotifications, refreshWarranties]
  );

  const updateWarranty = useCallback(
    async (id: string, updates: WarrantyUpdate) => {
      const current =
        getWarranties().find((w) => w.id === id) ??
        warranties.find((w) => w.id === id);
      if (!current) {
        return { success: false as const, error: "Garantia não encontrada." };
      }

      if (!isAuthenticated) {
        const result = updateWarrantyInStorage(id, updates);
        if (result.success) {
          refreshWarranties();
          refreshNotifications();
        }
        return result;
      }

      try {
        const updated = await updateWarrantyViaApi(id, updates, current);
        persistWarranty(updated);
        await loadWarrantiesFromApi();
        refreshNotifications();
        return { success: true as const, warranty: updated };
      } catch (err) {
        return {
          success: false as const,
          error:
            err instanceof Error
              ? err.message
              : "Não foi possível salvar a garantia.",
        };
      }
    },
    [isAuthenticated, warranties, loadWarrantiesFromApi, refreshNotifications, refreshWarranties]
  );

  const moveToTrash = useCallback(
    async (id: string) => {
      const item = warranties.find((w) => w.id === id);

      if (!isAuthenticated) {
        try {
          if (item?.attachments?.length) {
            await deleteWarrantyAttachmentsFromCloudinary(item.attachments);
          }
          const result = softDeleteWarranty(id);
          if (result.success) {
            if (item?.attachments?.length) {
              updateWarrantyInStorage(id, { attachments: [] });
            }
            refreshWarranties();
            refreshNotifications();
          }
          return result;
        } catch (err) {
          return {
            success: false as const,
            error:
              err instanceof Error
                ? err.message
                : "Não foi possível enviar para a lixeira.",
          };
        }
      }

      try {
        if (item?.attachments?.length) {
          await deleteWarrantyAttachmentsFromCloudinary(item.attachments);
        }

        await trashWarrantyViaApi(id);
        const result = softDeleteWarranty(id);
        if (result.success) {
          if (item?.attachments?.length) {
            updateWarrantyInStorage(id, { attachments: [] });
          }
          refreshWarranties();
          refreshNotifications();
        }
        return result;
      } catch (err) {
        return {
          success: false as const,
          error:
            err instanceof Error
              ? err.message
              : "Não foi possível enviar para a lixeira.",
        };
      }
    },
    [isAuthenticated, warranties, refreshWarranties, refreshNotifications]
  );

  const restoreFromTrash = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        try {
          const result = restoreWarranty(id);
          if (result.success) {
            refreshWarranties();
            refreshNotifications();
          }
          return result;
        } catch (err) {
          return {
            success: false as const,
            error:
              err instanceof Error
                ? err.message
                : "Não foi possível restaurar a garantia.",
          };
        }
      }

      try {
        await restoreWarrantyViaApi(id);
        const result = restoreWarranty(id);
        if (result.success) {
          await loadWarrantiesFromApi();
          refreshNotifications();
        }
        return result;
      } catch (err) {
        return {
          success: false as const,
          error:
            err instanceof Error
              ? err.message
              : "Não foi possível restaurar a garantia.",
        };
      }
    },
    [isAuthenticated, loadWarrantiesFromApi, refreshNotifications, refreshWarranties]
  );

  const permanentlyDelete = useCallback(
    async (id: string) => {
      const item = warranties.find((w) => w.id === id);

      if (item?.attachments?.length) {
        await deleteWarrantyAttachmentsFromCloudinary(item.attachments);
      }

      if (isAuthenticated && isApiWarrantyId(id)) {
        await permanentlyDeleteWarrantyViaApi(id);
      }

      const ok = permanentlyDeleteWarranty(id);
      if (ok) {
        refreshWarranties();
        refreshNotifications();
      }
      return ok;
    },
    [isAuthenticated, warranties, refreshWarranties, refreshNotifications]
  );

  return (
    <WarrantyContext.Provider
      value={{
        warranties,
        activeWarranties,
        trashedWarranties,
        addWarranty,
        updateWarranty,
        moveToTrash,
        restoreFromTrash,
        permanentlyDelete,
        refreshWarranties,
        loadWarrantiesFromApi,
        isLoadingWarranties,
      }}
    >
      {children}
    </WarrantyContext.Provider>
  );
}

export function useWarranty() {
  const context = useContext(WarrantyContext);
  if (!context) {
    throw new Error("useWarranty precisa estar dentro de WarrantyProvider");
  }
  return context;
}
