'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, Loader2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { getAssignmentResult, getAssignmentStatus, getExportPdfUrl, regenerateAssignment } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { AssessmentStatus, Difficulty, Question, Section } from '@/types';

type PaperData = {
  assignmentId: string;
  title: string;
  subject: string;
  className: string;
  totalMarks: number;
  sections: Section[];
  status?: AssessmentStatus;
};

const DiffBadge: React.FC<{ d: Difficulty }> = ({ d }) => {
  const map: Record<Difficulty, { label: string; color: string }> = {
    [Difficulty.EASY]: { label: 'Easy', color: 'text-green-700' },
    [Difficulty.MEDIUM]: { label: 'Moderate', color: 'text-yellow-700' },
    [Difficulty.HARD]: { label: 'Challenging', color: 'text-red-700' },
  };
  const { label, color } = map[d] ?? { label: String(d), color: 'text-gray-600' };
  return <span className={`font-semibold ${color}`}>[{label}]</span>;
};

const getSectionLabel = (sectionTitle: string) => {
  const t = sectionTitle.toLowerCase();
  if (t.includes('section a')) return 'Short Answer Questions';
  if (t.includes('section b')) return 'Long Answer Questions';
  return 'Questions';
};

const hasAnyAnswerKey = (sections: Section[]) =>
  sections.flatMap((s) => s.questions).some((q) => Boolean(q.correctAnswer));

export const QuestionPaperView: React.FC<{
  assignmentId: string;
  onBack?: () => void;
  headerText?: string; // optional override for the black action bar text
}> = ({ assignmentId, onBack, headerText }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const pollTimer = useRef<number | null>(null);

  const clearPoll = () => {
    if (pollTimer.current) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsPolling(true);
    else setLoading(true);
    setError('');
    try {
      const data = await getAssignmentResult(assignmentId);
      const subject = data.assignment?.subject || data.assignment?.title || 'Subject';
      const className = data.assignment?.className || '';
      const title = data.assignment?.title || '';
      const totalMarks = data.assignment?.totalMarks ?? 0;
      const sections = data.paper?.sections || [];
      let status: AssessmentStatus | undefined = data.assignment?.status;
      if (!status) {
        try { const st = await getAssignmentStatus(assignmentId); status = st.status; } catch { /* ignore */ }
      }
      setPaper({ assignmentId, title, subject, className, totalMarks, sections, status });
      setError('');
    } catch (e: any) {
      if (!isRefresh) { setError(e?.message || 'Failed to load question paper.'); setPaper(null); }
      else console.warn('Refresh failed:', e?.message);
    } finally {
      setLoading(false);
      setIsPolling(false);
    }
  }, [assignmentId]);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // ── WebSocket: listen for real-time status updates for this assignment ──
  useSocket({
    filterAssignmentId: assignmentId,
    onStatus: (event) => {
      const status = event.status as AssessmentStatus;
      setPaper((prev) => prev ? { ...prev, status } : prev);
    },
    onCompleted: () => {
      // Paper is ready — fetch the full result
      clearPoll();
      load(true);
    },
    onFailed: () => {
      clearPoll();
      setPaper((prev) => prev ? { ...prev, status: AssessmentStatus.FAILED } : prev);
    },
  });

  // ── Fallback polling — only when WebSocket hasn't delivered completion yet ──
  useEffect(() => {
    clearPoll();
    if (!paper) return;
    const needsPolling =
      (!paper.sections || paper.sections.length === 0) &&
      (paper.status === AssessmentStatus.PENDING || paper.status === AssessmentStatus.PROCESSING);
    if (!needsPolling) return;

    // Start fallback poll at 5s (longer than before since WS is primary)
    pollTimer.current = window.setInterval(() => { load(true); }, 5000);
    return () => clearPoll();
  }, [paper, load]);

  useEffect(() => () => clearPoll(), []);

  const downloadUrl = useMemo(() => getExportPdfUrl(assignmentId), [assignmentId]);
  const showAnswerKey = useMemo(() => (paper ? hasAnyAnswerKey(paper.sections) : false), [paper]);

  const computedTotalMarks = useMemo(() => {
    if (!paper) return 0;
    const sum = paper.sections.flatMap((s) => s.questions).reduce((a, q) => a + (q.marks || 0), 0);
    return sum || paper.totalMarks || 0;
  }, [paper]);

  const isPaperReady = Boolean(paper && paper.sections && paper.sections.length > 0);
  const statusLabel = paper?.status;

  const handleRefresh = async () => {
    await load();
  };

  const handleRegenerate = async () => {
    if (!paper) return;
    setIsRegenerating(true);
    setError('');
    try {
      await regenerateAssignment(assignmentId);
      // Job queued — reset paper to trigger polling for the new generation
      setPaper((prev) => prev ? { ...prev, sections: [], status: AssessmentStatus.PENDING } : prev);
      await load(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to regenerate. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Black action bar */}
      <div className="bg-[#1a1a1a] rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-start gap-3 flex-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mt-0.5 shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <p className="text-[13px] text-white font-medium leading-snug">
            {headerText ||
              `Certainly! Here are customized Question Paper for your ${paper?.className || '—'} ${paper?.subject || 'Subject'} classes on the ${paper?.title || 'NCERT chapters'}:`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {!isPaperReady && (
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
          <button
            type="button"
            onClick={() => window.open(downloadUrl, '_blank')}
            disabled={!isPaperReady}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#1a1a1a] text-[11px] font-semibold hover:bg-[#f0f0f0] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download as PDF
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#5e5e5e]" />
          <p className="text-[13px] font-medium text-[#5e5e5e]">Loading question paper…</p>
          {isPolling && (
            <p className="text-[11px] text-[#9e9e9e]">Checking generation status…</p>
          )}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-8">
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[12px] font-medium text-red-600">{error}</p>
          </div>
        </div>
      ) : !paper || paper.sections.length === 0 ? (
        <div className="bg-white rounded-2xl px-6 md:px-12 py-8" style={{ fontFamily: 'Georgia, serif' }}>
          {/* Header */}
          <div className="text-center border-b border-[#e0e0e0] pb-5 mb-5">
            <h1 className="text-[20px] md:text-[22px] font-bold text-[#1a1a1a]">
              Delhi Public School, Sector-4, Bokaro
            </h1>
            <p className="text-[14px] font-semibold text-[#1a1a1a] mt-1">
              Subject: {paper?.subject || 'Subject'}
            </p>
            <p className="text-[14px] font-semibold text-[#1a1a1a]">Class: {paper?.className || '—'}</p>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-semibold text-[#1a1a1a]">Time Allowed: 45 minutes</p>
            <p className="text-[13px] font-semibold text-[#1a1a1a]">
              Maximum Marks: {paper?.totalMarks ?? 0}
            </p>
          </div>

          <p className="text-[13px] font-semibold text-[#1a1a1a] mb-4">
            All questions are compulsory unless stated otherwise.
          </p>

          {/* Student info */}
          <div className="flex flex-col gap-1.5 mb-8">
            {[
              { label: 'Name', width: 'w-40' },
              { label: 'Roll Number', width: 'w-28' },
            ].map(({ label, width }) => (
              <p key={label} className="text-[13px] text-[#1a1a1a]">
                {label}:{' '}
                <span className={`inline-block ${width} border-b border-[#1a1a1a] ml-1`} />
              </p>
            ))}
            <p className="text-[13px] text-[#1a1a1a]">
              Class: {paper?.className || '—'} Section:{' '}
              <span className="inline-block w-20 border-b border-[#1a1a1a] ml-1" />
            </p>
          </div>

          {/* Status message */}
          <div className="bg-[#f7f7f7] border border-[#ededed] rounded-2xl px-5 py-4">
            {statusLabel === AssessmentStatus.PENDING || statusLabel === AssessmentStatus.PROCESSING ? (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brandOrange" />
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">
                    Question paper is generating… ({statusLabel})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="px-4 py-2 rounded-full bg-[#1a1a1a] text-white text-[11px] font-semibold hover:bg-black/90 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ) : statusLabel === AssessmentStatus.FAILED ? (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[13px] font-semibold text-[#1a1a1a]">
                  Generation failed. Please regenerate to create the question paper.
                </p>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="px-4 py-2 rounded-full bg-[#1a1a1a] text-white text-[11px] font-semibold hover:bg-black/90 transition-colors disabled:opacity-60"
                >
                  {isRegenerating ? 'Regenerating…' : 'Regenerate'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[13px] font-semibold text-[#1a1a1a]">
                  This assignment does not have a generated paper yet.
                </p>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="px-4 py-2 rounded-full bg-[#1a1a1a] text-white text-[11px] font-semibold hover:bg-black/90 transition-colors disabled:opacity-60"
                >
                  {isRegenerating ? 'Regenerating…' : 'Generate now'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl px-6 md:px-12 py-8" style={{ fontFamily: 'Georgia, serif' }}>
          {/* Header */}
          <div className="text-center border-b border-[#e0e0e0] pb-5 mb-5">
            <h1 className="text-[20px] md:text-[22px] font-bold text-[#1a1a1a]">
              Delhi Public School, Sector-4, Bokaro
            </h1>
            <p className="text-[14px] font-semibold text-[#1a1a1a] mt-1">
              Subject: {paper.subject}
            </p>
            <p className="text-[14px] font-semibold text-[#1a1a1a]">Class: {paper.className || '—'}</p>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-semibold text-[#1a1a1a]">Time Allowed: 45 minutes</p>
            <p className="text-[13px] font-semibold text-[#1a1a1a]">Maximum Marks: {computedTotalMarks}</p>
          </div>

          <p className="text-[13px] font-semibold text-[#1a1a1a] mb-4">
            All questions are compulsory unless stated otherwise.
          </p>

          {/* Student info */}
          <div className="flex flex-col gap-1.5 mb-6">
            {[
              { label: 'Name', width: 'w-40' },
              { label: 'Roll Number', width: 'w-28' },
            ].map(({ label, width }) => (
              <p key={label} className="text-[13px] text-[#1a1a1a]">
                {label}:{' '}
                <span className={`inline-block ${width} border-b border-[#1a1a1a] ml-1`} />
              </p>
            ))}
            <p className="text-[13px] text-[#1a1a1a]">
              Class: {paper.className || '—'} Section:{' '}
              <span className="inline-block w-20 border-b border-[#1a1a1a] ml-1" />
            </p>
          </div>

          {/* Sections */}
          {paper.sections.map((section: Section, si: number) => {
            const offset = paper.sections.slice(0, si).reduce((a, s) => a + s.questions.length, 0);
            return (
              <div key={`${section.title}-${si}`} className="mb-8">
                <h2 className="text-[15px] font-bold text-[#1a1a1a] text-center mb-3">
                  {section.title}
                </h2>
                <p className="text-[13px] font-bold text-[#1a1a1a] mb-0.5">
                  {getSectionLabel(section.title)}
                </p>
                <p className="text-[12px] italic text-[#5e5e5e] mb-3">{section.instruction}</p>

                <ol className="flex flex-col gap-2.5">
                  {section.questions.map((q: Question, qi: number) => (
                    <li key={qi} className="flex gap-2 text-[13px] text-[#1a1a1a] leading-relaxed">
                      <span className="shrink-0 font-medium">{offset + qi + 1}.</span>
                      <span className="flex-1">
                        <DiffBadge d={q.difficulty} />{' '}
                        {q.text}{' '}
                        <span className="text-[#5e5e5e] font-medium">
                          [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                        </span>
                        {q.options && q.options.length > 0 && (
                          <ol className="mt-1.5 ml-4 flex flex-col gap-1">
                            {q.options.map((opt, oi) => (
                              <li key={oi} className="text-[12px]">
                                {String.fromCharCode(97 + oi)}) {opt}
                              </li>
                            ))}
                          </ol>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}

          <p className="text-[13px] font-bold text-[#1a1a1a] mt-4 mb-8">End of Question Paper</p>

          {/* Answer Key */}
          {showAnswerKey && (
            <div className="border-t border-[#e0e0e0] pt-6">
              <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4">Answer Key:</h3>
              <ol className="flex flex-col gap-3">
                {paper.sections
                  .flatMap((s) => s.questions)
                  .map((q, i) =>
                    q.correctAnswer ? (
                      <li key={i} className="flex gap-2 text-[13px] text-[#1a1a1a] leading-relaxed">
                        <span className="shrink-0 font-medium">{i + 1}.</span>
                        <span className="flex-1">{q.correctAnswer}</span>
                      </li>
                    ) : null,
                  )}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
