import { Worker, Job } from 'bullmq';
import redisClient from '@/lib/redis';
import { QUEUE_NAMES } from '@/lib/queue';
import Assignment from '@/models/Assignment';
import GeneratedPaper from '@/models/GeneratedPaper';
import { GeminiService } from '@/services/gemini.service';
import connectDB from '@/lib/mongodb';
import { AssessmentStatus } from '@/types/enums';

interface AssessmentJobData {
  assignmentId: string;
}

export const assessmentWorker = new Worker(
  QUEUE_NAMES.ASSESSMENT_GENERATION,
  async (job: Job<AssessmentJobData>) => {
    const { assignmentId } = job.data;

    await connectDB();

    const assignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { status: AssessmentStatus.PROCESSING },
      { new: true },
    );

    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    const generatedPaper = await GeminiService.generateQuestionPaper({
      subject: assignment.subject || assignment.title,
      questionType: assignment.questionType,
      numberOfQuestions: assignment.numberOfQuestions,
      totalMarks: assignment.totalMarks,
      instructions: assignment.additionalInstructions || '',
    });

    await GeneratedPaper.findOneAndUpdate(
      { assignmentId: assignment._id },
      {
        assignmentId: assignment._id,
        sections: generatedPaper.sections,
        generatedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true },
    );

    await Assignment.findByIdAndUpdate(assignmentId, {
      status: AssessmentStatus.COMPLETED,
    });

    return { success: true, assignmentId };
  },
  {
    connection: redisClient,
  },
);

assessmentWorker.on('failed', async (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);

  if (job && job.attemptsMade >= (job.opts.attempts || 3) - 1) {
    const { assignmentId } = job.data;
    if (assignmentId) {
      try {
        await connectDB();
        await Assignment.findByIdAndUpdate(assignmentId, {
          status: AssessmentStatus.FAILED,
        });
      } catch (dbErr) {
        console.error('Failed to mark assignment as FAILED:', dbErr);
      }
    }
  }
});

assessmentWorker.on('completed', (_job) => {
  // job completed successfully
});
