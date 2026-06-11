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
import { deleteWarrantyAttachmentsFromCloudinary } from "../utils/warrantyCloudinaryCleanup";
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
    const [attachmentToRemove, setAttachmentToRemove] = useState<string | null>(
        null
    );
    const [removingAttachmentId, setRemovingAttachmentId] = useState<
        string | null
    >(null);

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
        const result = await updateWarranty(
            id,
            formValuesToWarrantyUpdate(draftValues)
        );
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

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSave();
    };

    const handleRequestRemoveAttachment = (attachmentId: string) => {
        setAttachmentToRemove(attachmentId);
    };

    const handleConfirmRemoveAttachment = async () => {
        if (!id || !warranty || !attachmentToRemove) return;

        const file = warranty.attachments?.find((a) => a.id === attachmentToRemove);
        if (!file) {
            setAttachmentToRemove(null);
            return;
        }

        setRemovingAttachmentId(attachmentToRemove);
        try {
            await deleteWarrantyAttachmentsFromCloudinary([file]);

            const remaining =
                warranty.attachments?.filter((a) => a.id !== attachmentToRemove) ??
                [];

            const result = await updateWarranty(id, {
                attachments: remaining.length > 0 ? remaining : [],
            });

            if (result.success === false) {
                showToast(result.error, "error");
                return;
            }

            showToast("Anexo removido com sucesso.");
        } catch (err) {
            showToast(
                err instanceof Error
                    ? err.message
                    : "Não foi possível remover o anexo.",
                "error"
            );
        } finally {
            setRemovingAttachmentId(null);
            setAttachmentToRemove(null);
        }
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
                    <form onSubmit={handleSubmitEdit} className="space-y-6">
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
                                <WarrantyAttachmentsList
                                    attachments={warranty.attachments!}
                                    onRemove={handleRequestRemoveAttachment}
                                    removingId={removingAttachmentId}
                                />
                            </div>
                        ) : null}
                        <footer className="flex flex-wrap justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                disabled={isSaving || isDeleting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSaving || isDeleting}
                                className={isSaving ? "opacity-70" : ""}
                            >
                                {isSaving ? "Salvando..." : "Salvar alterações"}
                            </Button>
                        </footer>
                    </form>
                ) : (
                    <>
                        <WarrantyDetailView
                            warranty={warranty}
                            onRemoveAttachment={handleRequestRemoveAttachment}
                            removingAttachmentId={removingAttachmentId}
                        />
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
                    </>
                )}
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

            <ConfirmDialog
                open={attachmentToRemove != null}
                title="Remover anexo?"
                description="O arquivo será removido desta garantia. Essa ação não pode ser desfeita."
                confirmLabel="Remover anexo"
                variant="danger"
                loading={removingAttachmentId != null}
                onConfirm={handleConfirmRemoveAttachment}
                onCancel={() => setAttachmentToRemove(null)}
            />
        </LayoutHome>
    );
}
