import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { AssessmentStatus } from '@/types/enums';
import { API_URL } from '@/lib/config';

// ── Event payload types ───────────────────────────────────────────────────────
export interface AssignmentStatusEvent {
  assignmentId: string;
  jobId: string;
  status: AssessmentStatus | 'pending' | 'processing' | 'completed' | 'failed';
}

export interface AssignmentCompletedEvent {
  assignmentId: string;
  jobId: string;
  status: 'completed';
  result?: { assignmentId?: string };
}

export interface AssignmentFailedEvent {
  assignmentId: string;
  jobId: string;
  status: 'failed';
  error?: string;
}

// ── Singleton socket instance (shared across the app) ────────────────────────
let globalSocket: Socket | null = null;

function getSocket(): Socket {
  if (!globalSocket || !globalSocket.connected) {
    globalSocket = io(API_URL, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return globalSocket;
}

// ── Hook ─────────────────────────────────────────────────────────────────────
interface UseSocketOptions {
  onStatus?: (event: AssignmentStatusEvent) => void;
  onCompleted?: (event: AssignmentCompletedEvent) => void;
  onFailed?: (event: AssignmentFailedEvent) => void;
  /** If provided, only fire callbacks when event.assignmentId matches */
  filterAssignmentId?: string;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { onStatus, onCompleted, onFailed, filterAssignmentId } = options;

  const onStatusRef = useRef(onStatus);
  const onCompletedRef = useRef(onCompleted);
  const onFailedRef = useRef(onFailed);

  useEffect(() => { onStatusRef.current = onStatus; }, [onStatus]);
  useEffect(() => { onCompletedRef.current = onCompleted; }, [onCompleted]);
  useEffect(() => { onFailedRef.current = onFailed; }, [onFailed]);

  useEffect(() => {
    const socket = getSocket();

    const handleStatus = (event: AssignmentStatusEvent) => {
      if (filterAssignmentId && event.assignmentId !== filterAssignmentId) return;
      onStatusRef.current?.(event);
    };

    const handleCompleted = (event: AssignmentCompletedEvent) => {
      if (filterAssignmentId && event.assignmentId !== filterAssignmentId) return;
      onCompletedRef.current?.(event);
    };

    const handleFailed = (event: AssignmentFailedEvent) => {
      if (filterAssignmentId && event.assignmentId !== filterAssignmentId) return;
      onFailedRef.current?.(event);
    };

    socket.on('assignment:status', handleStatus);
    socket.on('assignment:completed', handleCompleted);
    socket.on('assignment:failed', handleFailed);

    return () => {
      socket.off('assignment:status', handleStatus);
      socket.off('assignment:completed', handleCompleted);
      socket.off('assignment:failed', handleFailed);
    };
  }, [filterAssignmentId]);

  const disconnect = useCallback(() => {
    globalSocket?.disconnect();
    globalSocket = null;
  }, []);

  return { disconnect };
}
