import { Queue, QueueEvents } from 'bullmq';
import redisClient from './redis';

// Define queue names
export const QUEUE_NAMES = {
  ASSESSMENT_GENERATION: 'assessment-generation',
} as const;

// Create assessment generation queue
export const assessmentQueue = new Queue(QUEUE_NAMES.ASSESSMENT_GENERATION, {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 24 * 60 * 60,
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 60 * 60,
      count: 5000,
    },
  },
});

export const assessmentQueueEvents = new QueueEvents(QUEUE_NAMES.ASSESSMENT_GENERATION, {
  connection: redisClient,
});
