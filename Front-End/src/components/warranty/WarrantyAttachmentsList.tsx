import { ExternalLink, FileText } from "lucide-react";
import {
  getAttachmentUrl,
  type WarrantyAttachment,
} from "../../services/warrantyService";
import { formatFileSize } from "../../utils/warrantyAttachments";

interface WarrantyAttachmentsListProps {
  attachments: WarrantyAttachment[];
  className?: string;
}

export default function WarrantyAttachmentsList({
  attachments,
  className = "",
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
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                download={isRemote && isPdf ? undefined : file.name}
                className="flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
              >
                Abrir
                <ExternalLink size={14} />
              </a>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
