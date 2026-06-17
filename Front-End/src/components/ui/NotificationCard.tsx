interface NotificationCardProps {
    title: string;
    description: string;
    time: string;
    isNew?: boolean;
    onClick?: () => void;
}

export default function NotificationCard({
    title,
    description,
    time,
    isNew,
    onClick,
}: NotificationCardProps) {
    return (
<button
      type="button"
      onClick={onClick}
      className={`
        relative w-full text-left p-4 sm:p-5
        border-b border-gray-100 last:border-none
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-600/20
        group
        ${
          isNew
            ? "bg-purple-50/40 hover:bg-purple-50/80" // Fundo sutil para itens novos
            : "bg-white hover:bg-gray-50"             // Fundo branco para itens lidos
        }
      `}
    >
      {/* BARRA LATERAL - Indicador de Novo */}
      {isNew && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r-md" />
      )}

      <div className="flex flex-col gap-1.5">
        {/* CABEÇALHO DA NOTIFICAÇÃO (Título + Tempo) */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <h4
              className={`
                text-sm sm:text-base truncate
                ${isNew ? "font-semibold text-gray-900" : "font-medium text-gray-700"}
              `}
            >
              {title}
            </h4>
            
            {/* PONTO (DOT) DE NOVO - Com leve brilho (shadow) para destacar */}
            {isNew && (
              <span className="w-2 h-2 rounded-full bg-purple-600 shadow-[0_0_6px_rgba(147,51,234,0.4)] shrink-0" />
            )}
          </div>

          {/* TEMPO - Movido para o topo à direita (Padrão SaaS) */}
          <span
            className={`
              text-xs whitespace-nowrap pt-0.5
              ${isNew ? "text-purple-600 font-medium" : "text-gray-400"}
            `}
          >
            {time}
          </span>
        </div>

        {/* DESCRIÇÃO */}
        <p
          className={`
            text-sm leading-relaxed line-clamp-2 pr-2
            ${isNew ? "text-gray-600" : "text-gray-500"}
          `}
        >
          {description}
        </p>
      </div>
    </button>
    );
}