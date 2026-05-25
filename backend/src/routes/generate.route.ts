import { Router } from 'express';
import { generatePaper } from '@/controllers/generate.controller';

const router = Router();

// Define the POST route for generating the question paper
router.post('/', generatePaper);

export default router;
