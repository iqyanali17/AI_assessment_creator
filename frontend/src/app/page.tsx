'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { BottomNav } from '@/components/shared/BottomNav';
import { AssignmentList } from '@/components/shared/AssignmentList';
import { CreateAssignmentPage } from '@/components/shared/CreateAssignmentPage';
import { QuestionPaperView } from '@/components/shared/QuestionPaperView';
import { Button } from '@/components/ui/Button';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useSocket } from '@/hooks/useSocket';
import { AssessmentStatus } from '@/types/enums';

type View = 'list' | 'create' | 'paper';

export default function Home() {
  const [activeTab, setActiveTab] = useState('Assignments');
  const [view, setView] = useState<View>('list');
  const { total, assignments, loadAssignments } = useAssessmentStore();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [homeAssignmentId, setHomeAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleCreateAssignment = () => setView('create');
  const handleBack = () => setView('list');
  const handleSuccess = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setView('paper');
    loadAssignments();
  };

  const isCreateView = view === 'create';
  const isPaperView = view === 'paper';

  const mobileBreadcrumb = isCreateView
    ? 'Create Assignment'
    : isPaperView
      ? 'Question Paper'
      : activeTab;

  // Choose a default assignment to show on "Home" (latest one, even if still generating).
  useEffect(() => {
    if (!assignments || assignments.length === 0) {
      setHomeAssignmentId(null);
      return;
    }

    // Show the most recent assignment regardless of status — QuestionPaperView handles polling
    const latest = assignments[0];
    setHomeAssignmentId(latest?._id || null);
  }, [assignments]);

  return (
    <main className="min-h-screen bg-[#e8e8e8] w-full md:p-4 flex md:gap-4 overflow-x-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => { setActiveTab(tab); setView('list'); }}
          onCreateAssignment={handleCreateAssignment}
          assignmentCount={total}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:gap-3 md:h-[calc(100vh-32px)] min-w-0 h-screen">

        {/* Header */}
        <div className="md:shrink-0 px-3 pt-3 md:p-0">
          <Header
            onBack={handleBack}
            onMenuToggle={() => {}}
            userName="John Doe"
            userAvatar="/assets/Monkey_profile.jpg"
          />
        </div>

        {/* Mobile breadcrumb bar */}
        <div className="flex md:hidden items-center gap-3 mx-3 mt-2 bg-white rounded-2xl px-4 h-[48px] shrink-0">
          <button
            type="button"
            onClick={
              isCreateView
                ? handleBack
                : isPaperView
                  ? () => { setSelectedAssignmentId(null); setView('list'); }
                  : () => {}
            }
            className="p-1 text-[#1a1a1a] shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[14px] font-bold text-[#1a1a1a] tracking-wide">
            {mobileBreadcrumb}
          </span>
        </div>

        {/* Content */}
        <div
          className="flex-1 flex flex-col overflow-hidden min-h-0 relative md:rounded-2xl"
          style={{ background: 'linear-gradient(179.67deg, #F2F2F2 -15.9%, #EFEFEF 158.68%)' }}
        >
          {/* Bottom blur overlay */}
          {!isCreateView && (
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 md:rounded-b-2xl"
              style={{
                height: '48px',
                background: 'rgba(76, 76, 76, 0.06)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                zIndex: 40,
              }}
            />
          )}

          {/* ── Create Assignment view ── */}
          {isCreateView ? (
            <div className="relative z-20 flex-1 overflow-y-auto min-h-0 px-3 md:px-6 pt-4 pb-6 flex flex-col">
              <CreateAssignmentPage
                onBack={handleBack}
                onSuccess={handleSuccess}
              />
            </div>
          ) : isPaperView && selectedAssignmentId ? (
            <div className="relative z-20 flex-1 overflow-y-auto min-h-0 px-3 md:px-5 pt-3 md:pt-4 pb-28 md:pb-20">
              <QuestionPaperView
                assignmentId={selectedAssignmentId}
                onBack={() => { setSelectedAssignmentId(null); setView('list'); }}
              />
            </div>
          ) : activeTab === 'Assignments' ? (
            /* ── Assignment list ── */
            <div className="relative z-20 flex-1 overflow-y-auto min-h-0 px-3 md:px-5 pt-3 md:pt-4 pb-28 md:pb-20">
              <AssignmentList
                onCreateAssignment={handleCreateAssignment}
                onViewAssignment={(id) => { setSelectedAssignmentId(id); setView('paper'); }}
              />
            </div>
          ) : activeTab === 'Home' ? (
            <div className="relative z-20 flex-1 overflow-y-auto min-h-0 px-3 md:px-5 pt-3 md:pt-4 pb-28 md:pb-20">
              {homeAssignmentId ? (
                <QuestionPaperView assignmentId={homeAssignmentId} />
              ) : (
                <div className="bg-white rounded-2xl p-8">
                  <p className="text-[13px] font-medium text-[#5e5e5e]">
                    No assignments found yet. Create an assignment to generate your first question paper.
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === "AI Teacher's Toolkit" ? (
            /* ── AI Teacher's Toolkit — Coming Soon ── */
            <div className="relative z-20 flex-1 flex items-center justify-center">
              <div className="text-center font-semibold text-[#5e5e5e] text-sm tracking-wider uppercase select-none">
                AI Teacher&apos;s Toolkit — Coming Soon
              </div>
            </div>
          ) : (
            /* ── Other tabs ── */
            <div className="relative z-20 flex-1 flex items-center justify-center">
              <div className="text-center font-semibold text-[#5e5e5e] text-sm tracking-wider uppercase select-none">
                {activeTab} — Coming Soon
              </div>
            </div>
          )}

          {/* Desktop floating CTA — list view only */}
          {!isCreateView && !isPaperView && activeTab === 'Assignments' && (
            <div
              className="hidden md:flex absolute bottom-5 left-1/2 -translate-x-1/2"
              style={{ zIndex: 50 }}
            >
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4 text-white" />}
                onClick={handleCreateAssignment}
                className="px-7 py-3 text-[14px] font-semibold shadow-lg"
              >
                Create Assignment
              </Button>
            </div>
          )}

          {/* Mobile FAB — list view only */}
          {!isCreateView && !isPaperView && activeTab === 'Assignments' && (
            <button
              type="button"
              onClick={handleCreateAssignment}
              className="md:hidden fixed bottom-[88px] right-4 z-50 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center active:scale-95 transition-transform border border-[#f0f0f0]"
              aria-label="Create assignment"
            >
              <Plus className="w-5 h-5 text-brandOrange" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setView('list'); }} />
    </main>
  );
}
