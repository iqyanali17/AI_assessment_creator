import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className,
      variant = 'default',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-neutral-600 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              clsx(
                'w-full rounded-xl text-sm font-medium text-neutral-800 outline-none transition-all duration-200 placeholder:text-neutral-400',
                {
                  'bg-white border border-neutral-200 focus:border-brandOrange focus:ring-2 focus:ring-brandOrange/10':
                    variant === 'default',
                  'bg-neutral-50 border border-transparent focus:bg-white focus:border-brandOrange focus:ring-2 focus:ring-brandOrange/10':
                    variant === 'filled',
                  'border-red-400 focus:border-red-500 focus:ring-red-500/10': !!error,
                  'pl-10': !!leftIcon,
                  'pr-10': !!rightIcon,
                  'px-4 py-3': !leftIcon && !rightIcon,
                  'pl-4 py-3': !leftIcon && !!rightIcon,
                  'pr-4 py-3': !!leftIcon && !rightIcon,
                }
              ),
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-neutral-400">
              {rightIcon}
            </span>
          )}
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

Input.displayName = 'Input';
