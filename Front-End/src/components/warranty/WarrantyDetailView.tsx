import { isWarrantyDeleted, type Warranty } from "../../services/warrantyService";
import { formatCnpj } from "../../utils/cnpj";
import { getWarrantyStatus } from "../../utils/warrantyStatus";
import WarrantyAttachmentsList from "./WarrantyAttachmentsList";

function statusDotClass(status: string): string {
  switch (status) {
    case "Ativo":
      return "bg-green-500";
    case "A vencer":
      return "bg-yellow-500";
    case "Vencida":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

function statusTextClass(status: string): string {
  switch (status) {
    case "Ativo":
      return "text-green-600";
    case "A vencer":
      return "text-yellow-600";
    case "Vencida":
      return "text-red-500";
    default:
      return "text-gray-dark";
  }
}

function statusLabel(status: string): string {
  if (status === "Vencida") return "Garantia vencida";
  if (status === "A vencer") return "Garantia a vencer";
  return "Garantia ativa";
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-medium inline">{label}: </dt>
      <dd className="inline">{value}</dd>
    </div>
  );
}

interface WarrantyDetailViewProps {
  warranty: Warranty;
}

export default function WarrantyDetailView({ warranty }: WarrantyDetailViewProps) {
  const { status } = getWarrantyStatus(warranty);
  const hasExtendedWarranty =
    warranty.warrantyType?.toLowerCase().includes("estendida") ?? false;
  const inTrash = isWarrantyDeleted(warranty);

  return (
    <>
      {inTrash ? (
        <div
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Esta garantia está na lixeira. Restaure para editá-la novamente na Home.
        </div>
      ) : null}

      <header className="flex items-start justify-between border-b pb-4 gap-4 min-w-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold wrap-break-word">{warranty.title}</h1>
          {warranty.nfNumber ? (
            <p className="text-sm text-gray-dark mt-1 break-all" title={warranty.nfNumber}>
              Nº da nota:{" "}
              <span className="font-medium">{warranty.nfNumber}</span>
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`w-3 h-3 rounded-full ${statusDotClass(status)}`}
            aria-hidden
          />
          <p className={`text-sm font-medium ${statusTextClass(status)}`}>
            {statusLabel(status)}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">Detalhes</h2>
          <dl className="space-y-2 text-sm">
            <DetailRow label="Data da compra" value={warranty.purchaseDate} />
            <DetailRow label="Vencimento" value={warranty.expirationDate} />
            <DetailRow label="Loja" value={warranty.story} />
            <DetailRow
              label="CNPJ da loja"
              value={
                warranty.storeCnpj ? formatCnpj(warranty.storeCnpj) : undefined
              }
            />
            <DetailRow label="Tipo de garantia" value={warranty.warrantyType} />
            <div>
              <dt className="font-medium inline">Garantia estendida: </dt>
              <dd className="inline">{hasExtendedWarranty ? "Sim" : "Não"}</dd>
            </div>
            <DetailRow label="Quantidade" value={warranty.quantity} />
          </dl>

          {warranty.value ? (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Valor</p>
              <p className="text-2xl font-bold text-green-600">{warranty.value}</p>
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="border rounded-lg p-3">
            <p className="font-medium mb-2">Arquivos</p>
            <WarrantyAttachmentsList
              attachments={warranty.attachments ?? []}
            />
          </div>

          <div>
            <p className="font-medium mb-1">Observações</p>
            <p className="text-sm text-gray-dark/80 whitespace-pre-wrap border rounded-lg p-3 bg-gray-50 min-h-24">
              {warranty.notes?.trim() || "Nenhuma observação adicionada"}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
