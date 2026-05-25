import { AssessmentStatus, QuestionType, Difficulty } from './enums';

// ── Assignment ──────────────────────────────────────────────────────────────

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionType: QuestionType;
  numberOfQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileUrl?: string;
  status: AssessmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentPayload {
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionType: QuestionType;
  numberOfQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  file?: File;
}

// ── Generated Paper ─────────────────────────────────────────────────────────

export interface Question {
  text: string;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
  correctAnswer?: string;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  _id: string;
  assignmentId: string;
  sections: Section[];
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface JobResponse {
  jobId: string;
  assignmentId: string;
  status: string;
  progress?: number;
}

// ── WebSocket Events ────────────────────────────────────────────────────────

export interface WSProgressEvent {
  assignmentId: string;
  status: AssessmentStatus;
  progress: number;
  message: string;
}

export interface WSCompletedEvent {
  assignmentId: string;
  paper: GeneratedPaper;
}

// Re-export enums
export { AssessmentStatus, QuestionType, Difficulty };
