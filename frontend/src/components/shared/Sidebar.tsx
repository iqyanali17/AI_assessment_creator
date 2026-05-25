import React from 'react';
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import {
  LayoutGrid,
  FileText,
  Clock3,
  Sparkles,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onCreateAssignment?: () => void;
  assignmentCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'Assignments',
  onTabChange,
  onCreateAssignment,
  assignmentCount,
}) => {
  const MyGroupsIcon = ({ className }: { className?: string }) => (
    <svg
      width="20"
      height="14"
      viewBox="0 0 20 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.0053 0C19.1069 0 20 0.867353 20 1.93727V12.0627C20 12.8063 19.5687 13.452 18.9357 13.7767C18.7114 13.0842 18.552 12.599 18.4574 12.321C18.403 12.1608 18.3777 12.011 18.2979 11.8819C18.2236 11.7617 18.1006 11.6182 17.9791 11.4747L17.9521 11.4428C17.5516 10.968 17.0414 10.3553 16.609 9.82839C16.1946 9.32331 15.8524 8.89639 15.7181 8.78227C15.3989 8.51105 14.9468 8.21401 14.2686 8.21401H9.66755C9.62487 8.2067 9.53035 8.1911 9.41489 8.14943C8.91888 7.97045 7.88479 7.51948 7.36702 7.30995C6.21465 6.13586 5.35029 5.25332 4.77394 4.66235C4.72638 4.61361 4.61117 4.49397 4.42827 4.30347C4.20391 4.06978 3.83109 4.04594 3.57713 4.24907C3.32508 4.45067 3.28322 4.81013 3.48253 5.06133C5.29064 7.33994 6.21755 8.50276 6.2633 8.5498C6.37468 8.66433 6.70673 8.87699 7.11436 9.1439C7.53415 9.41875 8.03354 9.75 8.41755 10.0092C8.77511 10.2505 8.97606 10.3192 9.01596 10.655C9.10394 11.3955 9.21032 12.5105 9.33511 14H1.99468C0.893058 14 0 13.1326 0 12.0627V1.93727C0 0.867353 0.893058 0 1.99468 0H18.0053ZM15.7979 11.7915C15.9066 11.7819 16.0276 11.915 16.0771 11.9594C16.2486 12.1131 16.3003 12.1721 16.4096 12.2694C16.5691 12.4114 16.7331 12.5764 16.7553 12.6051C16.9727 12.99 17.2919 13.7639 17.4073 14L15.4654 14C15.5489 13.0617 15.6021 12.459 15.625 12.1919C15.6516 11.8819 15.6891 11.8011 15.7979 11.7915ZM12.4734 3.06088C11.1955 3.06088 10.1596 4.06699 10.1596 5.30811C10.1596 6.54922 11.1955 7.55534 12.4734 7.55534C13.7513 7.55534 14.7872 6.54922 14.7872 5.30811C14.7872 4.06699 13.7513 3.06088 12.4734 3.06088Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
    </svg>
  );

  const AIToolkitIcon = ({ className }: { className?: string }) => (
    <svg
      width="16"
      height="19"
      viewBox="0 0 16 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1 15.5833C1 15.0308 1.21949 14.5009 1.61019 14.1102C2.00089 13.7195 2.5308 13.5 3.08333 13.5H14.3333M1 15.5833C1 16.1359 1.21949 16.6658 1.61019 17.0565C2.00089 17.4472 2.5308 17.6667 3.08333 17.6667H14.3333V1H3.08333C2.5308 1 2.00089 1.21949 1.61019 1.61019C1.21949 2.00089 1 2.5308 1 3.08333V15.5833Z"
        stroke="currentColor"
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const navItems = [
    { name: 'Home', icon: LayoutGrid, customIcon: null },
    { name: 'My Groups', icon: null, customIcon: MyGroupsIcon },
    { name: 'Assignments', icon: FileText, customIcon: null },
    { name: "AI Teacher's Toolkit", icon: null, customIcon: AIToolkitIcon },
    { name: 'My Library', icon: Clock3, customIcon: null },
  ];

  return (
    <aside className="w-[240px] h-[calc(100vh-32px)] bg-white rounded-[20px] p-5 flex flex-col justify-between shrink-0 select-none">
      <div className="flex flex-col gap-5">
        {/* Logo — click to go home */}
        <button
          type="button"
          onClick={() => onTabChange?.('Home')}
          className="px-1 pt-1 text-left focus:outline-none"
          aria-label="Go to Home"
        >
          <Logo />
        </button>

        {/* Create Assignment Button */}
        <Button
          variant="sidebar-glow"
          className="w-full justify-center py-3 px-4 text-sm font-semibold tracking-wide"
          icon={<Sparkles className="w-3.5 h-3.5 text-brandOrange" />}
          onClick={onCreateAssignment}
        >
          Create Assignment
        </Button>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-0.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const CustomIcon = item.customIcon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => onTabChange?.(item.name)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left text-[13px] font-semibold tracking-wide ${
                  isActive
                    ? 'bg-[#f0f0f0] text-[#1a1a1a]'
                    : 'text-[#5e5e5e] hover:text-[#1a1a1a] hover:bg-[#f5f5f5]'
                }`}
              >
                {CustomIcon ? (
                  <CustomIcon
                    className={`shrink-0 ${isActive ? 'text-[#1a1a1a]' : 'text-[#5e5e5e]'}`}
                  />
                ) : Icon ? (
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1a1a1a]' : 'text-[#5e5e5e]'}`}
                  />
                ) : null}
                <span className="flex-1">{item.name}</span>
                {item.name === 'Assignments' && assignmentCount != null && assignmentCount > 0 && (
                  <span className="ml-auto bg-brandOrange text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                    {assignmentCount > 99 ? '99+' : assignmentCount}
                  </span>
                )}              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-2">
        {/* Settings */}
        <button
          type="button"
          onClick={() => onTabChange?.('Settings')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left text-[13px] font-semibold tracking-wide ${
            activeTab === 'Settings'
              ? 'bg-[#f0f0f0] text-[#1a1a1a]'
              : 'text-[#5e5e5e] hover:text-[#1a1a1a] hover:bg-[#f5f5f5]'
          }`}
        >
          <Settings className="w-4 h-4 text-[#5e5e5e] shrink-0" />
          Settings
        </button>

        {/* School Info Profile Card */}
        <div className="flex items-center gap-3 p-3 bg-[#f5f5f5] rounded-2xl">
          <Avatar
            src="/assets/Monkey_profile.jpg"
            fallback="DP"
            variant="rounded"
            size="md"
            className="w-10 h-10 bg-white shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-bold text-[#1a1a1a] truncate leading-tight">
              Delhi Public School
            </span>
            <span className="text-[10px] text-[#5e5e5e] font-medium truncate leading-none mt-0.5">
              Bokaro Steel City
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
