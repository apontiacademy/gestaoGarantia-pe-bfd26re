import { isWarrantyDeleted, type Warranty } from "../../services/warrantyService";
import { formatCnpj } from "../../utils/cnpj";
import {
  formatDaysToExpireLabel,
  getWarrantyExpirationInfo,
  hasInformedFiscalValue,
  isInformedNfNumber,
  resolveWarrantyFiscalDisplay,
} from "../../utils/warrantyDisplay";
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

function formatWarrantyPeriodDays(days?: number): string | undefined {
  if (days == null || days <= 0) return undefined;
  if (days % 30 === 0 && days >= 30) {
    const months = days / 30;
    return months === 1 ? "1 mês" : `${months} meses`;
  }
  return days === 1 ? "1 dia" : `${days} dias`;
}

interface WarrantyDetailViewProps {
  warranty: Warranty;
  onRemoveAttachment?: (attachmentId: string) => void;
  removingAttachmentId?: string | null;
}

export default function WarrantyDetailView({
  warranty,
  onRemoveAttachment,
  removingAttachmentId = null,
}: WarrantyDetailViewProps) {
  const { status, daysToExpire } = getWarrantyExpirationInfo(warranty);
  const daysToExpireLabel = formatDaysToExpireLabel(daysToExpire, status);
  const hasExtendedWarranty =
    warranty.warrantyType?.toLowerCase().includes("estendida") ?? false;
  const inTrash = isWarrantyDeleted(warranty);

  const fiscal = resolveWarrantyFiscalDisplay(warranty);
  const showFiscalValue = hasInformedFiscalValue(warranty);
  const nfNumberLabel = isInformedNfNumber(warranty.nfNumber)
    ? warranty.nfNumber
    : "Número não informado";
  const warrantyPeriodLabel = formatWarrantyPeriodDays(
    warranty.warrantyPeriodDays
  );

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
          <p className="text-sm text-gray-dark mt-1 break-all" title={nfNumberLabel}>
            Nº da nota:{" "}
            <span
              className={
                isInformedNfNumber(warranty.nfNumber)
                  ? "font-medium"
                  : "italic text-gray-dark/70"
              }
            >
              {nfNumberLabel}
            </span>
          </p>
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
            <DetailRow
              label="Prazo de vencimento"
              value={warranty.expirationDate}
            />
            {daysToExpireLabel ? (
              <DetailRow label="Vence em" value={daysToExpireLabel} />
            ) : null}
            <DetailRow
              label="Prazo da garantia"
              value={warrantyPeriodLabel}
            />
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
            {hasExtendedWarranty ? (
              <DetailRow
                label="Número da garantia estendida"
                value={
                  warranty.extendedWarrantyNumber?.trim() ||
                  "Número não informado"
                }
              />
            ) : null}
            <DetailRow label="Quantidade" value={warranty.quantity} />
          </dl>

          {showFiscalValue ? (
            <div className="mt-4 space-y-3">
              {fiscal.unitValue ? (
                <div>
                  <p className="text-sm text-gray-500">Valor unitário</p>
                  <p className="text-2xl font-bold text-green-600">{fiscal.unitValue}</p>
                </div>
              ) : null}
              {fiscal.showTotalValue && fiscal.totalValue ? (
                <div>
                  <p className="text-sm text-gray-500">Valor total</p>
                  <p className="text-2xl font-bold text-green-600">{fiscal.totalValue}</p>
                </div>
              ) : null}
              {!fiscal.unitValue && fiscal.totalValue && !fiscal.showTotalValue ? (
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="text-2xl font-bold text-green-600">{fiscal.totalValue}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Valor</p>
              <p className="text-base italic text-gray-dark/70">Valor não informado</p>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="border rounded-lg p-3">
            <p className="font-medium mb-2">Arquivos</p>
            <WarrantyAttachmentsList
              attachments={warranty.attachments ?? []}
              onRemove={!inTrash ? onRemoveAttachment : undefined}
              removingId={removingAttachmentId}
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
