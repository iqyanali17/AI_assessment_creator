import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'filled';
  maxLength?: number;
  showCount?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      hint,
      className,
      variant = 'default',
      maxLength,
      showCount = false,
      value,
      id,
      ...props
    },
    ref
  ) => {
    const textAreaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textAreaId}
            className="text-xs font-semibold text-neutral-600 tracking-wide"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textAreaId}
          value={value}
          maxLength={maxLength}
          className={twMerge(
            clsx(
              'w-full rounded-xl text-sm font-medium text-neutral-800 outline-none transition-all duration-200 placeholder:text-neutral-400 resize-none px-4 py-3 min-h-[100px]',
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
        />
        <div className="flex items-center justify-between">
          <div>
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
          {showCount && maxLength && (
            <span className="text-[10px] font-medium text-neutral-400 tracking-wide">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
