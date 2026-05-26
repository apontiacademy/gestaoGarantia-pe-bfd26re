const CLOUD_NAME = "dkbitjnsc";
const UPLOAD_PRESET = "aponti_perfil"; // vou te explicar como criar esse preset abaixo

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error("Erro ao fazer upload da imagem.");
  }

  const data = await response.json();
  return data.secure_url; // URL pública da imagem
}