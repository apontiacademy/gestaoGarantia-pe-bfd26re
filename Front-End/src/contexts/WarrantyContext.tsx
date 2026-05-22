/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
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
      saveWarranty(input);
      refreshWarranties();
    },
    [refreshWarranties]
  );

  const updateWarranty = useCallback(
    (id: string, updates: WarrantyUpdate) => {
      const result = updateWarrantyInStorage(id, updates);
      if (result.success) refreshWarranties();
      return result;
    },
    [refreshWarranties]
  );

  const moveToTrash = useCallback(
    (id: string) => {
      const result = softDeleteWarranty(id);
      if (result.success) refreshWarranties();
      return result;
    },
    [refreshWarranties]
  );

  const restoreFromTrash = useCallback(
    (id: string) => {
      const result = restoreWarranty(id);
      if (result.success) refreshWarranties();
      return result;
    },
    [refreshWarranties]
  );

  const permanentlyDelete = useCallback(
    (id: string) => {
      const ok = permanentlyDeleteWarranty(id);
      if (ok) refreshWarranties();
      return ok;
    },
    [refreshWarranties]
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
