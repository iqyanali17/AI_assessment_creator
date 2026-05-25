import { create } from 'zustand';
import { Assignment } from '@/types';
import { AssessmentStatus } from '@/types/enums';
import { fetchAssignments, deleteAssignment } from '@/lib/api';

interface AssessmentState {
  assignments: Assignment[];
  total: number;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: AssessmentStatus | null;
  viewingId: string | null;

  loadAssignments: (status?: AssessmentStatus | null) => Promise<void>;
  removeAssignment: (id: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setStatusFilter: (status: AssessmentStatus | null) => void;
  setViewingId: (id: string | null) => void;
  /** Called by WebSocket hook when a job status changes — updates card badge in real-time */
  updateAssignmentStatus: (assignmentId: string, status: AssessmentStatus) => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  assignments: [],
  total: 0,
  isLoading: false,
  error: null,
  searchQuery: '',
  statusFilter: null,
  viewingId: null,

  loadAssignments: async (status?: AssessmentStatus | null) => {
    const activeStatus = status !== undefined ? status : get().statusFilter;
    set({ isLoading: true, error: null });
    try {
      const data = await fetchAssignments({ status: activeStatus });
      set({ assignments: data.assignments, total: data.pagination.total, isLoading: false });
    } catch {
      set({ error: 'Failed to load assignments', isLoading: false });
    }
  },

  removeAssignment: async (id: string) => {
    try {
      await deleteAssignment(id);
      set((state) => ({
        assignments: state.assignments.filter((a) => a._id !== id),
        total: state.total - 1,
      }));
    } catch {
      set({ error: 'Failed to delete assignment' });
    }
  },

  setSearchQuery: (q: string) => set({ searchQuery: q }),

  setStatusFilter: (status: AssessmentStatus | null) => {
    set({ statusFilter: status });
    get().loadAssignments(status);
  },

  setViewingId: (id: string | null) => set({ viewingId: id }),

  updateAssignmentStatus: (assignmentId: string, status: AssessmentStatus) => {
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a._id === assignmentId ? { ...a, status } : a,
      ),
    }));
  },
}));
