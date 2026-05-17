import { useState } from "react";
import { Trash2 } from "lucide-react";
import LayoutHome from "../layout/LayoutHome";
import WarrantyCard from "../components/ui/WarrantyCard";

interface GarantiaItem {
  id: number;
  nome: string;
  loja: string;
  nf: string;
  dataCompra: string;
  dataVenc: string;
  tipo: string;
  status: string;
  valor: string;
  sel: boolean;
}

interface ToastProps {
  message: string;
  visible: boolean;
}

const initialItems: GarantiaItem[] = [
  {
    id: 1,
    nome: "Notebook Dell Inspiron 15",
    loja: "Magazine Luiza",
    nf: "4521",
    dataCompra: "12/03/2024",
    dataVenc: "12/03/2025",
    tipo: "Garantia do Fabricante",
    status: "Expirado",
    valor: "R$ 3.499,00",
    sel: false,
  },
  {
    id: 2,
    nome: "Geladeira Brastemp 400L",
    loja: "Casas Bahia",
    nf: "8834",
    dataCompra: "05/07/2023",
    dataVenc: "05/07/2026",
    tipo: "Garantia Estendida",
    status: "Ativo",
    valor: "R$ 2.890,00",
    sel: false,
  },
  {
    id: 3,
    nome: 'TV Samsung 55" 4K',
    loja: "Fast Shop",
    nf: "2290",
    dataCompra: "01/01/2026",
    dataVenc: "20/05/2026",
    tipo: "Garantia do Fabricante",
    status: "Expirado",
    valor: "R$ 4.200,00",
    sel: false,
  },
];

// ─── Toast ─────────────────────────

function Toast({ message, visible }: ToastProps) {
  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2
        bg-primary text-white
        px-5 py-2
        rounded-full
        text-sm font-medium
        transition-opacity
        whitespace-nowrap
        z-999

        ${visible ? "opacity-100" : "opacity-0"}
      `}
    >
      {message}
    </div>
  );
}

// ─── MAIN ─────────────────────────

export default function LixeiraScreen() {
  const [items, setItems] = useState(initialItems);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
  });

  const allSelected =
    items.length > 0 && items.every((i) => i.sel);

  const showToast = (message: string) => {
    setToast({ visible: true, message });

    setTimeout(() => {
      setToast({ visible: false, message: "" });
    }, 2500);
  };

  const toggleSelectAll = () => {
    setItems((prev) =>
      prev.map((i) => ({
        ...i,
        sel: !allSelected,
      }))
    );
  };

  const handleRestore = (id: number) => {
    const item = items.find((i) => i.id === id);

    setItems((prev) =>
      prev.filter((i) => i.id !== id)
    );

    if (item)
      showToast(`"${item.nome}" restaurado`);
  };

  const handleEsvaziar = () => {
    const selecionados =
      items.filter((i) => i.sel);

    if (selecionados.length > 0) {
      setItems((prev) =>
        prev.filter((i) => !i.sel)
      );

      showToast(
        `${selecionados.length} item(s) excluído(s)`
      );
    } else {
      const total = items.length;

      setItems([]);

      showToast(
        `${total} item(s) excluído(s)`
      );
    }
  };

  return (
    <LayoutHome
      namePage={"Lixeira"}
      namePageIcon={Trash2}
    >
      <div className="min-h-screen bg-fundo ">

        {/* BUTTONS */}
        <div className="
          px-4 py-3
          flex gap-2.5
        ">
          <button
            onClick={toggleSelectAll}
            className={`
              flex-1
              py-2 px-4
              rounded-lg
              text-sm font-semibold
              border
              cursor-pointer

              ${allSelected
                ? "bg-[#5B21D9] text-white border-[#5B21D9]"
                : "bg-white text-[#333] border-[#C0C0C0]"
              }
            `}
          >
            {allSelected
              ? "Desmarcar Todas"
              : "Selecionar Todas"}
          </button>

          <button
            onClick={handleEsvaziar}
            className="
              flex-1
              py-2 px-4
              rounded-lg
              text-sm font-semibold
              border border-red/80
              bg-red/5
              text-red/80
              flex items-center justify-center gap-2
              cursor-pointer
            "
          >
            <Trash2 size={15} />
            Esvaziar
          </button>
        </div>

        {/* GRID RESPONSIVO */}
        <div
          className="
            p-4
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-3
          "
        >
          {items.length === 0 ? (
            <div className="
              col-span-full
              text-center
              mt-16
              text-[#aaa]
              flex flex-col
              items-center gap-3
            ">
              <Trash2 size={48} />
              <span className="text-base">
                Lixeira vazia
              </span>
            </div>
          ) : (
            items.map((item) => (
              <WarrantyCard
                key={item.id}
                title={item.nome}
                story={item.loja}
                nfNumber={item.nf}
                purchaseDate={item.dataCompra}
                expirationDate={item.dataVenc}
                warrantyType={item.tipo}
                value={item.valor}

                variant="trash"

                selected={item.sel}
                onSelect={(selected) => {
                  setItems((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, sel: selected } : i
                    )
                  );
                }}

                onRestore={() => handleRestore(item.id)}
              />
            ))
          )}
        </div>

        <Toast
          message={toast.message}
          visible={toast.visible}
        />
      </div>
    </LayoutHome>
  );
}