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
  updateWarranty as updateWarrantyInStorage,
  softDeleteWarranty,
  restoreWarranty,
  permanentlyDeleteWarranty,
  type Warranty,
  type WarrantyUpdate,
} from "../services/warrantyService";
import {
  createWarrantyViaApi,
  fetchWarrantiesFromApi,
  restoreWarrantyViaApi,
  trashWarrantyViaApi,
  updateWarrantyViaApi,
} from "../services/warrantyApiService";
import type { CreateWarrantyFormData } from "../utils/warrantyApiMapper";
import { deleteWarrantyAttachmentsFromCloudinary } from "../utils/warrantyCloudinaryCleanup";
import { GARANTIAS_SESSION_EVENT } from "./AuthContext";

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

const FISCAL_CACHE_FIELDS = [
  "storeCnpj",
  "nfNumber",
  "quantity",
  "value",
  "unitValue",
  "totalValue",
] as const satisfies readonly (keyof Warranty)[];

function mergeFiscalFieldsFromLocal(
  warranty: Warranty,
  local?: Warranty
): Warranty {
  if (!local) return warranty;

  const merged = { ...warranty };
  for (const field of FISCAL_CACHE_FIELDS) {
    if (!merged[field] && local[field]) {
      merged[field] = local[field];
    }
  }
  return merged;
}

export function WarrantyProvider({ children }: { children: ReactNode }) {
  const { pushNotification } = useNotifications();
  const [warranties, setWarranties] = useState<Warranty[]>(() => {
    return getWarranties() || [];
  });
  const [isLoadingWarranties, setIsLoadingWarranties] = useState(false);

  const refreshWarranties = useCallback(() => {
    setWarranties(getWarranties());
  }, []);

  const loadWarrantiesFromApi = useCallback(async () => {
    const token = localStorage.getItem("@garantias:token");
    if (!token) {
      persistWarranties([]);
      setWarranties([]);
      return;
    }

    setIsLoadingWarranties(true);
    try {
      const fromApi = await fetchWarrantiesFromApi();
      const local = getWarranties();
      const localById = new Map(local.map((w) => [w.id, w] as const));
      const activeFromApi = fromApi.map((w) => {
        const cached = localById.get(w.id);
        return mergeFiscalFieldsFromLocal(
          {
            ...w,
            attachments: w.attachments?.length
              ? w.attachments
              : cached?.attachments,
          },
          cached
        );
      });
      const activeIds = new Set(activeFromApi.map((w) => w.id));
      const trashedLocal = local
        .filter(isWarrantyDeleted)
        .filter((w) => !activeIds.has(w.id))
        .map((w) => ({
          ...w,
          attachments: w.attachments ?? localById.get(w.id)?.attachments,
        }));
      const merged = [...activeFromApi, ...trashedLocal];
      persistWarranties(merged);
      setWarranties(merged);
    } catch {
      refreshWarranties();
    } finally {
      setIsLoadingWarranties(false);
    }
  }, [refreshWarranties]);

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
      const created = await createWarrantyViaApi(form);
      const saved = persistWarranty(created);
      await loadWarrantiesFromApi();
      pushNotification({
        type: "created",
        title: "Nova garantia criada",
        description: `"${saved.title}" foi adicionada à sua lista.`,
        warrantyId: saved.id,
      });
      return saved;
    },
    [loadWarrantiesFromApi, pushNotification]
  );

  const updateWarranty = useCallback(
    async (id: string, updates: WarrantyUpdate) => {
      const current = warranties.find((w) => w.id === id);
      if (!current) {
        return { success: false as const, error: "Garantia não encontrada." };
      }

      try {
        const updated = await updateWarrantyViaApi(id, updates, current);
        persistWarranty(updated);
        await loadWarrantiesFromApi();
        pushNotification({
          type: "updated",
          title: "Garantia atualizada",
          description: `"${updated.title}" foi salva com sucesso.`,
          warrantyId: updated.id,
        });
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
    [warranties, loadWarrantiesFromApi, pushNotification]
  );

  const moveToTrash = useCallback(
    async (id: string) => {
      const item = warranties.find((w) => w.id === id);
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
          if (item) {
            pushNotification({
              type: "trashed",
              title: "Enviada para a lixeira",
              description: `"${item.title}" foi movida para a lixeira.`,
              warrantyId: item.id,
            });
          }
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
    [warranties, refreshWarranties, pushNotification]
  );

  const restoreFromTrash = useCallback(
    async (id: string) => {
      try {
        await restoreWarrantyViaApi(id);
        const result = restoreWarranty(id);
        if (result.success) {
          await loadWarrantiesFromApi();
          pushNotification({
            type: "restored",
            title: "Garantia restaurada",
            description: `"${result.warranty.title}" voltou para a lista principal.`,
            warrantyId: result.warranty.id,
          });
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
    [loadWarrantiesFromApi, pushNotification]
  );

  const permanentlyDelete = useCallback(
    async (id: string) => {
      const item = warranties.find((w) => w.id === id);

      if (item?.attachments?.length) {
        await deleteWarrantyAttachmentsFromCloudinary(item.attachments);
      }

      const ok = permanentlyDeleteWarranty(id);
      if (ok) {
        refreshWarranties();
        if (item) {
          pushNotification({
            type: "deleted_permanent",
            title: "Excluída permanentemente",
            description: `"${item.title}" foi removida da lixeira.`,
            warrantyId: item.id,
          });
        }
      }
      return ok;
    },
    [warranties, refreshWarranties, pushNotification]
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
