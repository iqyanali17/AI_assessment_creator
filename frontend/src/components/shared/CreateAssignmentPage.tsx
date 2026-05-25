'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Plus,
  Minus,
  ChevronDown,
  CalendarDays,
  Mic,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { createAssignment, uploadFile, CreateAssignmentBody } from '@/lib/api';
import { API_URL } from '@/lib/config';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { QuestionType } from '@/types/enums';

interface CreateAssignmentPageProps {
  onBack: () => void;
  onSuccess: (assignmentId: string) => void;
}

// ── Question type row ────────────────────────────────────────────────────────
interface QuestionRow {
  id: string;
  type: string;
  questions: number;
  marks: number;
}

const QUESTION_TYPE_OPTIONS = [
  { value: 'multiple_choice', label: 'Multiple Choice Questions' },
  { value: 'short_questions', label: 'Short Questions' },
  { value: 'long_questions', label: 'Long Questions' },
  { value: 'diagram_graph', label: 'Diagram/Graph-Based Questions' },
  { value: 'numerical', label: 'Numerical Problems' },
  { value: QuestionType.MCQ, label: 'MCQ' },
  { value: QuestionType.TRUE_FALSE, label: 'True / False' },
  { value: QuestionType.MIXED, label: 'Mixed' },
];

// Map display type → API QuestionType
function mapToApiType(displayType: string): QuestionType {
  const map: Record<string, QuestionType> = {
    multiple_choice: QuestionType.MCQ,
    short_questions: QuestionType.SHORT_ANSWER,
    long_questions: QuestionType.LONG_ANSWER,
    diagram_graph: QuestionType.LONG_ANSWER,
    numerical: QuestionType.LONG_ANSWER,
    [QuestionType.MCQ]: QuestionType.MCQ,
    [QuestionType.TRUE_FALSE]: QuestionType.TRUE_FALSE,
    [QuestionType.MIXED]: QuestionType.MIXED,
  };
  return map[displayType] ?? QuestionType.MIXED;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Stepper ──────────────────────────────────────────────────────────────────
const Stepper: React.FC<{
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}> = ({ value, min = 1, max = 100, onChange }) => (
  <div className="flex items-center gap-1">
    <button
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      className="w-7 h-7 rounded-full border border-[#e0e0e0] bg-white flex items-center justify-center text-[#5e5e5e] hover:bg-[#f5f5f5] transition-colors"
    >
      <Minus className="w-3 h-3" />
    </button>
    <span className="w-6 text-center text-[13px] font-semibold text-[#1a1a1a]">
      {value}
    </span>
    <button
      type="button"
      onClick={() => onChange(Math.min(max, value + 1))}
      className="w-7 h-7 rounded-full border border-[#e0e0e0] bg-white flex items-center justify-center text-[#5e5e5e] hover:bg-[#f5f5f5] transition-colors"
    >
      <Plus className="w-3 h-3" />
    </button>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
export const CreateAssignmentPage: React.FC<CreateAssignmentPageProps> = ({
  onBack,
  onSuccess,
}) => {
  const { loadAssignments } = useAssessmentStore();

  // File upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Due date
  const [dueDate, setDueDate] = useState('');
  const [dueDateError, setDueDateError] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Title
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');

  // Subject & Class
  const [subject, setSubject] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [className, setClassName] = useState('');
  const [classNameError, setClassNameError] = useState('');

  // Question rows
  const [rows, setRows] = useState<QuestionRow[]>([
    { id: uid(), type: 'multiple_choice', questions: 4, marks: 1 },
    { id: uid(), type: 'short_questions', questions: 3, marks: 2 },
  ]);
  const [rowErrors, setRowErrors] = useState<string>('');

  // Additional info
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // ── Totals ──
  const totalQuestions = rows.reduce((s, r) => s + r.questions, 0);
  const totalMarks = rows.reduce((s, r) => s + r.questions * r.marks, 0);

  // ── File handling ──
  const handleFileSelect = async (selected: File) => {
    if (!['application/pdf', 'text/plain'].includes(selected.type)) {
      setFileError('Only PDF or TXT files are allowed.');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setFileError('File must be under 10MB.');
      return;
    }
    setFile(selected);
    setFileError(null);
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadFile(selected, setUploadProgress);
      setUploadedUrl(`${API_URL}${uploaded.url}`);
    } catch {
      setFileError('Upload failed. Please try again.');
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  // ── Row operations ──
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: uid(), type: 'multiple_choice', questions: 1, marks: 1 },
    ]);
    setRowErrors('');
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: keyof QuestionRow, value: string | number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
    setRowErrors('');
  };

  // ── Validate & Submit ──
  const handleSubmit = async () => {
    let valid = true;

    if (!title.trim()) {
      setTitleError('Title is required.');
      valid = false;
    } else if (title.length > 200) {
      setTitleError('Max 200 characters.');
      valid = false;
    } else {
      setTitleError('');
    }

    if (!subject.trim()) {
      setSubjectError('Subject is required.');
      valid = false;
    } else {
      setSubjectError('');
    }

    if (!className.trim()) {
      setClassNameError('Class is required.');
      valid = false;
    } else {
      setClassNameError('');
    }

    if (!dueDate) {
      setDueDateError('Due date is required.');
      valid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(dueDate) < today) {
        setDueDateError('Due date cannot be in the past.');
        valid = false;
      } else {
        setDueDateError('');
      }
    }

    if (rows.length === 0) {
      setRowErrors('Add at least one question type.');
      valid = false;
    }

    if (!valid) return;

    setSubmitting(true);
    setGeneralError('');

    // Build the dominant question type from rows
    const dominantType = mapToApiType(rows[0].type);

    const body: CreateAssignmentBody = {
      title: title.trim(),
      subject: subject.trim(),
      className: className.trim(),
      dueDate: new Date(dueDate).toISOString(),
      questionType: dominantType,
      numberOfQuestions: totalQuestions,
      totalMarks: totalMarks,
      additionalInstructions: additionalInfo.trim() || undefined,
      fileUrl: uploadedUrl || undefined,
    };

    try {
      const result = await createAssignment(body);
      await loadAssignments();
      onSuccess(result.assignment._id);
    } catch (err: any) {
      setGeneralError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">

      {/* ── Page heading ── */}
      <div className="flex items-center gap-2 mb-3 px-1 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
        <div>
          <h1 className="text-[15px] font-bold text-[#1a1a1a] leading-tight">
            Create Assignment
          </h1>
          <p className="text-[11px] text-[#5e5e5e] font-normal leading-tight">
            Set up a new assignment for your students
          </p>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="w-full h-[3px] bg-[#e0e0e0] rounded-full mb-4 shrink-0">
        <div className="h-full w-1/2 bg-[#1a1a1a] rounded-full" />
      </div>

      {/* ── Scrollable form area ── */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-4">

        {/* White card */}
        <div className="bg-white rounded-2xl p-5 md:p-6 flex flex-col gap-5">

          {/* Section title */}
          <div>
            <h2 className="text-[15px] font-bold text-[#1a1a1a]">Assignment Details</h2>
            <p className="text-[11px] text-[#5e5e5e] mt-0.5">
              Basic information about your assignment
            </p>
          </div>

          {/* General error */}
          {generalError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-[12px] font-medium text-red-600">{generalError}</p>
            </div>
          )}

          {/* ── File upload ── */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFileSelect(f);
            }}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-8 gap-2 transition-colors ${
              file
                ? 'border-[#e0e0e0] bg-[#fafafa] cursor-default'
                : dragging
                ? 'border-brandOrange bg-orange-50 cursor-pointer'
                : 'border-[#d0d0d0] bg-[#fafafa] hover:border-brandOrange hover:bg-orange-50/30 cursor-pointer'
            }`}
          >
            {!file ? (
              <>
                <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                  <Upload className="w-5 h-5 text-[#5e5e5e]" />
                </div>
                <p className="text-[13px] font-semibold text-[#1a1a1a]">
                  Choose a file or drag &amp; drop it here
                </p>
                <p className="text-[11px] text-[#9e9e9e]">JPEG, PNG, upto 10MB</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="mt-1 px-5 py-1.5 rounded-full border border-[#d0d0d0] bg-white text-[12px] font-semibold text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors"
                >
                  Browse Files
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 w-full px-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{file.name}</p>
                  {uploading ? (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#e0e0e0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brandOrange rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#5e5e5e]">{uploadProgress}%</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-green-600 font-medium mt-0.5">
                      {uploadedUrl ? '✓ Uploaded successfully' : 'Ready'}
                    </p>
                  )}
                </div>
                {!uploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setUploadedUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1.5 rounded-full hover:bg-[#f0f0f0] text-[#5e5e5e] hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            />
          </div>
          {fileError && (
            <p className="text-[11px] text-red-500 font-medium -mt-3">{fileError}</p>
          )}
          <p className="text-[11px] text-[#9e9e9e] text-center -mt-3">
            Upload images of your preferred document/image
          </p>

          {/* ── Title ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
              placeholder="e.g. Quiz on Electricity"
              maxLength={200}
              className={`w-full h-[48px] rounded-xl border bg-white px-4 text-[13px] font-medium text-[#1a1a1a] placeholder:text-[#b0b0b0] outline-none transition-colors ${
                titleError
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-[#e0e0e0] focus:border-brandOrange focus:ring-2 focus:ring-brandOrange/10'
              }`}
            />
            {titleError && (
              <p className="text-[11px] text-red-500 font-medium">{titleError}</p>
            )}
          </div>

          {/* ── Subject & Class ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#1a1a1a]">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setSubjectError(''); }}
                placeholder="e.g. Science, Mathematics"
                maxLength={100}
                className={`w-full h-[48px] rounded-xl border bg-white px-4 text-[13px] font-medium text-[#1a1a1a] placeholder:text-[#b0b0b0] outline-none transition-colors ${
                  subjectError
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#e0e0e0] focus:border-brandOrange focus:ring-2 focus:ring-brandOrange/10'
                }`}
              />
              {subjectError && (
                <p className="text-[11px] text-red-500 font-medium">{subjectError}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#1a1a1a]">Class</label>
              <input
                type="text"
                value={className}
                onChange={(e) => { setClassName(e.target.value); setClassNameError(''); }}
                placeholder="e.g. 8th, Grade 10"
                maxLength={50}
                className={`w-full h-[48px] rounded-xl border bg-white px-4 text-[13px] font-medium text-[#1a1a1a] placeholder:text-[#b0b0b0] outline-none transition-colors ${
                  classNameError
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#e0e0e0] focus:border-brandOrange focus:ring-2 focus:ring-brandOrange/10'
                }`}
              />
              {classNameError && (
                <p className="text-[11px] text-red-500 font-medium">{classNameError}</p>
              )}
            </div>
          </div>

          {/* ── Due Date ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">Due Date</label>
            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); setDueDateError(''); }}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full h-[48px] rounded-xl border bg-white px-4 text-[13px] font-medium text-[#1a1a1a] outline-none transition-colors appearance-none pr-12 ${
                  dueDateError
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#e0e0e0] focus:border-brandOrange focus:ring-2 focus:ring-brandOrange/10'
                }`}
                placeholder="DD-MM-YYYY"
              />
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker?.()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5e5e5e] hover:text-[#1a1a1a]"
              >
                <CalendarDays className="w-5 h-5" />
              </button>
            </div>
            {dueDateError && (
              <p className="text-[11px] text-red-500 font-medium">{dueDateError}</p>
            )}
          </div>

          {/* ── Question Type rows ── */}
          <div className="flex flex-col gap-2">
            {/* Header row */}
            <div className="grid items-center gap-2" style={{ gridTemplateColumns: '1fr auto 120px 80px' }}>
              <span className="text-[13px] font-semibold text-[#1a1a1a]">Question Type</span>
              <span />
              <span className="text-[11px] font-semibold text-[#5e5e5e] text-center">No. of Questions</span>
              <span className="text-[11px] font-semibold text-[#5e5e5e] text-center">Marks</span>
            </div>

            {rowErrors && (
              <p className="text-[11px] text-red-500 font-medium">{rowErrors}</p>
            )}

            {rows.map((row) => (
              <div
                key={row.id}
                className="grid items-center gap-2"
                style={{ gridTemplateColumns: '1fr auto 120px 80px' }}
              >
                {/* Type dropdown */}
                <div className="relative">
                  <select
                    value={row.type}
                    onChange={(e) => updateRow(row.id, 'type', e.target.value)}
                    className="w-full h-[44px] rounded-xl border border-[#e0e0e0] bg-white px-3 pr-8 text-[12px] font-medium text-[#1a1a1a] outline-none appearance-none focus:border-brandOrange transition-colors"
                  >
                    {QUESTION_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9e9e9e] pointer-events-none" />
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="w-6 h-6 flex items-center justify-center text-[#9e9e9e] hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Questions stepper */}
                <div className="flex justify-center">
                  <Stepper
                    value={row.questions}
                    min={1}
                    max={100}
                    onChange={(v) => updateRow(row.id, 'questions', v)}
                  />
                </div>

                {/* Marks stepper */}
                <div className="flex justify-center">
                  <Stepper
                    value={row.marks}
                    min={1}
                    max={100}
                    onChange={(v) => updateRow(row.id, 'marks', v)}
                  />
                </div>
              </div>
            ))}

            {/* Add Question Type */}
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-2 mt-1 w-fit"
            >
              <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <Plus className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[13px] font-semibold text-[#1a1a1a]">
                Add Question Type
              </span>
            </button>

            {/* Totals */}
            <div className="flex flex-col items-end gap-0.5 mt-1">
              <p className="text-[12px] font-semibold text-[#1a1a1a]">
                Total Questions : {totalQuestions}
              </p>
              <p className="text-[12px] font-semibold text-[#1a1a1a]">
                Total Marks : {totalMarks}
              </p>
            </div>
          </div>

          {/* ── Additional Information ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">
              Additional Information{' '}
              <span className="font-normal text-[#5e5e5e]">(For better output)</span>
            </label>
            <div className="relative">
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                maxLength={2000}
                rows={4}
                className="w-full rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 pr-10 text-[13px] font-medium text-[#1a1a1a] placeholder:text-[#b0b0b0] outline-none resize-none focus:border-brandOrange focus:ring-2 focus:ring-brandOrange/10 transition-colors"
              />
              <button
                type="button"
                className="absolute bottom-3 right-3 text-[#9e9e9e] hover:text-brandOrange transition-colors"
                aria-label="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer navigation ── */}
      <div className="shrink-0 flex items-center justify-between pt-4 pb-1">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#d0d0d0] bg-white text-[13px] font-semibold text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1a1a1a] text-[13px] font-semibold text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 active:scale-95"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
