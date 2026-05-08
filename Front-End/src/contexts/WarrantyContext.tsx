import {
  createContext,
  useContext,
  useState,
  useEffect,
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
  const [warranties, setWarranties] = useState<Warranty[]>([]);

  useEffect(() => {
    setWarranties(getWarranties());
  }, []);

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
