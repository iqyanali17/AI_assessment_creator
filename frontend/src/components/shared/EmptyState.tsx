import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  onCreateAssignment?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateAssignment }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-5 py-6 md:p-12 w-full max-w-[480px] mx-auto select-none">
      <div className="w-full mb-6 md:mb-8 flex justify-center -mt-[35px]">
        <svg
          viewBox="0 0 500 460"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-[300px] md:max-w-[400px] h-auto"
        >
          <circle cx="245" cy="235" r="168" fill="white" />
          <g transform="translate(72, 138) scale(0.88)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M49.3144 30.5997C49.2956 29.1736 49.1167 27.7353 48.7589 26.2871C47.5042 21.2051 41.9064 17.9424 35.9484 17.1753C29.9927 16.4082 23.7993 18.1538 21.4123 22.5745C20.047 25.102 19.8587 27.2804 20.4166 29.1171C20.9721 30.9439 22.2903 32.4584 24.0793 33.6385C29.0675 36.9258 37.8034 37.597 41.7887 36.2226C43.6319 35.5858 45.4327 34.8188 47.1864 33.941C46.1836 39.6869 42.4477 45.1304 37.4619 50.0355C26.6264 60.6963 9.81169 68.7877 0.654562 71.7627C0.162573 71.9225 -0.110516 72.4684 0.0424948 72.9822C0.195506 73.4961 0.718088 73.7838 1.21008 73.624C10.5485 70.59 27.6905 62.3264 38.7402 51.4541C44.4487 45.8385 48.5164 39.5173 49.2109 32.8715C62.1156 25.67 72.7134 12.6046 81.774 1.60946C82.1106 1.20378 82.0659 0.586634 81.6751 0.235044C81.2844 -0.114088 80.6958 -0.0698511 80.3592 0.338289C71.6681 10.8835 61.5812 23.4277 49.3144 30.5997ZM47.4383 31.6446C47.509 30.0415 47.3582 28.4139 46.951 26.7715C45.8658 22.3729 40.8776 19.7717 35.72 19.1078C32.5585 18.7021 29.3077 19.0365 26.7583 20.2265C25.1552 20.974 23.8345 22.0582 23.0389 23.5334C21.9937 25.4684 21.7677 27.1231 22.1961 28.527C22.6245 29.9407 23.6887 31.0766 25.0752 31.9888C29.6208 34.9859 37.575 35.6227 41.2025 34.3713C43.3423 33.6337 45.4186 32.7141 47.4383 31.6446Z"
              fill="#011625"
            />
          </g>
          <rect x="148" y="108" width="148" height="210" rx="18" fill="white" />
          <rect x="172" y="136" width="62" height="14" rx="7" fill="#1a2744" />
          <rect x="172" y="164" width="100" height="11" rx="5.5" fill="#c4c6d2" />
          <rect x="172" y="183" width="100" height="11" rx="5.5" fill="#c4c6d2" />
          <rect x="172" y="202" width="100" height="11" rx="5.5" fill="#c4c6d2" />
          <rect x="172" y="221" width="76" height="11" rx="5.5" fill="#c4c6d2" />
          <rect x="172" y="240" width="88" height="11" rx="5.5" fill="#c4c6d2" />
          <rect x="172" y="259" width="64" height="11" rx="5.5" fill="#c4c6d2" />
          <rect x="330" y="112" width="104" height="54" rx="14" fill="white" />
          <circle cx="354" cy="139" r="11" fill="#c4c6d2" />
          <rect x="372" y="130" width="46" height="18" rx="9" fill="#c4c6d2" />
          <circle cx="272" cy="262" r="88" fill="#b4b8d0" />
          <circle cx="272" cy="262" r="76" fill="#eceef8" />
          <path d="M242 232 L302 292" stroke="#f03535" strokeWidth="22" strokeLinecap="round" />
          <path d="M302 232 L242 292" stroke="#f03535" strokeWidth="22" strokeLinecap="round" />
          <rect
            x="342"
            y="326"
            width="26"
            height="88"
            rx="13"
            transform="rotate(-45 342 326)"
            fill="#9096b2"
          />
          <path
            d="M118 342 L124 358 L140 364 L124 370 L118 386 L112 370 L96 364 L112 358 Z"
            fill="#1e4fd8"
          />
          <circle cx="428" cy="282" r="11" fill="#1e4fd8" />
        </svg>
      </div>

      <div className="flex flex-col items-center -mt-[10px]">
      <h2 className="text-[20px] md:text-[22px] font-bold text-[#1a1a1a] tracking-tight mb-2">
        No assignments yet
      </h2>

      <p className="text-[13px] text-[#5e5e5e] font-normal leading-relaxed mb-7 max-w-[340px] md:max-w-[380px]">
        Create your first assignment to start collecting and grading student submissions.
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      <Button
        variant="primary"
        size="md"
        icon={<Plus className="w-4 h-4 text-white" />}
        onClick={onCreateAssignment}
        className="w-full max-w-[320px] md:w-auto px-7 py-3 text-[14px] font-semibold"
      >
        Create Your First Assignment
      </Button>
      </div>
    </div>
  );
};
