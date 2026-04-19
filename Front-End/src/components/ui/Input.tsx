import { forwardRef,type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-semibold text-gray-700 ml-1">
          {label}
        </label>
        
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5
            bg-white border border-gray-300 
            rounded-lg shadow-sm
            placeholder:text-gray-400
            text-gray-900
            focus:outline-none focus:ring-2 focus:ring-[#8A5CF5] focus:border-transparent
            transition-all
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />

        {/* Mensagem de erro caso exista */}
        {error && (
          <span className="text-xs text-red-500 ml-1 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;