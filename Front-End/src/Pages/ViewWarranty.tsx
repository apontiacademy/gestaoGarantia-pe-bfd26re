import { useCallback, useMemo, useState } from "react";
import { FileQuestion } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import LayoutHome from "../layout/LayoutHome";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import WarrantyActions from "../components/warranty/WarrantyActions";
import WarrantyAttachmentsList from "../components/warranty/WarrantyAttachmentsList";
import WarrantyDetailView from "../components/warranty/WarrantyDetailView";
import WarrantyFormFields from "../components/warranty/WarrantyFormFields";
import { useWarranty } from "../contexts/WarrantyContext";
import { isWarrantyDeleted } from "../services/warrantyService";
import { useToast } from "../hooks/useToast";
import {
    formValuesToWarrantyUpdate,
    validateWarrantyForm,
    warrantyToFormValues,
    type WarrantyFormValues,
} from "../utils/warrantyForm";

export default function ViewWarranty() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { warranties, updateWarranty, moveToTrash, restoreFromTrash } =
        useWarranty();
    const { showToast } = useToast();

    const warranty = useMemo(
        () => (id ? warranties.find((w) => w.id === id) : undefined),
        [id, warranties]
    );

    const [isEditing, setIsEditing] = useState(false);
    const [draftValues, setDraftValues] = useState<WarrantyFormValues | null>(
        null
    );
    const [errors, setErrors] = useState<
        Partial<Record<keyof WarrantyFormValues, string>>
    >({});
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmTrashOpen, setConfirmTrashOpen] = useState(false);

    const isDeleted = warranty ? isWarrantyDeleted(warranty) : false;

    const handleBack = () => navigate("/home");

    const handleFieldChange = useCallback(
        <K extends keyof WarrantyFormValues>(
            field: K,
            value: WarrantyFormValues[K]
        ) => {
            setDraftValues((prev) => (prev ? { ...prev, [field]: value } : prev));
            setErrors((prev) => {
                if (!prev[field]) return prev;
                const next = { ...prev };
                delete next[field];
                return next;
            });
        },
        []
    );

    const handleStartEdit = () => {
        if (!warranty || isDeleted) return;
        setDraftValues(warrantyToFormValues(warranty));
        setErrors({});
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setDraftValues(null);
        setErrors({});
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!id || !draftValues) return;

        const validationErrors = validateWarrantyForm(draftValues);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showToast("Corrija os campos destacados antes de salvar.", "error");
            return;
        }

        setIsSaving(true);
        const result = updateWarranty(id, formValuesToWarrantyUpdate(draftValues));
        setIsSaving(false);

        if (result.success === false) {
            showToast(result.error, "error");
            return;
        }

        setDraftValues(null);

        setIsEditing(false);
        showToast("Salvo com sucesso!");
    };

    const handleConfirmTrash = async () => {
        if (!id) return;
        setIsDeleting(true);
        const result = await moveToTrash(id);
        setIsDeleting(false);
        setConfirmTrashOpen(false);

        if (result.success === false) {
            showToast(result.error, "error");
            return;
        }

        showToast("Garantia enviada para a lixeira.");
        navigate("/home");
    };

    const handleRestore = async () => {
        if (!id) return;
        setIsDeleting(true);
        const result = await restoreFromTrash(id);
        setIsDeleting(false);

        if (result.success === false) {
            showToast(result.error, "error");
            return;
        }

        showToast("Garantia restaurada com sucesso!");
        navigate("/home");
    };

    if (!id || !warranty) {
        return (
            <LayoutHome
                namePage="Garantia"
                showMenu={false}
                showNotification={false}
                showBack
                onBack={handleBack}
            >
                <EmptyState
                    icon={FileQuestion}
                    title="Garantia não encontrada"
                    description="Ela pode ter sido removida permanentemente ou o link está incorreto."
                />
                <div className="flex justify-center mt-6">
                    <Button variant="primary" type="button" onClick={handleBack}>
                        Voltar para Home
                    </Button>
                </div>
            </LayoutHome>
        );
    }

    return (
        <LayoutHome
            namePage="Garantia"
            showMenu={false}
            showNotification={false}
            showBack
            onBack={handleBack}
        >
            <div className="max-w-7xl mx-auto p-4 space-y-6">
                {isEditing && draftValues ? (
                    <>
                        <h2 className="text-lg font-semibold">Editar garantia</h2>
                        <WarrantyFormFields
                            values={draftValues}
                            errors={errors}
                            disabled={isSaving}
                            onChange={handleFieldChange}
                        />
                        {(warranty.attachments?.length ?? 0) > 0 ? (
                            <div className="border rounded-lg p-3">
                                <p className="font-medium mb-2">Arquivos anexados</p>
                                <WarrantyAttachmentsList attachments={warranty.attachments!} />
                            </div>
                        ) : null}
                    </>
                ) : (
                    <WarrantyDetailView warranty={warranty} />
                )}

                <WarrantyActions
                    isEditing={isEditing}
                    isDeleted={isDeleted}
                    isSaving={isSaving}
                    isDeleting={isDeleting}
                    onEdit={handleStartEdit}
                    onCancel={handleCancelEdit}
                    onSave={handleSave}
                    onDelete={() => setConfirmTrashOpen(true)}
                    onRestore={handleRestore}
                />
            </div>

            <ConfirmDialog
                open={confirmTrashOpen}
                title="Enviar para a lixeira?"
                description={`A garantia "${warranty.title}" será movida para a lixeira. Você poderá restaurá-la depois.`}
                confirmLabel="Enviar para lixeira"
                variant="danger"
                loading={isDeleting}
                onConfirm={handleConfirmTrash}
                onCancel={() => setConfirmTrashOpen(false)}
            />
        </LayoutHome>
    );
}
