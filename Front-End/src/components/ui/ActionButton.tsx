import React from 'react';
import { Trash2, Pencil, Plus, type LucideIcon } from 'lucide-react';

// Definimos os tipos de variantes baseados no que a Priscila fez
type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ActionType = 'delete' | 'edit' | 'create';

interface ActionButtonProps {
  action: ActionType;
  variant: ButtonVariant;
  onClick?: () => void;
  label?: string; // Opcional, caso queira texto junto ao ícone
}

const ActionButton: React.FC<ActionButtonProps> = ({ action, variant, onClick, label }) => {
  
  // 1. Mapeamento de Ícones
  const icons: Record<ActionType, LucideIcon> = {
    delete: Trash2,
    edit: Pencil,
    create: Plus,
  };
  const Icon = icons[action];

  // 2. Mapeamento de Estilos (Variantes da Priscila)
  const variantStyles: Record<ButtonVariant, string> = {
    // Roxo degradê (Login)
    primary: "bg-gradient-to-r from-[#8A5CF5] to-[#B16CFA] text-white border-none",
    // Branco com borda (Salvar Garantia)
    secondary: "bg-white text-gray-800 border border-gray-300 shadow-sm",
    // Cinza (Cancelar)
    ghost: "bg-[#E0E0E0] text-gray-700 border-none hover:bg-gray-300",
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center gap-2 
        px-4 py-2 rounded-lg font-medium 
        transition-all active:scale-95 
        ${variantStyles[variant]}
      `}
    >
      <Icon size={20} />
      {label && <span>{label}</span>}
    </button>
  );
};

export default ActionButton;