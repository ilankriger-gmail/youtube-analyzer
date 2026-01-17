// ========== SECAO: COMPONENTE CHECKBOX ==========

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', disabled, checked, ...props }, ref) => {
    return (
      <label
        className={`
          inline-flex items-center gap-2 cursor-pointer
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          ${className}
        `}
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
              w-5 h-5 rounded border-2 transition-colors duration-200
              flex items-center justify-center
              ${
                checked
                  ? 'bg-primary-600 border-primary-600'
                  : 'bg-dark-800 border-dark-600 hover:border-dark-500'
              }
              peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2 peer-focus:ring-offset-dark-900
            `}
          >
            {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
        </div>
        {label && (
          <span className="text-sm text-dark-200 select-none">{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
