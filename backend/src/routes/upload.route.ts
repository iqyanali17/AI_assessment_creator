import express, { Router } from 'express';
import { downloadUpload, uploadFile } from '@/controllers/upload.controller';

const router = Router();

router.post(
  '/',
  express.raw({
    type: ['application/pdf', 'text/plain'],
    limit: '10mb',
  }),
  uploadFile,
);
router.get('/:id/download', downloadUpload);

export default router;
