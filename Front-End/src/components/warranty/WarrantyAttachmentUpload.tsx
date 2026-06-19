import { FileCheck, Upload, X } from "lucide-react";
import { useRef } from "react";

interface WarrantyAttachmentUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  label?: string;
}

export default function WarrantyAttachmentUpload({
  files,
  onChange,
  disabled = false,
  label = "Nota Fiscal (PDF ou Imagem)",
}: WarrantyAttachmentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (!event.target.files?.length) return;
    const selectedFiles = Array.from(event.target.files);
    onChange([...files, ...selectedFiles]);
    event.target.value = "";
  }

  function removeFile(indexToRemove: number): void {
    onChange(files.filter((_, index) => index !== indexToRemove));
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>

      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all border-gray-medium mb-2 ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:border-primary hover:bg-gray-50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf"
          multiple
          disabled={disabled}
        />

        <Upload className="text-gray-medium mb-2" size={32} />
        <span className="text-sm text-gray-medium text-center">
          Clique para anexar notas fiscais (vários arquivos aceitos)
        </span>
      </div>

      {files.length > 0 ? (
        <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between w-full border border-green-300 bg-green-50 rounded-lg p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileCheck className="text-green-600 shrink-0" size={24} />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-gray-dark truncate max-w-45">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-medium">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              </div>

              {!disabled ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 hover:bg-red-100 rounded-full text-red-500 transition-colors shrink-0"
                  aria-label={`Remover ${file.name}`}
                >
                  <X size={20} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
