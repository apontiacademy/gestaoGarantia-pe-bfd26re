import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import LayoutHome from "../layout/LayoutHome";
import WarrantyCard from "../components/ui/WarrantyCard";
import Toast from "../components/ui/Toast";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useWarranty } from "../contexts/WarrantyContext";
import { useToast } from "../hooks/useToast";

export default function LixeiraScreen() {
  const { trashedWarranties, restoreFromTrash, permanentlyDelete } =
    useWarranty();
  const { toast, showToast } = useToast();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const allSelected =
    trashedWarranties.length > 0 &&
    trashedWarranties.every((w) => selectedIds.has(w.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(trashedWarranties.map((w) => w.id)));
    }
  };

  const toggleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleRestore = (id: string) => {
    const item = trashedWarranties.find((w) => w.id === id);
    const result = restoreFromTrash(id);
    if (!result.success) {
      showToast(result.error, "error");
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (item) showToast(`"${item.title}" restaurado`);
  };

  const targetsToDelete = useMemo(() => {
    if (selectedIds.size > 0) {
      return trashedWarranties.filter((w) => selectedIds.has(w.id));
    }
    return trashedWarranties;
  }, [trashedWarranties, selectedIds]);

  const handleConfirmEmpty = () => {
    if (targetsToDelete.length === 0) return;

    setIsProcessing(true);
    let deleted = 0;
    for (const w of targetsToDelete) {
      if (permanentlyDelete(w.id)) deleted++;
    }
    setIsProcessing(false);
    setConfirmEmptyOpen(false);
    setSelectedIds(new Set());

    if (deleted === 0) {
      showToast("Não foi possível excluir os itens.", "error");
      return;
    }

    showToast(
      deleted === 1
        ? "1 item excluído permanentemente"
        : `${deleted} itens excluídos permanentemente`
    );
  };

  return (
    <LayoutHome namePage="Lixeira" namePageIcon={Trash2}>
      <div className="min-h-screen bg-fundo">
        <div className="px-4 py-3 flex gap-2.5">
          <button
            type="button"
            onClick={toggleSelectAll}
            disabled={trashedWarranties.length === 0}
            className={`
              flex-1 py-2 px-4 rounded-lg text-sm font-semibold border cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                allSelected
                  ? "bg-[#5B21D9] text-white border-[#5B21D9]"
                  : "bg-white text-[#333] border-[#C0C0C0]"
              }
            `}
          >
            {allSelected ? "Desmarcar Todas" : "Selecionar Todas"}
          </button>

          <button
            type="button"
            onClick={() => setConfirmEmptyOpen(true)}
            disabled={trashedWarranties.length === 0 || isProcessing}
            className="
              flex-1 py-2 px-4 rounded-lg text-sm font-semibold
              border border-red/80 bg-red/5 text-red/80
              flex items-center justify-center gap-2 cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Trash2 size={15} />
            Esvaziar
          </button>
        </div>

        <div
          className="
            p-4 grid grid-cols-1
            md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3
          "
        >
          {trashedWarranties.length === 0 ? (
            <div
              className="
                col-span-full text-center mt-16 text-[#aaa]
                flex flex-col items-center gap-3
              "
            >
              <Trash2 size={48} />
              <span className="text-base">Lixeira vazia</span>
            </div>
          ) : (
            trashedWarranties.map((item) => (
              <WarrantyCard
                key={item.id}
                title={item.title}
                story={item.story}
                nfNumber={item.nfNumber}
                purchaseDate={item.purchaseDate}
                expirationDate={item.expirationDate}
                warrantyType={item.warrantyType}
                value={item.value}
                variant="trash"
                selected={selectedIds.has(item.id)}
                onSelect={(selected) => toggleSelect(item.id, selected)}
                onRestore={() => handleRestore(item.id)}
              />
            ))
          )}
        </div>

        <ConfirmDialog
          open={confirmEmptyOpen}
          title="Excluir permanentemente?"
          description={
            selectedIds.size > 0
              ? `${targetsToDelete.length} item(ns) selecionado(s) serão removidos para sempre. Esta ação não pode ser desfeita.`
              : `Todas as ${targetsToDelete.length} garantia(s) na lixeira serão removidas para sempre. Esta ação não pode ser desfeita.`
          }
          confirmLabel="Excluir permanentemente"
          variant="danger"
          loading={isProcessing}
          onConfirm={handleConfirmEmpty}
          onCancel={() => setConfirmEmptyOpen(false)}
        />

        <Toast
          message={toast.message}
          visible={toast.visible}
          variant={toast.variant}
        />
      </div>
    </LayoutHome>
  );
}
