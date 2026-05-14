/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  getWarranties,
  saveWarranty,
  type Warranty,
  type WarrantyInput,
} from "../services/warrantyService";

interface WarrantyContextData {
  warranties: Warranty[];
  addWarranty: (input: WarrantyInput) => void;
}

const WarrantyContext = createContext<WarrantyContextData>(
  {} as WarrantyContextData
);

export function WarrantyProvider({ children }: { children: ReactNode }) {
  // Inicialização inteligente do estado buscando os dados locais de forma síncrona
  const [warranties, setWarranties] = useState<Warranty[]>(() => {
    return getWarranties() || [];
  });

  const addWarranty = useCallback((input: WarrantyInput) => {
    saveWarranty(input);
    setWarranties(getWarranties());
  }, []);

  return (
    <WarrantyContext.Provider value={{ warranties, addWarranty }}>
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