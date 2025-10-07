import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authMiddleware';
import { requireDeveloper } from '../../middlewares/authorizationMiddleware';
import { uploadResume } from '../../middlewares/uploadMiddleware';
import * as developerController from './developer.controller';

const router = Router();

/**
 * All developer routes require authentication and DEVELOPER role
 */

/**
 * @route   GET /api/developer/dashboard/stats
 * @desc    Get developer dashboard statistics
 * @access  Private (Developer only)
 */
router.get(
    '/dashboard/stats',
    authenticate,
    requireDeveloper,
    asyncHandler(developerController.getDeveloperDashboardStatsController)
);

/**
 * @route   GET /api/developer/applications
 * @desc    Get all applications for the developer with filters and pagination
 * @access  Private (Developer only)
 * @query   status - Filter by ApplicationStatus (optional)
 * @query   limit - Number of records per page (optional, default: 50)
 * @query   offset - Number of records to skip (optional, default: 0)
 * @query   sort - Sort order: 'asc' or 'desc' (optional, default: 'desc')
 */
router.get(
    '/applications',
    authenticate,
    requireDeveloper,
    asyncHandler(developerController.getDeveloperApplicationsController)
);

/**
 * @route   GET /api/developer/applications/recent
 * @desc    Get recent applications (last 30 days)
 * @access  Private (Developer only)
 * @query   limit - Number of records (optional, default: 10, max: 20)
 */
router.get(
    '/applications/recent',
    authenticate,
    requireDeveloper,
    asyncHandler(developerController.getRecentDeveloperApplicationsController)
);

/**
 * @route   GET /api/developer/profile
 * @desc    Get developer profile
 * @access  Private (Developer only)
 */
router.get(
    '/profile',
    authenticate,
    requireDeveloper,
    asyncHandler(developerController.getDeveloperProfileController)
);

/**
 * @route   PATCH /api/developer/profile
 * @desc    Update developer profile
 * @access  Private (Developer only)
 * @body    experience, skills, linkedinUrl, githubUrl, phone (all optional)
 */
router.patch(
    '/profile',
    authenticate,
    requireDeveloper,
    asyncHandler(developerController.updateDeveloperProfileController)
);

/**
 * @route   POST /api/developer/resume/upload
 * @desc    Upload resume file (PDF or DOC)
 * @access  Private (Developer only)
 * @body    resume - File upload (multipart/form-data)
 */
router.post(
    '/resume/upload',
    authenticate,
    requireDeveloper,
    uploadResume,
    asyncHandler(developerController.uploadResumeController)
);

/**
 * @route   GET /api/developer/resume
 * @desc    Get resume details
 * @access  Private (Developer only)
 */
router.get(
    '/resume',
    authenticate,
    requireDeveloper,
    asyncHandler(developerController.getResumeDetailsController)
);

/**
 * @route   DELETE /api/developer/resume
 * @desc    Delete resume
 * @access  Private (Developer only)
 */
router.delete(
    '/resume',
    authenticate,
    requireDeveloper,
    asyncHandler(developerController.deleteResumeController)
);

export default router;
