import React from 'react';
import Image from 'next/image';

export interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', iconOnly = false }) => {
  return (
    <div className={`flex items-center select-none min-w-0 ${className}`}>
      <div className="relative shrink-0">
        <Image
          src="/Assests/image.png"
          alt="Logo"
          width={iconOnly ? 40 : 140}
          height={40}
          className="object-contain md:w-[140px] w-[110px]"
          priority
        />
      </div>
    </div>
  );
};
