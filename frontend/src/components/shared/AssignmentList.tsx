'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, Check, X } from 'lucide-react';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useDebounce } from '@/hooks/useDebounce';
import { AssignmentCard } from './AssignmentCard';
import { EmptyState } from './EmptyState';
import { AssessmentStatus } from '@/types/enums';

interface AssignmentListProps {
  onCreateAssignment: () => void;
  onViewAssignment?: (id: string) => void;
}

const STATUS_OPTIONS: { label: string; value: AssessmentStatus | null }[] = [
  { label: 'All', value: null },
  { label: 'Pending', value: AssessmentStatus.PENDING },
  { label: 'Processing', value: AssessmentStatus.PROCESSING },
  { label: 'Completed', value: AssessmentStatus.COMPLETED },
  { label: 'Failed', value: AssessmentStatus.FAILED },
];

const STATUS_COLORS: Record<AssessmentStatus, string> = {
  [AssessmentStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
  [AssessmentStatus.PROCESSING]: 'bg-blue-100 text-blue-700',
  [AssessmentStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [AssessmentStatus.FAILED]: 'bg-red-100 text-red-700',
};

export const AssignmentList: React.FC<AssignmentListProps> = ({ onCreateAssignment, onViewAssignment }) => {
  const {
    assignments,
    isLoading,
    error,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
  } = useAssessmentStore();

  // Local input state — debounced before filtering
  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedSearch = useDebounce(inputValue, 500);

  // Sync debounced value into store
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  // Filter dropdown state
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [filterOpen]);

  // Client-side search on top of server-side status filter
  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleView = (id: string) => {
    if (onViewAssignment) return onViewAssignment(id);
    alert(`View assignment: ${id}`);
  };

  const handleRemoveFilter = () => {
    setStatusFilter(null);
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <p className="text-[13px] text-red-500 font-medium">{error}</p>
        <button
          type="button"
          onClick={() => useAssessmentStore.getState().loadAssignments()}
          className="text-[12px] font-semibold text-[#1a1a1a] underline underline-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Empty state ──
  if (assignments.length === 0 && !statusFilter) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <EmptyState onCreateAssignment={onCreateAssignment} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-3">

      {/* Page heading — desktop only */}
      <div className="hidden md:flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
        <div>
          <h1 className="text-[15px] font-bold text-[#1a1a1a] leading-tight">Assignments</h1>
          <p className="text-[11px] text-[#5e5e5e] font-normal leading-tight">
            Manage and create assignments for your classes.
          </p>
        </div>
      </div>

      {/* Filter + Search bar */}
      <div className="flex items-center gap-2 bg-white rounded-2xl px-3 md:px-4 py-2 md:py-2.5">

        {/* Filter button + dropdown */}
        <div className="relative shrink-0" ref={filterRef}>
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[12px] font-semibold transition-colors ${
              statusFilter
                ? 'text-brandOrange bg-orange-50'
                : 'text-[#5e5e5e] hover:bg-[#f5f5f5]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
            {statusFilter && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[statusFilter]}`}>
                {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {filterOpen && (
            <div className="absolute left-0 top-[calc(100%+6px)] z-50 bg-white rounded-2xl shadow-lg border border-[#f0f0f0] py-1.5 min-w-[160px]">
              <p className="px-4 py-1.5 text-[10px] font-bold text-[#9e9e9e] uppercase tracking-wider">
                Status
              </p>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    setStatusFilter(opt.value);
                    setFilterOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-[13px] font-medium text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors"
                >
                  <span>{opt.label}</span>
                  {statusFilter === opt.value && (
                    <Check className="w-3.5 h-3.5 text-brandOrange" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-4 bg-[#e5e5e5] shrink-0" />

        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9e9e9e]" />
          <input
            type="text"
            placeholder="Search Name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-[#f5f5f5] rounded-full pl-8 pr-8 py-1.5 text-[12px] text-[#1a1a1a] placeholder:text-[#9e9e9e] outline-none"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => { setInputValue(''); setSearchQuery(''); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9e9e9e] hover:text-[#1a1a1a]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Active filter chip — clear button */}
        {statusFilter && (
          <button
            type="button"
            onClick={handleRemoveFilter}
            className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-brandOrange text-[11px] font-semibold hover:bg-orange-100 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((assignment) => (
            <AssignmentCard
              key={assignment._id}
              assignment={assignment}
              onDelete={useAssessmentStore.getState().removeAssignment}
              onView={handleView}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <p className="text-[14px] font-semibold text-[#1a1a1a]">No assignments found</p>
          <p className="text-[12px] text-[#5e5e5e]">
            {statusFilter
              ? `No ${STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label.toLowerCase()} assignments`
              : 'Try a different search term'}
          </p>
        </div>
      )}
    </div>
  );
};
