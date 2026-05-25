import React from 'react';
import { LayoutGrid, Sparkles } from 'lucide-react';

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab = 'Assignments',
  onTabChange,
}) => {
  // Assignments icon — clipboard with a dot (matches screenshot)
  const AssignmentsIcon = ({ active }: { active: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke={active ? 'white' : '#6b7280'} strokeWidth="2" />
      <path d="M9 3h6v2H9V3z" fill={active ? 'white' : '#6b7280'} />
      <circle cx="12" cy="14" r="1.5" fill={active ? 'white' : '#6b7280'} />
      <path d="M9 9h6" stroke={active ? 'white' : '#6b7280'} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  // Library icon — document with a plus sign (matches screenshot)
  const LibraryIcon = ({ active }: { active: boolean }) => (
    <svg width="20" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke={active ? 'white' : '#6b7280'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" stroke={active ? 'white' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12v6M9 15h6" stroke={active ? 'white' : '#6b7280'} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  const items = [
    {
      name: 'Home',
      label: 'Home',
      renderIcon: (active: boolean) => (
        <LayoutGrid className={`w-5 h-5 ${active ? 'text-white' : 'text-[#6b7280]'}`} />
      ),
    },
    {
      name: 'Assignments',
      label: 'Assignments',
      renderIcon: (active: boolean) => <AssignmentsIcon active={active} />,
    },
    {
      name: 'My Library',
      label: 'Library',
      renderIcon: (active: boolean) => <LibraryIcon active={active} />,
    },
    {
      name: "AI Teacher's Toolkit",
      label: 'AI Toolkit',
      renderIcon: (active: boolean) => (
        <Sparkles className={`w-5 h-5 ${active ? 'text-white' : 'text-[#6b7280]'}`} />
      ),
    },
  ];

  return (
    <div className="fixed bottom-3 left-3 right-3 h-[68px] bg-[#1a1a1a] rounded-[22px] shadow-2xl flex items-center justify-around px-2 z-40 md:hidden select-none">
      {items.map((item) => {
        const isActive = activeTab === item.name;
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => onTabChange?.(item.name)}
            className="flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all duration-150 active:scale-95"
          >
            <div className="flex items-center justify-center h-5">
              {item.renderIcon(isActive)}
            </div>
            <span
              className={`text-[10px] font-semibold tracking-wide leading-none ${
                isActive ? 'text-white' : 'text-[#6b7280]'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
