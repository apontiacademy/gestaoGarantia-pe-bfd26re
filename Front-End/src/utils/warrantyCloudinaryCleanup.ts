import { deleteCloudinaryByToken } from "../services/cloudinaryService";
import type { WarrantyAttachment } from "../services/warrantyService";

/**
 * Remove notas fiscais do Cloudinary quando houver `deleteToken` (upload recente).
 * Sem token, só limpa referências locais — exclusão definitiva exige API no servidor.
 */
export async function deleteWarrantyAttachmentsFromCloudinary(
  attachments?: WarrantyAttachment[]
): Promise<void> {
  if (!attachments?.length) return;

  await Promise.allSettled(
    attachments.map(async (file) => {
      if (!file.deleteToken) return;
      try {
        await deleteCloudinaryByToken(file.deleteToken);
      } catch (err) {
        console.warn("Não foi possível excluir arquivo no Cloudinary:", err);
      }
    })
  );
}
