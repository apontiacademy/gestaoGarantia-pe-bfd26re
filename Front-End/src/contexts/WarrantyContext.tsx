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
import { mergeAttachmentMetadataFromLocal } from "../utils/warrantyApiMapper";
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

export function WarrantyProvider({ children }: { children: ReactNode }) {
  const { refresh: refreshNotifications } = useNotifications();
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
        return mergeAttachmentMetadataFromLocal(
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
      refreshNotifications();
      return saved;
    },
    [loadWarrantiesFromApi, refreshNotifications]
  );

  const updateWarranty = useCallback(
    async (id: string, updates: WarrantyUpdate) => {
      const current =
        getWarranties().find((w) => w.id === id) ??
        warranties.find((w) => w.id === id);
      if (!current) {
        return { success: false as const, error: "Garantia não encontrada." };
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
    [warranties, loadWarrantiesFromApi, refreshNotifications]
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
    [warranties, refreshWarranties, refreshNotifications]
  );

  const restoreFromTrash = useCallback(
    async (id: string) => {
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
    [loadWarrantiesFromApi, refreshNotifications]
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
        refreshNotifications();
      }
      return ok;
    },
    [warranties, refreshWarranties, refreshNotifications]
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
