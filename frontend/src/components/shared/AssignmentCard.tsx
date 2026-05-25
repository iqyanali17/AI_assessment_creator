'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { Assignment } from '@/types';

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onDelete,
  onView,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleDeleteClick = () => {
    const label = assignment.title || assignment.subject || 'this assignment';
    const confirmed = window.confirm(`Are you sure you want to delete "${label}"?`);
    if (confirmed) {
      onDelete(assignment._id);
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-5 relative select-none hover:shadow-sm transition-shadow">
      {/* Top row: title + menu */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[18px] font-bold text-[#1a1a1a] leading-snug line-clamp-2 flex-1">
          {assignment.title || assignment.subject}
        </h3>

        {/* Three-dot menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1 rounded-lg hover:bg-[#f5f5f5] transition-colors text-[#5e5e5e]"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-50 bg-white rounded-xl shadow-lg border border-[#f0f0f0] py-1 min-w-[148px]">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onView(assignment._id); }}
                className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors"
              >
                View Assignment
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); handleDeleteClick(); }}
                className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-[#fff5f5] transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: assigned on + due date */}
      <div className="flex items-center gap-4 mt-auto flex-wrap">
        <span className="text-[13px] text-[#5e5e5e]">
          <span className="font-semibold text-[#1a1a1a]">Assigned on</span> : {formatDate(assignment.createdAt)}
        </span>
        <span className="text-[13px] text-[#5e5e5e]">
          <span className="font-semibold text-[#1a1a1a]">Due</span> : {formatDate(assignment.dueDate)}
        </span>
      </div>
    </div>
  );
};
