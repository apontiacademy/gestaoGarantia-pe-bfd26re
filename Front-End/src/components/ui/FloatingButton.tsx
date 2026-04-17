import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface FloatingButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ 
  icon: Icon, 
  onClick, 
  ariaLabel,
  className 
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        flex items-center justify-center 
        w-14 h-14 
        bg-[#FFE796] hover:bg-[#DB9200] 
        text-black 
        rounded-full 
        shadow-lg 
        transition-all duration-200 
        active:scale-95
        ${className}
      `}
    >
      <Icon size={28} strokeWidth={2.5} />
    </button>
  );
};

export default FloatingButton;