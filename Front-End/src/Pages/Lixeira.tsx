import { useState } from "react";
import Nav from "../components/navegation/Nav";

import Sidebar from "../components/navegation/Siderbar";
import { Bell, TextAlignStart } from "lucide-react";

interface GarantiaItem {
  id: number;
  nome: string;
  loja: string;
  nf: string;
  dataCompra: string;
  dataVenc: string;
  tipo: string;
  criado: string;
  status: string;
  valor: string;
  sel: boolean;
}

const initialItems: GarantiaItem[] = [
  {
    id: 1,
    nome: "Notebook Dell Inspiron 15",
    loja: "Magazine Luiza",
    nf: "NF-4521",
    dataCompra: "12/03/2024",
    dataVenc: "12/03/2025",
    tipo: "Garantia do Fabricante",
    criado: "João Silva",
    status: "Expirado",
    valor: "R$ 3.499,00",
    sel: false,
  },
  {
    id: 2,
    nome: "Geladeira Brastemp 400L",
    loja: "Casas Bahia",
    nf: "NF-8834",
    dataCompra: "05/07/2023",
    dataVenc: "05/07/2026",
    tipo: "Garantia Estendida",
    criado: "Maria Souza",
    status: "Ativo",
    valor: "R$ 2.890,00",
    sel: false,
  },
  {
    id: 3,
    nome: 'TV Samsung 55" 4K',
    loja: "Fast Shop",
    nf: "NF-2290",
    dataCompra: "20/11/2023",
    dataVenc: "20/11/2024",
    tipo: "Garantia do Fabricante",
    criado: "Carlos Lima",
    status: "Expirado",
    valor: "R$ 4.200,00",
    sel: false,
  },
];

// ─── Icons ─────────────────────────

const TrashIcon = ({ color = "currentColor", size = 20 }: any) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

// ─── Toast ─────────────────────────

function Toast({ message, visible }: any) {
  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2
        bg-[#3C3489] text-white
        px-5 py-2
        rounded-full
        text-sm font-medium
        transition-opacity
        whitespace-nowrap
        z-[999]

        ${visible ? "opacity-100" : "opacity-0"}
      `}
    >
      {message}
    </div>
  );
}

// ─── Card ─────────────────────────

function GarantiaCard({ item, onToggle, onRestore }: any) {
  return (
    <div
      onClick={() => onToggle(item.id)}
      className={`
        cursor-pointer
        transition-colors
        border
        rounded-lg
        p-3
        w-full

        md:p-4

        ${item.sel
          ? "bg-[#f5f2ff] border-[#5B21D9]"
          : "bg-white border-[#E2E2E2]"
        }
      `}
    >
      {/* Top */}
      <div className="flex justify-between items-start">
        <span className="text-sm font-semibold text-[#1A1A1A] flex-1">
          {item.nome}
        </span>

        <div className="flex flex-col items-end gap-1.5">
          {/* Checkbox */}
          <div
            className={`
              w-[18px] h-[18px]
              rounded
              border
              flex items-center justify-center
              text-[11px] text-white

              ${item.sel
                ? "bg-[#5B21D9] border-[#5B21D9]"
                : "bg-white border-[#AAAAAA]"
              }
            `}
          >
            {item.sel ? "✓" : ""}
          </div>

          <span className="text-[11.5px] text-[#888]">
            Nº da nota:
            <strong className="text-[#444]"> {item.nf}</strong>
          </span>
        </div>
      </div>

      {/* Loja */}
      <p className="text-[12.5px] text-[#888] italic mt-1 mb-2.5">
        {item.loja}
      </p>

      {/* Info */}
      <div className="flex flex-col gap-1 mb-2.5">
        {[
          ["Data da Compra", item.dataCompra],
          ["Data de Vencimento", item.dataVenc],
          ["Tipo de Garantia", item.tipo],
          ["Criado por", item.criado],
        ].map(([label, value]) => (
          <span key={label} className="text-xs text-[#666]">
            {label}: <span className="text-[#222]">{value}</span>
          </span>
        ))}
      </div>

      <hr className="border-t border-[#EBEBEB] mb-2.5" />

      {/* Footer */}
      <div className="flex justify-between items-end">
        <span className="text-sm font-semibold text-[#1A1A1A]">
          Valor R$:{" "}
          <span className="font-normal">
            {item.valor.replace("R$ ", "")}
          </span>
        </span>

        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[11.5px] text-[#C0392B] font-semibold">
            Status: {item.status}
          </span>

          <button
            onClick={(e) => onRestore(e, item.id)}
            className="
              border border-[#E74C3C]
              rounded-full
              px-3 py-1
              text-[12.5px]
              text-[#C0392B]
              font-medium
              hover:bg-red-50
            "
          >
            Restaurar
          </button>
        </div>
      </div>
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
  const [isOpen, setIsOpen] = useState(false);

  const allSelected =
    items.length > 0 && items.every((i) => i.sel);

  const showToast = (message: string) => {
    setToast({ visible: true, message });

    setTimeout(() => {
      setToast({ visible: false, message: "" });
    }, 2500);
  };

  const toggleCard = (id: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, sel: !i.sel } : i
      )
    );
  };

  const toggleSelectAll = () => {
    setItems((prev) =>
      prev.map((i) => ({
        ...i,
        sel: !allSelected,
      }))
    );
  };

  const handleRestore = (e: any, id: number) => {
    e.stopPropagation();

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
    <div className="min-h-screen bg-[#F0F0F0] font-sans">
      {/* NAV */}
      <Nav
        leftIcon={TextAlignStart}
        leftLabel="Abrir Menu"
        onLeftClick={() => setIsOpen(true)}
        rightIcon={Bell}
      />

      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      {/* HEADER */}
      <div className="
        bg-white
        border-b
        px-5 py-4
        flex items-center gap-2.5
      ">
        <TrashIcon size={24} />
        <span className="text-xl font-bold text-[#1A1A1A]">
          Lixeira
        </span>
      </div>

      {/* BUTTONS */}
      <div className="
        bg-[#E8E8E8]
        px-4 py-3
        flex gap-2.5
        border-b
      ">
        <button
          onClick={toggleSelectAll}
          className={`
            flex-1
            py-2 px-4
            rounded-lg
            text-sm font-semibold
            border

            ${
              allSelected
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
            border border-[#E74C3C]
            bg-[#FFF5F5]
            text-[#C0392B]
            flex items-center justify-center gap-2
          "
        >
          <TrashIcon size={15} />
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
            <TrashIcon size={48} />
            <span className="text-base">
              Lixeira vazia
            </span>
          </div>
        ) : (
          items.map((item) => (
            <GarantiaCard
              key={item.id}
              item={item}
              onToggle={toggleCard}
              onRestore={handleRestore}
            />
          ))
        )}
      </div>

      <Toast
        message={toast.message}
        visible={toast.visible}
      />
    </div>
  );
}