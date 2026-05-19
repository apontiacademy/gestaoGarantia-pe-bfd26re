import Button from "../ui/Button";

interface WarrantyActionsProps {
  isEditing: boolean;
  isDeleted: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onRestore: () => void;
}

export default function WarrantyActions({
  isEditing,
  isDeleted,
  isSaving,
  isDeleting,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onRestore,
}: WarrantyActionsProps) {
  const busy = isSaving || isDeleting;

  if (isDeleted) {
    return (
      <footer className="flex flex-wrap justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="primary"
          onClick={onRestore}
          disabled={busy}
          className={busy ? "opacity-70" : ""}
        >
          {isDeleting ? "Restaurando..." : "Restaurar garantia"}
        </Button>
      </footer>
    );
  }

  if (isEditing) {
    return (
      <footer className="flex flex-wrap justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={busy}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onSave}
          disabled={busy}
          className={busy ? "opacity-70" : ""}
        >
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </footer>
    );
  }

  return (
    <footer className="flex flex-wrap justify-end gap-3 pt-4 border-t">
      <Button type="button" variant="ghost" onClick={onEdit} disabled={busy}>
        Editar
      </Button>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed font-medium transition-all"
      >
        {isDeleting ? "Enviando..." : "Enviar para lixeira"}
      </button>
    </footer>
  );
}
