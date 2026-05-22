import type { WarrantyAttachment } from "../services/warrantyService";

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Falha ao ler o arquivo."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

export async function fileToAttachment(file: File): Promise<WarrantyAttachment> {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error("Arquivo muito grande. O limite é 5 MB.");
  }

  const dataUrl = await readFileAsDataURL(file);
  return {
    id: crypto.randomUUID(),
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    dataUrl,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
