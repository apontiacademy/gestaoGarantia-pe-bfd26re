import React from 'react';

// Tipagem dos status
export type FilterStatus = 'todos' | 'ativos' | 'expirados' | 'proximos';

interface StatusFilterProps {
  currentFilter: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ currentFilter, onFilterChange }) => {
  
  
  const options: { id: FilterStatus; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'ativos', label: 'Ativos' },
    { id: 'expirados', label: 'Expirados' },
    { id: 'proximos', label: 'Próximos do fim' },
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-[#1E1E1E] rounded-xl w-fit border border-white/5">
      {options.map((option) => {
        const isActive = currentFilter === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => onFilterChange(option.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
              ${isActive 
                ? 'bg-gradient-to-r from-[var(--color-primary-start)] to-[var(--color-primary-end)] text-white shadow-md scale-105' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default StatusFilter;