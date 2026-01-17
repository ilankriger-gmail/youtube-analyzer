// ========== SECAO: COMPONENTE SELECT ==========

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, className = '', disabled, ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {label && (
          <label className="text-sm font-medium text-dark-300">{label}</label>
        )}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={`
              w-full appearance-none
              bg-dark-800 text-dark-100
              border border-dark-600 rounded-lg
              px-3 py-2 pr-10
              text-sm
              transition-colors duration-200
              hover:border-dark-500
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:cursor-not-allowed disabled:opacity-50
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none"
          />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
