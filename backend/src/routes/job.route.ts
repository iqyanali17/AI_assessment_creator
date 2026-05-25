import { Router } from 'express';
import { cancelJob, getJobStatus } from '@/controllers/job.controller';

const router = Router();

router.get('/:id', getJobStatus);
router.delete('/:id', cancelJob);

export default router;
