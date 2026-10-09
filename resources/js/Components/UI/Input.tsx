import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconClick,
  fullWidth = true,
  className = '',
  id,
  disabled,
  ...rest
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`${fullWidth ? 'w-full' : 'inline-block'} mb-3`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-2 text-base sm:text-lg font-extrabold text-gray-900 select-none"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-2xl shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={`
            w-full rounded-2xl border-2 transition-colors duration-150
            /* Ukuran Jumbo Ramah Orang Tua & Anti Auto-Zoom iOS */
            min-h-[56px] text-lg sm:text-xl font-bold
            ${leftIcon ? 'pl-12' : 'pl-4'}
            ${rightIcon ? 'pr-12' : 'pr-4'}
            py-3 text-gray-900 placeholder-gray-400
            ${error
              ? 'border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-200 bg-rose-50'
              : 'border-gray-300 hover:border-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 bg-white'
            }
            disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed
            touch-manipulation ${className}
          `}
          {...rest}
        />

        {rightIcon && (
          <div
            onClick={onRightIconClick}
            className={`absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 ${
              onRightIconClick ? 'cursor-pointer hover:text-gray-800' : 'pointer-events-none'
            }`}
          >
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-2 text-base font-bold text-rose-600 flex items-center gap-1.5 animate-fadeIn">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-sm sm:text-base font-medium text-gray-600">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
