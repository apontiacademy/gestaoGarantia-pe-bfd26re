import React from "react";
import { getWarrantyStatus } from "../../utils/warrantyStatus";

interface WarrantyCardProps {
  title: string;
  story?: string;
  nfNumber?: string; //numero da nota fiscal

  purchaseDate?: string; // data de compra
  expirationDate?: string; //data de vencimento
  warrantyType?: string; //tipo de garantia (de fabrica ou extendida)
  value?: string; //valor da garantia/aparelho
  status?: string;
  daysToExpire?: number | null;

  variant: "home" | "trash"; // variação do card para lixeira ou home
  onViewMore?: () => void; //ver mais (home)
  onRestore?: () => void; //restaurar (lixiera)

  selected?: boolean; //select para quadno estiver na lixeira
  onSelect?: (selected: boolean) => void;
  warrantyId?: string;
}

const WarrantyCard: React.FC<WarrantyCardProps> = ({
  title,
  story,
  nfNumber,
  purchaseDate,
  expirationDate,
  warrantyType,
  value,
  status: statusProp,
  daysToExpire: daysToExpireProp,
  variant,
  onViewMore,
  onRestore,
  selected = false,
  onSelect,
  warrantyId,
}) => {
  const warrantyInfo = getWarrantyStatus({
    expirationDate,
    status: statusProp,
    daysToExpire: daysToExpireProp,
  });

  const currentStatus = warrantyInfo.status;
  const currentDaysToExpire = warrantyInfo.daysToExpire;

  // Verifica se há algum campo de detalhe para renderizar o bloco do meio
  const hasDetails =
    purchaseDate ||
    expirationDate ||
    currentDaysToExpire !== undefined ||
    warrantyType;

  // Verifica se há alguma info no lado direito do header (status / checkbox)
  const hasHeaderRight = variant === "trash" || currentStatus;

  // Verifica se há valor para exibir no rodapé
  const hasFooter = value || variant === "home" || variant === "trash";

  const statusColor =
    currentStatus === "Ativo"
      ? "text-green"
      : currentStatus === "A vencer"
        ? "text-yellow"
        : currentStatus === "Vencida"
          ? "text-red"
          : "";

  return (
    <div className="group rounded-2xl p-4 shadow-sm border border-gray-dark/20 w-full min-w-0 max-w-full bg-white overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-gray-dark/35">
      {/* Header do Card */}
      <div className="mb-3 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg text-gray-dark transition-colors duration-200 group-hover:text-black leading-snug wrap-break-word">
              {title}
            </h3>
            {story ? (
              <p className="text-sm italic text-gray-dark/85 mt-1 wrap-break-word">
                {story}
              </p>
            ) : null}
          </div>

          {hasHeaderRight && (
            <div className="flex flex-col items-end gap-1 shrink-0">
              {variant === "trash" && (
                <input
                  id={warrantyId ? `warranty-select-${warrantyId}` : undefined}
                  name={warrantyId ? `warranty-select-${warrantyId}` : undefined}
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => onSelect?.(e.target.checked)}
                  aria-label={`Selecionar garantia ${title}`}
                  className="w-5 h-5 rounded border-gray-dark/60 accent-gray-dark cursor-pointer"
                />
              )}
              {currentStatus && (
                <span className={`text-sm font-semibold whitespace-nowrap ${statusColor}`}>
                  {currentStatus}
                </span>
              )}
            </div>
          )}
        </div>

        {nfNumber ? (
          <p
            className="text-xs font-medium text-gray-dark/90 mt-2 break-all leading-relaxed"
            title={`Nº da nota: ${nfNumber}`}
          >
            Nº da nota: {nfNumber}
          </p>
        ) : null}
      </div>

      {/* Detalhes */}
      {hasDetails && (
        <>
          <div className="border-t border-gray/90 mb-3 transition-colors duration-200 group-hover:border-gray" />
          <div className="space-y-1 mb-3 min-w-0">
            {purchaseDate && (
              <p className="text-sm text-gray-dark wrap-break-word">
                <span className="font-semibold">Data De Compra:</span>{" "}
                {purchaseDate}
              </p>
            )}
            {expirationDate && (
              <p className="text-sm text-gray-dark wrap-break-word">
                <span className="font-semibold">Data De Vencimento:</span>{" "}
                {expirationDate}
              </p>
            )}
            {currentStatus === "Vencida" ? (
              <p className="text-sm text-gray-dark wrap-break-word">
                <span className="font-semibold">Vence:</span>{" "}
                <span className="text-red/90 font-semibold">
                  Garantia vencida
                </span>
              </p>
            ) : currentDaysToExpire !== null ? (
              <p className="text-sm text-gray-dark wrap-break-word">
                <span className="font-semibold">Vence:</span> {currentDaysToExpire}{" "}
                dias para expirar
              </p>
            ) : null}
            {warrantyType && (
              <p className="text-sm text-gray-dark wrap-break-word">
                <span className="font-semibold">Tipo de Garantia:</span>{" "}
                {warrantyType}
              </p>
            )}
          </div>
        </>
      )}

      {/* Rodapé */}
      {hasFooter && (
        <>
          <div className="border-t border-gray/90 mb-3 transition-colors duration-200 group-hover:border-gray" />
          <div className="flex justify-between items-center gap-3 min-w-0">
            {value ? (
              <p className="text-sm text-gray-dark font-medium min-w-0 wrap-break-word">
                <span className="font-semibold">Valor </span>
                {value}
              </p>
            ) : (
              <span className="min-w-0 flex-1" />
            )}

            {/* Botão Ver Mais */}
            {variant === "home" && (
              <button
                onClick={onViewMore}
                className="shrink-0 border border-black rounded-full px-4 sm:px-6 py-1 text-sm font-medium hover:bg-black hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                Ver Mais
              </button>
            )}

            {/* Botão Restaurar */}
            {variant === "trash" && (
              <button
                onClick={onRestore}
                className="shrink-0 border border-green/80 text-green rounded-full px-4 sm:px-6 py-1 text-sm font-medium hover:bg-green/80 hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                Restaurar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WarrantyCard;
