import { Request, Response } from 'express';
import { assessmentQueue } from '@/lib/queue';
import Assignment from '@/models/Assignment';
import { AssessmentStatus } from '@/types/enums';

const getRouteParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export const getJobStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = getRouteParam(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        errors: {
          id: ['Job ID is required.'],
        },
      });
    }

    const job = await assessmentQueue.getJob(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found.',
        errors: {
          id: ['No queue job exists with this ID.'],
        },
      });
    }

    const state = await job.getState();

    return res.status(200).json({
      success: true,
      data: {
        job: {
          id: job.id,
          name: job.name,
          state,
          progress: job.progress,
          attemptsMade: job.attemptsMade,
          createdAt: job.timestamp ? new Date(job.timestamp).toISOString() : null,
          processedAt: job.processedOn ? new Date(job.processedOn).toISOString() : null,
          finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
        },
      },
    });
  } catch (error) {
    console.error('Get job status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to fetch job status.',
      errors: {
        job: ['Job status could not be fetched. Please try again.'],
      },
    });
  }
};

export const cancelJob = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = getRouteParam(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        errors: {
          id: ['Job ID is required.'],
        },
      });
    }

    const job = await assessmentQueue.getJob(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found.',
        errors: {
          id: ['No queue job exists with this ID.'],
        },
      });
    }

    const state = await job.getState();

    if (state === 'active') {
      return res.status(409).json({
        success: false,
        error: 'Job is already processing.',
        errors: {
          job: ['Active jobs cannot be safely cancelled. Wait for completion or retry after failure.'],
        },
      });
    }

    if (['completed', 'failed'].includes(state)) {
      return res.status(409).json({
        success: false,
        error: `Job is already ${state}.`,
        errors: {
          job: [`${state} jobs cannot be cancelled.`],
        },
      });
    }

    await job.remove();

    if (job.data?.assignmentId) {
      await Assignment.findByIdAndUpdate(job.data.assignmentId, {
        status: AssessmentStatus.FAILED,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job cancelled successfully.',
      data: {
        jobId: id,
        assignmentId: job.data?.assignmentId,
      },
    });
  } catch (error) {
    console.error('Cancel job error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to cancel job.',
      errors: {
        job: ['Job could not be cancelled. Please try again.'],
      },
    });
  }
};
