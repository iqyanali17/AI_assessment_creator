import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'sidebar-glow' | 'fab';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 outline-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none',
          {
            'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] rounded-full':
              variant === 'primary',
            'border border-[#d1d5db] text-[#1a1a1a] bg-white hover:bg-[#f5f5f5] rounded-full':
              variant === 'outline',
            'bg-[#1a1a1a] text-white rounded-full ring-1 ring-brandOrange hover:ring-2 hover:shadow-brand-glow':
              variant === 'sidebar-glow',
            'bg-white text-brandOrange border border-[#e5e5e5] hover:scale-105 shadow-md hover:shadow-lg rounded-full':
              variant === 'fab',
          },
          {
            'px-4 py-1.5 text-xs gap-1.5': size === 'sm',
            'px-6 py-2.5 text-sm gap-2': size === 'md' && variant !== 'fab',
            'px-8 py-3.5 text-base gap-2': size === 'lg',
            'h-14 w-14 text-3xl p-0': variant === 'fab',
            'h-10 w-10 text-xl p-0': size === 'icon' && variant !== 'fab',
          }
        ),
        className
      )}
      {...props}
    >
      {icon && (
        <span className={clsx('flex items-center', children ? 'mr-1.5' : '')}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};
