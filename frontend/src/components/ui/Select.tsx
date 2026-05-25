import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'filled';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      className,
      variant = 'default',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-neutral-600 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={twMerge(
              clsx(
                'w-full rounded-xl text-sm font-medium text-neutral-800 outline-none transition-all duration-200 appearance-none cursor-pointer pr-10 px-4 py-3',
                {
                  'bg-white border border-neutral-200 focus:border-brandOrange focus:ring-2 focus:ring-brandOrange/10':
                    variant === 'default',
                  'bg-neutral-50 border border-transparent focus:bg-white focus:border-brandOrange focus:ring-2 focus:ring-brandOrange/10':
                    variant === 'filled',
                  'border-red-400 focus:border-red-500 focus:ring-red-500/10':
                    !!error,
                }
              ),
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
        {error && (
          <span className="text-[11px] font-medium text-red-500 tracking-wide">
            {error}
          </span>
        )}
        {hint && !error && (
          <span className="text-[11px] font-medium text-neutral-400 tracking-wide">
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
