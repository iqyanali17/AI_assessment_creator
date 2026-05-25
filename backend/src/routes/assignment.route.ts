import { Router } from 'express';
import {
  createAssignment,
  listAssignments,
  getAssignment,
  updateAssignment,
  getAssignmentResult,
  getAssignmentStatus,
  exportAssignmentPdf,
  regenerateAssignment,
  deleteAssignment,
} from '@/controllers/assignment.controller';

const router = Router();

router.post('/', createAssignment);
router.get('/', listAssignments);
router.get('/:id', getAssignment);
router.patch('/:id', updateAssignment);
router.get('/:id/status', getAssignmentStatus);
router.get('/:id/result', getAssignmentResult);
router.get('/:id/export/pdf', exportAssignmentPdf);
router.post('/:id/regenerate', regenerateAssignment);
router.delete('/:id', deleteAssignment);

export default router;
