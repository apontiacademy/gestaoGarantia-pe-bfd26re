import { uploadFileToCloudinary } from "../services/cloudinaryService";
import {
  type WarrantyAttachment,
  normalizeAttachment,
} from "../services/warrantyService";

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function isAcceptedAttachment(file: File): boolean {
  if (ACCEPTED_TYPES.has(file.type)) return true;
  const lower = file.name.toLowerCase();
  return (
    lower.endsWith(".pdf") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp")
  );
}

export async function fileToAttachment(file: File): Promise<WarrantyAttachment> {
  if (!isAcceptedAttachment(file)) {
    throw new Error("Envie a nota fiscal em PDF ou imagem (JPG, PNG ou WebP).");
  }

  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error("Arquivo muito grande. O limite é 10 MB.");
  }

  const uploaded = await uploadFileToCloudinary(file);

  return normalizeAttachment({
    id: crypto.randomUUID(),
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    url: uploaded.url,
    publicId: uploaded.publicId,
    resourceType: uploaded.resourceType,
    deleteToken: uploaded.deleteToken,
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
