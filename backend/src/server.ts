import http from 'http';
import app from './app';
import connectDB from './lib/mongodb';
import { assessmentQueue, assessmentQueueEvents } from './lib/queue';
import { initSocket } from './lib/socket';

// Import the worker so it starts automatically within the server process.
// This ensures jobs are always processed — no need to run `npm run worker` separately.
import './workers/assessment.worker';

const PORT = process.env.PORT || 3001;

const getAssignmentIdForJob = async (jobId: string) => {
  const job = await assessmentQueue.getJob(jobId);
  return job?.data?.assignmentId;
};

const parseQueueReturnValue = (returnvalue: unknown) => {
  if (typeof returnvalue !== 'string') {
    return returnvalue as { assignmentId?: string } | undefined;
  }

  try {
    return JSON.parse(returnvalue) as { assignmentId?: string };
  } catch {
    return undefined;
  }
};

const startServer = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== 'production') {
      console.log('MongoDB connected');
    }

    const server = http.createServer(app);
    const io = initSocket(server);

    assessmentQueueEvents.on('waiting', async ({ jobId }) => {
      const assignmentId = await getAssignmentIdForJob(jobId);
      io.emit('assignment:status', {
        assignmentId,
        jobId,
        status: 'pending',
      });
    });

    assessmentQueueEvents.on('active', async ({ jobId }) => {
      const assignmentId = await getAssignmentIdForJob(jobId);
      io.emit('assignment:status', {
        assignmentId,
        jobId,
        status: 'processing',
      });
    });

    assessmentQueueEvents.on('completed', async ({ jobId, returnvalue }) => {
      const result = parseQueueReturnValue(returnvalue);
      const assignmentId = result?.assignmentId || await getAssignmentIdForJob(jobId);
      const payload = {
        assignmentId,
        jobId,
        status: 'completed',
        result,
      };

      io.emit('assignment:status', payload);
      io.emit('assignment:completed', payload);
    });

    assessmentQueueEvents.on('failed', async ({ jobId, failedReason }) => {
      const assignmentId = await getAssignmentIdForJob(jobId);
      const payload = {
        assignmentId,
        jobId,
        status: 'failed',
        error: failedReason,
      };

      io.emit('assignment:status', payload);
      io.emit('assignment:failed', payload);
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
