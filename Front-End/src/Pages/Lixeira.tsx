import { useState } from "react";
import Nav from "../components/navegation/Nav";
import { Bell, TextAlignStart } from "lucide-react";
import Sidebar from "../components/navegation/Siderbar";

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

// ─── Icons ────────────────────────────────────────────────────────────────────

const TrashIcon = ({
  color = "currentColor",
  size = 20,
}: {
  color?: string;
  size?: number;
}) => (
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

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  visible: boolean;
}

function Toast({ message, visible }: ToastProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#3C3489",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 500,
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
        transition: "opacity 0.3s",
        whiteSpace: "nowrap",
        zIndex: 999,
      }}
    >
      {message}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  item: GarantiaItem;
  onToggle: (id: number) => void;
  onRestore: (e: React.MouseEvent, id: number) => void;
}

function GarantiaCard({ item, onToggle, onRestore }: CardProps) {
  return (
    <div
      onClick={() => onToggle(item.id)}
      style={{
        background: item.sel ? "#f5f2ff" : "#fff",
        border: `1px solid ${item.sel ? "#5B21D9" : "#E2E2E2"}`,
        borderRadius: 12,
        padding: 14,
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <span
          style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", flex: 1 }}
        >
          {item.nome}
        </span>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          {/* Checkbox */}
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              border: `1.5px solid ${item.sel ? "#5B21D9" : "#AAAAAA"}`,
              background: item.sel ? "#5B21D9" : "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {item.sel ? "✓" : ""}
          </div>
          <span style={{ fontSize: 11.5, color: "#888" }}>
            Nº da nota: <strong style={{ color: "#444" }}>{item.nf}</strong>
          </span>
        </div>
      </div>

      {/* Loja */}
      <p
        style={{
          fontSize: 12.5,
          color: "#888",
          fontStyle: "italic",
          margin: "4px 0 10px",
        }}
      >
        {item.loja}
      </p>

      {/* Info */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          marginBottom: 10,
        }}
      >
        {[
          ["Data da Compra", item.dataCompra],
          ["Data de Vencimento", item.dataVenc],
          ["Tipo de Garantia", item.tipo],
          ["Criado por", item.criado],
        ].map(([label, value]) => (
          <span key={label} style={{ fontSize: 12, color: "#666" }}>
            {label}: <span style={{ color: "#222" }}>{value}</span>
          </span>
        ))}
      </div>

      {/* Divider */}
      <hr
        style={{
          border: "none",
          borderTop: "1px solid #EBEBEB",
          margin: "0 0 10px",
        }}
      />

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>
          Valor R$:{" "}
          <span style={{ fontWeight: 400 }}>
            {item.valor.replace("R$ ", "")}
          </span>
        </span>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 11.5, color: "#C0392B", fontWeight: 600 }}>
            Status: {item.status}
          </span>
          <button
            onClick={(e) => onRestore(e, item.id)}
            style={{
              border: "1.5px solid #E74C3C",
              background: "transparent",
              borderRadius: 20,
              padding: "4px 14px",
              fontSize: 12.5,
              color: "#C0392B",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Restaurar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LixeiraScreen() {
  const [items, setItems] = useState<GarantiaItem[]>(initialItems);
  const [toast, setToast] = useState({ visible: false, message: "" });
      const [isOpen, setIsOpen] = useState(false);


  const allSelected = items.length > 0 && items.every((i) => i.sel);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  };

  const toggleCard = (id: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, sel: !i.sel } : i)),
    );
  };

  const toggleSelectAll = () => {
    setItems((prev) => prev.map((i) => ({ ...i, sel: !allSelected })));
  };

  const handleRestore = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (item) showToast(`"${item.nome}" restaurado com sucesso`);
  };

  const handleEsvaziar = () => {
    const selecionados = items.filter((i) => i.sel);
    if (selecionados.length > 0) {
      setItems((prev) => prev.filter((i) => !i.sel));
      showToast(`${selecionados.length} item(s) excluído(s) permanentemente`);
    } else {
      const total = items.length;
      setItems([]);
      showToast(`${total} item(s) excluído(s) permanentemente`);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F0F0F0",
        fontFamily: "sans-serif",
      }}
    >
      {/* Top bar */}
      <Nav
        // ICONE DE MENU
        leftIcon={TextAlignStart}
        leftLabel="Abrir Menu"
        onLeftClick={() => setIsOpen(true)}
        // ICONE DE NOTIFICAÇÃO
        rightIcon={Bell}
        onRightClick={() => console.log("Bell")}
      />
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Page header */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #E0E0E0",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <TrashIcon color="#333" size={24} />
        <span style={{ fontSize: 20, fontWeight: 700, color: "#1A1A1A" }}>
          Lixeira
        </span>
      </div>

      {/* Action buttons */}
      <div
        style={{
          background: "#E8E8E8",
          padding: "12px 16px",
          display: "flex",
          gap: 10,
          borderBottom: "1px solid #D8D8D8",
        }}
      >
        <button
          onClick={toggleSelectAll}
          style={{
            flex: 1,
            padding: "9px 14px",
            border: `1.5px solid ${allSelected ? "#5B21D9" : "#C0C0C0"}`,
            background: allSelected ? "#5B21D9" : "#fff",
            borderRadius: 8,
            fontSize: 13,
            color: allSelected ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.15s",
          }}
        >
          {allSelected ? "Desmarcar Todas" : "Selecionar Todas"}
        </button>

        <button
          onClick={handleEsvaziar}
          style={{
            flex: 1,
            padding: "9px 14px",
            border: "1.5px solid #E74C3C",
            background: "#FFF5F5",
            borderRadius: 8,
            fontSize: 13,
            color: "#C0392B",
            cursor: "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <TrashIcon color="#C0392B" size={15} />
          Esvaziar a Lixeira
        </button>
      </div>

      {/* Card list */}
      <div
        style={{
          padding: "14px 14px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              marginTop: 60,
              color: "#aaa",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <TrashIcon color="#ccc" size={48} />
            <span style={{ fontSize: 16 }}>Lixeira vazia</span>
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

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
