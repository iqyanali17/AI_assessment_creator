import React from 'react';
import { Logo } from './Logo';
import { Avatar } from '../ui/Avatar';
import {
  ArrowLeft,
  LayoutGrid,
  Bell,
  ChevronDown,
  Menu,
} from 'lucide-react';

interface HeaderProps {
  onBack?: () => void;
  onMenuToggle?: () => void;
  userName?: string;
  userAvatar?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onBack,
  onMenuToggle,
  userName = 'John Doe',
  userAvatar = '/assets/Monkey_profile.jpg',
}) => {
  return (
    <header className="w-full">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between w-full h-[56px] bg-white rounded-2xl px-5 select-none">
        {/* Left Section: Back & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 hover:bg-[#f0f0f0] rounded-lg transition-colors text-[#5e5e5e] hover:text-[#1a1a1a]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-[#e0e0e0]" />

          <div className="flex items-center gap-2 text-[#5e5e5e] font-semibold text-[13px] tracking-wide">
            <LayoutGrid className="w-4 h-4 text-[#5e5e5e]" />
            <span>Assignment</span>
          </div>
        </div>

        {/* Right Section: Notification & User Dropdown */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 hover:bg-[#f0f0f0] rounded-full transition-colors text-[#5e5e5e]"
          >
            <Bell className="w-4 h-4" />
            {/* Orange dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brandOrange rounded-full border-2 border-white" />
          </button>

          <div className="h-5 w-[1px] bg-[#e0e0e0]" />

          {/* User Profile */}
          <div className="flex items-center gap-2 hover:bg-[#f0f0f0] px-2 py-1.5 rounded-full transition-colors cursor-pointer">
            <Avatar
              src={userAvatar}
              fallback={userName}
              size="sm"
              className="w-7 h-7 border-none"
            />
            <span className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">
              {userName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5e5e5e]" />
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex md:hidden items-center justify-between w-full h-[56px] bg-white rounded-2xl px-4 select-none overflow-hidden">
        {/* Left: Logo — constrained so it never overflows */}
        <div className="flex-1 min-w-0 flex items-center">
          <Logo />
        </div>

        {/* Right: Bell + Avatar + Hamburger — fixed width, never shrinks */}
        <div className="flex items-center gap-3 shrink-0 ml-3">
          {/* Notification Bell */}
          <button type="button" className="relative text-[#1a1a1a] shrink-0">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-brandOrange rounded-full border-2 border-white" />
          </button>

          {/* User Profile Avatar */}
          <Avatar
            src={userAvatar}
            fallback={userName}
            size="sm"
            className="w-8 h-8 shrink-0 border border-[#e0e0e0]"
          />

          {/* Hamburger Menu */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="text-[#1a1a1a] shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
