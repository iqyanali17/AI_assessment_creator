import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'circle' | 'rounded';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'avatar',
  fallback,
  size = 'md',
  className,
  variant = 'circle',
}) => {
  const [error, setError] = React.useState(false);

  return (
    <div
      className={twMerge(
        clsx(
          "relative flex items-center justify-center overflow-hidden bg-orange-100 text-brandOrange font-semibold border border-gray-100 shrink-0",
          {
            "rounded-full": variant === 'circle',
            "rounded-2xl": variant === 'rounded',
          },
          {
            "w-8 h-8 text-xs": size === 'sm',
            "w-10 h-10 text-sm": size === 'md',
            "w-12 h-12 text-base": size === 'lg',
            "w-14 h-14 text-lg": size === 'xl',
          }
        ),
        className
      )}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="select-none uppercase">{fallback.slice(0, 2)}</span>
      )}
    </div>
  );
};
