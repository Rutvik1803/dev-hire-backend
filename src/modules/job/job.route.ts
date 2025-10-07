import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authMiddleware';
import { requireRecruiter } from '../../middlewares/authorizationMiddleware';
import {
  createJobController,
  getAllJobsController,
  getJobByIdController,
  getMyJobsController,
} from './job.controller';

const router = Router();

// Public route - Get all jobs (anyone can view)
router.get('/', asyncHandler(getAllJobsController));

// Public route - Get single job by ID (anyone can view)
router.get('/:id', asyncHandler(getJobByIdController));

// Protected routes - Require authentication
// Create new job - Only recruiters can post jobs
router.post('/', authenticate, requireRecruiter, asyncHandler(createJobController));

// Get jobs posted by authenticated recruiter
router.get('/my/jobs', authenticate, requireRecruiter, asyncHandler(getMyJobsController));

export default router;
