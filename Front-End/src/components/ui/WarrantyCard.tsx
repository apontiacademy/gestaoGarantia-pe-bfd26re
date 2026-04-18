import React from 'react';
import { FileText, Files } from 'lucide-react';

interface WarrantyCardProps {
  title: string;
  status?: string;
  type: 'individual' | 'group';
  details: {
    label: string;
    value: string | number;
  }[];
  onViewMore?: () => void;
}

const WarrantyCard: React.FC<WarrantyCardProps> = ({ 
  title, 
  status = "Status", 
  type, 
  details, 
  onViewMore 
}) => {
  // Define o ícone baseado no tipo de card
  const Icon = type === 'individual' ? FileText : Files;

  return (
    <div className="bg-[#D9D9D9] rounded-lg p-4 shadow-sm mb-4 w-full max-w-md">
      {/* Header do Card */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Icon size={24} className="text-gray-700" />
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        </div>
        <span className="bg-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm">
          {status}
        </span>
      </div>

      {/* Detalhes/Conteúdo */}
      <div className="space-y-1 mb-4">
        {details.map((item, index) => (
          <p key={index} className="text-sm text-gray-700">
            <span className="font-bold">{item.label}:</span> {item.value}
          </p>
        ))}
      </div>

      {/* Botão Ver Mais */}
      <div className="flex justify-end">
        <button 
          onClick={onViewMore}
          className="border border-black rounded-full px-6 py-1 text-sm font-medium hover:bg-black hover:text-white transition-colors"
        >
          Ver Mais
        </button>
      </div>
    </div>
  );
};

export default WarrantyCard;