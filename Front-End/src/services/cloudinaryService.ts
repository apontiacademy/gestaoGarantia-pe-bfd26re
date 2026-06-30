const CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "dkbitjnsc";
const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "aponti_perfil";

type CloudinaryResourceType = "image" | "raw";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  resourceType: CloudinaryResourceType;
  /** Válido ~10 min após upload (preset com "Return delete token") */
  deleteToken?: string;
}

function isPdfFile(file: File): boolean {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

function resolveResourceType(file: File): CloudinaryResourceType {
  return isPdfFile(file) ? "raw" : "image";
}

async function uploadToCloudinary(
  file: File,
  resourceType: CloudinaryResourceType
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      body
        ? `Erro ao enviar arquivo para a nuvem: ${body.slice(0, 120)}`
        : "Erro ao enviar arquivo para a nuvem."
    );
  }

  const data = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    resource_type?: string;
    delete_token?: string;
  };

  if (!data.secure_url || !data.public_id) {
    throw new Error("Upload concluído, mas os dados do arquivo não foram retornados.");
  }

  const uploadedType: CloudinaryResourceType =
    data.resource_type === "raw" || resourceType === "raw" ? "raw" : "image";

  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: uploadedType,
    deleteToken: data.delete_token,
  };
}

/** Extrai public_id da URL do Cloudinary (garantias antigas sem metadado). */
export function parseCloudinaryAssetFromUrl(
  url: string
): { publicId: string; resourceType: CloudinaryResourceType } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("cloudinary.com")) return null;

    const segments = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = segments.indexOf("upload");
    if (uploadIndex === -1) return null;

    const resourceType: CloudinaryResourceType = segments.includes("raw")
      ? "raw"
      : "image";

    let index = uploadIndex + 1;
    while (index < segments.length) {
      const part = segments[index];
      if (/^v\d+$/.test(part)) {
        index += 1;
        continue;
      }
      if (part.includes(",")) {
        index += 1;
        continue;
      }
      break;
    }

    const pathWithExt = segments.slice(index).join("/");
    if (!pathWithExt) return null;

    const publicId = decodeURIComponent(pathWithExt).replace(/\.[^/.]+$/, "");
    if (!publicId) return null;

    return { publicId, resourceType };
  } catch {
    return null;
  }
}

/**
 * Exclusão no Cloudinary sem back-end: só funciona com `delete_token` do upload
 * (preset unsigned → Advanced → Return delete token = Yes; válido ~10 min).
 */
export async function deleteCloudinaryByToken(deleteToken: string): Promise<void> {
  const formData = new FormData();
  formData.append("token", deleteToken);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error("Não foi possível excluir o arquivo no Cloudinary.");
  }
}

/** Upload de foto de perfil (imagem). */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const result = await uploadToCloudinary(file, "image");
  return result.url;
}

/** Upload de nota fiscal — imagem ou PDF. */
export async function uploadFileToCloudinary(
  file: File
): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(file, resolveResourceType(file));
}
