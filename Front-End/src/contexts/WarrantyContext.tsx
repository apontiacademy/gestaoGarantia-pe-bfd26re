/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useNotifications } from "../hooks/useNotifications";
import {
  getWarranties,
  isWarrantyDeleted,
  saveWarranty,
  updateWarranty as updateWarrantyInStorage,
  softDeleteWarranty,
  restoreWarranty,
  permanentlyDeleteWarranty,
  type Warranty,
  type WarrantyInput,
  type WarrantyUpdate,
} from "../services/warrantyService";

interface WarrantyContextData {
  warranties: Warranty[];
  activeWarranties: Warranty[];
  trashedWarranties: Warranty[];
  addWarranty: (input: WarrantyInput) => void;
  updateWarranty: (
    id: string,
    updates: WarrantyUpdate
  ) => ReturnType<typeof updateWarrantyInStorage>;
  moveToTrash: (id: string) => ReturnType<typeof softDeleteWarranty>;
  restoreFromTrash: (id: string) => ReturnType<typeof restoreWarranty>;
  permanentlyDelete: (id: string) => boolean;
  refreshWarranties: () => void;
}

const WarrantyContext = createContext<WarrantyContextData>(
  {} as WarrantyContextData
);

export function WarrantyProvider({ children }: { children: ReactNode }) {
  const { pushNotification } = useNotifications();
  const [warranties, setWarranties] = useState<Warranty[]>(() => {
    return getWarranties() || [];
  });

  const refreshWarranties = useCallback(() => {
    setWarranties(getWarranties());
  }, []);

  const activeWarranties = useMemo(
    () => warranties.filter((w) => !isWarrantyDeleted(w)),
    [warranties]
  );

  const trashedWarranties = useMemo(
    () => warranties.filter(isWarrantyDeleted),
    [warranties]
  );

  const addWarranty = useCallback(
    (input: WarrantyInput) => {
      const created = saveWarranty(input);
      refreshWarranties();
      pushNotification({
        type: "created",
        title: "Nova garantia criada",
        description: `"${created.title}" foi adicionada à sua lista.`,
        warrantyId: created.id,
      });
    },
    [refreshWarranties, pushNotification]
  );

  const updateWarranty = useCallback(
    (id: string, updates: WarrantyUpdate) => {
      const result = updateWarrantyInStorage(id, updates);
      if (result.success) {
        refreshWarranties();
        pushNotification({
          type: "updated",
          title: "Garantia atualizada",
          description: `"${result.warranty.title}" foi salva com sucesso.`,
          warrantyId: result.warranty.id,
        });
      }
      return result;
    },
    [refreshWarranties, pushNotification]
  );

  const moveToTrash = useCallback(
    (id: string) => {
      const item = warranties.find((w) => w.id === id);
      const result = softDeleteWarranty(id);
      if (result.success) {
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
    },
    [warranties, refreshWarranties, pushNotification]
  );

  const restoreFromTrash = useCallback(
    (id: string) => {
      const result = restoreWarranty(id);
      if (result.success) {
        refreshWarranties();
        pushNotification({
          type: "restored",
          title: "Garantia restaurada",
          description: `"${result.warranty.title}" voltou para a lista principal.`,
          warrantyId: result.warranty.id,
        });
      }
      return result;
    },
    [refreshWarranties, pushNotification]
  );

  const permanentlyDelete = useCallback(
    (id: string) => {
      const item = warranties.find((w) => w.id === id);
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
