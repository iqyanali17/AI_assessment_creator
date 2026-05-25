import { Assignment, GeneratedPaper, ApiResponse } from '@/types';
import { AssessmentStatus, QuestionType } from '@/types/enums';
import { API_URL } from '@/lib/config';

const BASE_URL = API_URL;

// ── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedAssignments {
  assignments: Assignment[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface FetchAssignmentsParams {
  page?: number; limit?: number; status?: AssessmentStatus | null;
}

export interface UploadedFile {
  id: string; originalName: string; mimeType: string; size: number; url: string;
}

export interface CreateAssignmentBody {
  title: string; subject: string; className: string;
  dueDate: string; questionType: QuestionType;
  numberOfQuestions: number; totalMarks: number;
  additionalInstructions?: string; fileUrl?: string;
}

export interface CreateAssignmentResult {
  assignment: Assignment; jobId: string; job: { id: string; name: string };
}

export interface AssignmentResultData {
  assignment: Assignment; paper: GeneratedPaper | null;
}

export interface AssignmentStatusData {
  assignmentId: string; status: AssessmentStatus; paperReady: boolean; updatedAt: string;
}

// ── Assignments ──────────────────────────────────────────────────────────────

export async function fetchAssignments(params: FetchAssignmentsParams = {}): Promise<PaginatedAssignments> {
  const { page = 1, limit = 50, status } = params;
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) query.set('status', status);
  const res = await fetch(`${BASE_URL}/assignments?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch assignments');
  const json: ApiResponse<PaginatedAssignments> = await res.json();
  return json.data;
}

export async function createAssignment(body: CreateAssignmentBody): Promise<CreateAssignmentResult> {
  const res = await fetch(`${BASE_URL}/assignments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) { const err = new Error(json.error || 'Failed to create assignment') as any; err.errors = json.errors; throw err; }
  return json.data;
}

export async function getAssignmentResult(id: string): Promise<AssignmentResultData> {
  const res = await fetch(`${BASE_URL}/assignments/${id}/result`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch result');
  const json: ApiResponse<AssignmentResultData> = await res.json();
  return json.data;
}

export async function getAssignmentStatus(id: string): Promise<AssignmentStatusData> {
  const res = await fetch(`${BASE_URL}/assignments/${id}/status`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch status');
  const json: ApiResponse<AssignmentStatusData> = await res.json();
  return json.data;
}

export async function regenerateAssignment(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/assignments/${id}/regenerate`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to regenerate');
}

export async function deleteAssignment(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/assignments/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete assignment');
}

export function getExportPdfUrl(id: string): string {
  return `${BASE_URL}/assignments/${id}/export/pdf`;
}

// ── File Upload ──────────────────────────────────────────────────────────────

export async function uploadFile(file: File, onProgress?: (pct: number) => void): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener('load', () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(json.data.file as UploadedFile);
        else reject(new Error(json.error || 'Upload failed'));
      } catch { reject(new Error('Upload failed')); }
    });
    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.open('POST', `${BASE_URL}/uploads`);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('X-File-Name', file.name);
    xhr.send(file);
  });
}
