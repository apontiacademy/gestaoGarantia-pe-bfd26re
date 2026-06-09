import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, rightIcon, onRightIconClick, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700 ml-1">
          {label}
        </label>

        <div className="relative w-full">
          <input
            ref={ref}
            id={inputId}
            className={`
            w-full px-4 py-2
            bg-white border border-gray 
            rounded-lg shadow-sm
            placeholder:text-gray-medium
            text-gray-dark
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-all
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red' : 'border-gray-medium'}
            ${className}
          `}
            {...props}
          />

          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-medium hover:text-gray-dark transition-colors"
            >
              {rightIcon}
            </button>
          )}
        </div>

        {/* Mensagem de erro caso exista */}
        {error && (
          <span className="text-xs text-red ml-1 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;