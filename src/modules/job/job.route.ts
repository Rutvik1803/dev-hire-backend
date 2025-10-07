import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authMiddleware';
import { requireRecruiter, requireDeveloper } from '../../middlewares/authorizationMiddleware';
import {
    createJobController,
    getAllJobsController,
    getJobByIdController,
    getMyJobsController,
    updateJobController,
    deleteJobController,
} from './job.controller';
import { checkApplicationStatusController } from '../developer/developer.controller';

const router = Router();

// Public route - Get all jobs (anyone can view)
router.get('/', asyncHandler(getAllJobsController));

// Protected routes - Require authentication
// Get jobs posted by authenticated recruiter (must come before /:id to avoid conflict)
router.get('/my/jobs', authenticate, requireRecruiter, asyncHandler(getMyJobsController));

// Public route - Get single job by ID (anyone can view)
router.get('/:id', asyncHandler(getJobByIdController));

// Developer route - Check if developer has applied to a job
router.get('/:jobId/application-status', authenticate, requireDeveloper, asyncHandler(checkApplicationStatusController));

// Create new job - Only recruiters can post jobs
router.post('/', authenticate, requireRecruiter, asyncHandler(createJobController));

// Update job - Only job owner (recruiter) can update
router.put('/:id', authenticate, requireRecruiter, asyncHandler(updateJobController));

// Delete job - Only job owner (recruiter) can delete
router.delete('/:id', authenticate, requireRecruiter, asyncHandler(deleteJobController));

export default router;
