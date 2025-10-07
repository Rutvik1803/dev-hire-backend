import { Response } from 'express';
import * as applicationService from './application.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { BadRequestError } from '../../utils/customErrors';
import { ApplicationStatus } from '@prisma/client';

/**
 * Controller for developer to apply to a job
 * POST /api/jobs/:jobId/apply
 */
export const applyToJobController = async (req: AuthRequest, res: Response) => {
    const jobId = parseInt(req.params.jobId);
    const applicantId = req.user?.userId;

    if (isNaN(jobId)) {
        throw BadRequestError('Invalid job ID');
    }

    if (!applicantId) {
        throw BadRequestError('User not authenticated');
    }

    const { coverLetter } = req.body;

    const application = await applicationService.applyToJob(jobId, applicantId, coverLetter);
    successResponse(res, application, 'Application submitted successfully', 201);
};

/**
 * Controller to get all applications for a specific job
 * GET /api/jobs/:jobId/applications
 */
export const getJobApplicationsController = async (req: AuthRequest, res: Response) => {
    const jobId = parseInt(req.params.jobId);
    const recruiterId = req.user?.userId;

    if (isNaN(jobId)) {
        throw BadRequestError('Invalid job ID');
    }

    if (!recruiterId) {
        throw BadRequestError('User not authenticated');
    }

    const { status, sort } = req.query;

    // Validate status if provided
    let applicationStatus: ApplicationStatus | undefined;
    if (status) {
        const validStatuses = Object.values(ApplicationStatus);
        if (!validStatuses.includes(status as ApplicationStatus)) {
            throw BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        applicationStatus = status as ApplicationStatus;
    }

    // Validate sort if provided
    const sortOrder = sort === 'asc' ? 'asc' : 'desc';

    const applications = await applicationService.getApplicationsByJobId(
        jobId,
        recruiterId,
        applicationStatus,
        sortOrder
    );

    successResponse(
        res,
        { data: applications, count: applications.length },
        'Applications retrieved successfully',
        200
    );
};

/**
 * Controller to get all applications across all recruiter's jobs
 * GET /api/recruiter/applications
 */
export const getAllRecruiterApplicationsController = async (req: AuthRequest, res: Response) => {
    const recruiterId = req.user?.userId;

    if (!recruiterId) {
        throw BadRequestError('User not authenticated');
    }

    const { status, limit, offset, recent } = req.query;

    // Validate status if provided
    let applicationStatus: ApplicationStatus | undefined;
    if (status) {
        const validStatuses = Object.values(ApplicationStatus);
        if (!validStatuses.includes(status as ApplicationStatus)) {
            throw BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        applicationStatus = status as ApplicationStatus;
    }

    const filters = {
        status: applicationStatus,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        recent: recent === 'true',
    };

    const { applications, total } = await applicationService.getAllRecruiterApplications(
        recruiterId,
        filters
    );

    successResponse(
        res,
        {
            data: applications,
            total,
            limit: filters.limit || 50,
            offset: filters.offset || 0,
        },
        'Applications retrieved successfully',
        200
    );
};

/**
 * Controller to get recent applications for dashboard
 * GET /api/recruiter/applications/recent
 */
export const getRecentApplicationsController = async (req: AuthRequest, res: Response) => {
    const recruiterId = req.user?.userId;

    if (!recruiterId) {
        throw BadRequestError('User not authenticated');
    }

    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 10;

    if (limitNum > 20) {
        throw BadRequestError('Maximum limit is 20');
    }

    const applications = await applicationService.getRecentApplications(recruiterId, limitNum);
    successResponse(res, applications, 'Recent applications retrieved successfully', 200);
};

/**
 * Controller to get single application details
 * GET /api/applications/:applicationId
 */
export const getApplicationByIdController = async (req: AuthRequest, res: Response) => {
    const applicationId = parseInt(req.params.applicationId);
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (isNaN(applicationId)) {
        throw BadRequestError('Invalid application ID');
    }

    if (!userId || !userRole) {
        throw BadRequestError('User not authenticated');
    }

    const application = await applicationService.getApplicationById(
        applicationId,
        userId,
        userRole
    );
    successResponse(res, application, 'Application retrieved successfully', 200);
};

/**
 * Controller to update application status
 * PATCH /api/applications/:applicationId/status
 */
export const updateApplicationStatusController = async (req: AuthRequest, res: Response) => {
    const applicationId = parseInt(req.params.applicationId);
    const recruiterId = req.user?.userId;

    if (isNaN(applicationId)) {
        throw BadRequestError('Invalid application ID');
    }

    if (!recruiterId) {
        throw BadRequestError('User not authenticated');
    }

    const { status, note } = req.body;

    if (!status) {
        throw BadRequestError('Status is required');
    }

    const updatedApplication = await applicationService.updateApplicationStatus(
        applicationId,
        recruiterId,
        status as ApplicationStatus,
        note
    );

    successResponse(
        res,
        {
            id: updatedApplication.id,
            status: updatedApplication.status,
            updatedDate: updatedApplication.updatedDate,
        },
        'Application status updated successfully',
        200
    );
};

/**
 * Controller to get dashboard statistics
 * GET /api/recruiter/dashboard/stats
 */
export const getDashboardStatsController = async (req: AuthRequest, res: Response) => {
    const recruiterId = req.user?.userId;

    if (!recruiterId) {
        throw BadRequestError('User not authenticated');
    }

    const stats = await applicationService.getDashboardStats(recruiterId);
    successResponse(res, stats, 'Dashboard statistics retrieved successfully', 200);
};
