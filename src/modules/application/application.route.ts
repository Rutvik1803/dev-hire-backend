import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authMiddleware';
import { requireRecruiter } from '../../middlewares/authorizationMiddleware';
import {
    applyToJobController,
    getJobApplicationsController,
    getAllRecruiterApplicationsController,
    getRecentApplicationsController,
    getApplicationByIdController,
    updateApplicationStatusController,
    getDashboardStatsController,
} from './application.controller';

const router = Router();

// Developer routes - Apply to a job
router.post('/jobs/:jobId/apply', authenticate, asyncHandler(applyToJobController));

// Recruiter routes - Get all applications for a specific job
router.get(
    '/jobs/:jobId/applications',
    authenticate,
    requireRecruiter,
    asyncHandler(getJobApplicationsController)
);

// Recruiter routes - Dashboard and application management
router.get(
    '/recruiter/dashboard/stats',
    authenticate,
    requireRecruiter,
    asyncHandler(getDashboardStatsController)
);

router.get(
    '/recruiter/applications/recent',
    authenticate,
    requireRecruiter,
    asyncHandler(getRecentApplicationsController)
);

router.get(
    '/recruiter/applications',
    authenticate,
    requireRecruiter,
    asyncHandler(getAllRecruiterApplicationsController)
);

// Application detail and status update routes
router.get('/applications/:applicationId', authenticate, asyncHandler(getApplicationByIdController));

router.patch(
    '/applications/:applicationId/status',
    authenticate,
    requireRecruiter,
    asyncHandler(updateApplicationStatusController)
);

export default router;
