import React from 'react';

interface WarrantyCardProps {
  title: string;
  story?: string;
  status?: string;
  nfNumber?: string; //numero da nota fiscal

  purchaseDate?: string; // data de compra
  expirationDate?: string; //data de vencimento
  daysToExpire?: number | string; //prazo para expirar
  warrantyType?: string; //tipo de garantia (de fabrica ou extendida)
  value?: string; //valor da garantia/aparelho

  variant: 'home' | 'trash'; // variação do card para lixeira ou home
  onViewMore?: () => void; //ver mais (home)
  onRestore?: () => void; //restaurar (lixiera)

  selected?: boolean; //select para quadno estiver na lixeira
  onSelect?: (selected: boolean) => void;
}

const WarrantyCard: React.FC<WarrantyCardProps> = ({
  title,
  story,
  status,
  nfNumber,
  purchaseDate,
  expirationDate,
  daysToExpire,
  warrantyType,
  value,
  variant,
  onViewMore,
  onRestore,
  selected = false,
  onSelect,
}) => {

  // Verifica se há algum campo de detalhe para renderizar o bloco do meio
  const hasDetails = purchaseDate || expirationDate || daysToExpire !== undefined || warrantyType;

  // Verifica se há alguma info no lado direito do header
  const hasHeaderRight = variant === 'trash' || status || nfNumber;

  // Verifica se há valor para exibir no rodapé
  const hasFooter = value || variant === 'home' || variant === 'trash';

  const statusColor =
    status === 'Ativo' ? 'text-green' :
    status === 'A vencer' ? 'text-yellow' :
    status === 'Vencida' ? 'text-red' :
    '';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray w-full max-w-md">

      {/* Header do Card */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-dark">{title}</h3>
          {story && (
            <p className="text-sm text-gray-500 italic">{story}</p>
          )}
        </div>

        {hasHeaderRight && (
          <div className="flex flex-col items-end gap-1">
            {variant === 'trash' && (
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onSelect?.(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 accent-gray-700 cursor-pointer"
              />
            )}
            {status && (
              <span className={`text-sm font-semibold ${statusColor}`}>{status}</span>
            )}
            {nfNumber && (
              <span className="text-xs text-gray-500">Nº da nota: {nfNumber}</span>
            )}
          </div>
        )}
      </div>

      {/* Detalhes */}
      {hasDetails && (
        <>
          <div className="border-t border-gray-100 mb-3" />
          <div className="space-y-1 mb-3">
            {purchaseDate && (
              <p className="text-sm text-gray-dark">
                <span className="font-bold">Data De Compra:</span> {purchaseDate}
              </p>
            )}
            {expirationDate && (
              <p className="text-sm text-gray-dark">
                <span className="font-bold">Data De Vencimento:</span> {expirationDate}
              </p>
            )}
            {daysToExpire !== undefined && (
              <p className="text-sm text-gray-dark">
                <span className="font-bold">Vence:</span> {daysToExpire} dias para expirar
              </p>
            )}
            {warrantyType && (
              <p className="text-sm text-gray-dark">
                <span className="font-bold">Tipo de Garantia:</span> {warrantyType}
              </p>
            )}
          </div>
        </>
      )}

      {/* Rodapé */}
      {hasFooter && (
        <>
          <div className="border-t border-gray-100 mb-3" />
          <div className="flex justify-between items-center">
            {value ? (
              <p className="text-sm text-gray-dark font-medium"><span className='font-bold'>Valor R$ </span>{value}</p>
            ) : (
              <span />
            )}

            {/* Botão Ver Mais */}
            {variant === 'home' && (
              <button
                onClick={onViewMore}
                className="border border-black rounded-full px-6 py-1 text-sm font-medium hover:bg-black hover:text-white transition-colors"
              >
                Ver Mais
              </button>
            )}

            {/* Botão Restaurar */}
            {variant === 'trash' && (
              <button
                onClick={onRestore}
                className="border border-black rounded-full px-6 py-1 text-sm font-medium hover:bg-black hover:text-white transition-colors"
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