import { ExternalLink, FileText, X } from "lucide-react";
import {
  getAttachmentUrl,
  type WarrantyAttachment,
} from "../../services/warrantyService";
import { formatFileSize } from "../../utils/warrantyAttachments";

interface WarrantyAttachmentsListProps {
  attachments: WarrantyAttachment[];
  className?: string;
  onRemove?: (attachmentId: string) => void;
  removingId?: string | null;
}

export default function WarrantyAttachmentsList({
  attachments,
  className = "",
  onRemove,
  removingId = null,
}: WarrantyAttachmentsListProps) {
  if (attachments.length === 0) {
    return (
      <p className="text-sm text-gray-dark/70">Nenhum arquivo anexado.</p>
    );
  }

  return (
    <ul className={`flex flex-col divide-y ${className}`}>
      {attachments.map((file) => {
        const href = getAttachmentUrl(file);
        const isPdf =
          file.mimeType === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf");
        const isRemote = href.startsWith("http");

        return (
          <li
            key={file.id}
            className="flex items-center justify-between gap-3 py-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={16} className="shrink-0 text-gray-dark/60" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-dark/60">
                  {formatFileSize(file.size)}
                  {isRemote ? " · Nuvem" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={isRemote && isPdf ? undefined : file.name}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Abrir
                  <ExternalLink size={14} />
                </a>
              ) : null}
              {onRemove ? (
                <button
                  type="button"
                  onClick={() => onRemove(file.id)}
                  disabled={removingId === file.id}
                  className="p-1 rounded text-red hover:text-red/60 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                  aria-label={`Remover ${file.name}`}
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
