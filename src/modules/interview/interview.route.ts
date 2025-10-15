import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authMiddleware';
import { requireRecruiter, requireDeveloper } from '../../middlewares/authorizationMiddleware';
import * as interviewController from './interview.controller';

const router = Router();

/**
 * @route   POST /api/interviews/schedule
 * @desc    Schedule an interview for an application
 * @access  Private (Recruiter only)
 * @body    { applicationId, scheduledDate, duration, meetingLink?, location?, interviewerNotes? }
 */
router.post(
    '/schedule',
    authenticate,
    requireRecruiter,
    asyncHandler(interviewController.scheduleInterviewController)
);

/**
 * @route   GET /api/interviews/:id
 * @desc    Get interview details by interview ID
 * @access  Private (Recruiter who owns the job or Developer who applied)
 */
router.get(
    '/:id',
    authenticate,
    asyncHandler(interviewController.getInterviewController)
);

/**
 * @route   GET /api/interviews/application/:applicationId
 * @desc    Get interview details by application ID
 * @access  Private (Recruiter who owns the job or Developer who applied)
 */
router.get(
    '/application/:applicationId',
    authenticate,
    asyncHandler(interviewController.getInterviewByApplicationController)
);

/**
 * @route   PATCH /api/interviews/:id
 * @desc    Update interview details (reschedule, change duration, etc.)
 * @access  Private (Recruiter only)
 * @body    { scheduledDate?, duration?, meetingLink?, location?, interviewerNotes?, status? }
 */
router.patch(
    '/:id',
    authenticate,
    requireRecruiter,
    asyncHandler(interviewController.updateInterviewController)
);

/**
 * @route   DELETE /api/interviews/:id
 * @desc    Cancel interview
 * @access  Private (Recruiter only)
 */
router.delete(
    '/:id',
    authenticate,
    requireRecruiter,
    asyncHandler(interviewController.cancelInterviewController)
);

/**
 * @route   GET /api/interviews/recruiter/all
 * @desc    Get all interviews for recruiter
 * @access  Private (Recruiter only)
 * @query   status?, upcoming?, limit?, offset?
 */
router.get(
    '/recruiter/all',
    authenticate,
    requireRecruiter,
    asyncHandler(interviewController.getRecruiterInterviewsController)
);

/**
 * @route   GET /api/interviews/developer/all
 * @desc    Get all interviews for developer
 * @access  Private (Developer only)
 * @query   status?, upcoming?, limit?, offset?
 */
router.get(
    '/developer/all',
    authenticate,
    requireDeveloper,
    asyncHandler(interviewController.getDeveloperInterviewsController)
);

export default router;
