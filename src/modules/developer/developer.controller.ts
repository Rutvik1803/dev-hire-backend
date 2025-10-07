import { Response } from 'express';
import * as developerService from './developer.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { BadRequestError } from '../../utils/customErrors';
import { ApplicationStatus } from '@prisma/client';
import path from 'path';
import fs from 'fs';

/**
 * Controller to get developer dashboard statistics
 * GET /api/developer/dashboard/stats
 */
export const getDeveloperDashboardStatsController = async (req: AuthRequest, res: Response) => {
    const developerId = req.user?.userId;

    if (!developerId) {
        throw BadRequestError('User not authenticated');
    }

    const stats = await developerService.getDeveloperDashboardStats(developerId);
    successResponse(res, stats, 'Dashboard statistics retrieved successfully', 200);
};

/**
 * Controller to get all applications for developer
 * GET /api/developer/applications
 */
export const getDeveloperApplicationsController = async (req: AuthRequest, res: Response) => {
    const developerId = req.user?.userId;

    if (!developerId) {
        throw BadRequestError('User not authenticated');
    }

    const { status, limit, offset, sort } = req.query;

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
        sort: (sort as 'asc' | 'desc') || 'desc',
    };

    const { applications, total } = await developerService.getDeveloperApplications(developerId, filters);

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
 * Controller to get recent applications for developer
 * GET /api/developer/applications/recent
 */
export const getRecentDeveloperApplicationsController = async (req: AuthRequest, res: Response) => {
    const developerId = req.user?.userId;

    if (!developerId) {
        throw BadRequestError('User not authenticated');
    }

    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 10;

    if (limitNum > 20) {
        throw BadRequestError('Maximum limit is 20');
    }

    const applications = await developerService.getRecentDeveloperApplications(developerId, limitNum);
    successResponse(res, applications, 'Recent applications retrieved successfully', 200);
};

/**
 * Controller to check application status for a job
 * GET /api/jobs/:jobId/application-status
 */
export const checkApplicationStatusController = async (req: AuthRequest, res: Response) => {
    const jobId = parseInt(req.params.jobId);
    const developerId = req.user?.userId;

    if (isNaN(jobId)) {
        throw BadRequestError('Invalid job ID');
    }

    if (!developerId) {
        throw BadRequestError('User not authenticated');
    }

    const status = await developerService.checkApplicationStatus(jobId, developerId);
    successResponse(res, status, 'Application status retrieved', 200);
};

/**
 * Controller to withdraw an application
 * DELETE /api/applications/:applicationId
 */
export const withdrawApplicationController = async (req: AuthRequest, res: Response) => {
    const applicationId = parseInt(req.params.applicationId);
    const developerId = req.user?.userId;

    if (isNaN(applicationId)) {
        throw BadRequestError('Invalid application ID');
    }

    if (!developerId) {
        throw BadRequestError('User not authenticated');
    }

    const result = await developerService.withdrawApplication(applicationId, developerId);
    successResponse(res, result, 'Application withdrawn successfully', 200);
};

/**
 * Controller to get developer profile
 * GET /api/developer/profile
 */
export const getDeveloperProfileController = async (req: AuthRequest, res: Response) => {
    const developerId = req.user?.userId;

    if (!developerId) {
        throw BadRequestError('User not authenticated');
    }

    const profile = await developerService.getDeveloperProfile(developerId);
    successResponse(res, profile, 'Profile retrieved successfully', 200);
};

/**
 * Controller to update developer profile
 * PATCH /api/developer/profile
 */
export const updateDeveloperProfileController = async (req: AuthRequest, res: Response) => {
    const developerId = req.user?.userId;

    if (!developerId) {
        throw BadRequestError('User not authenticated');
    }

    const { experience, skills, linkedinUrl, githubUrl, phone } = req.body;

    const profileData = {
        ...(experience !== undefined && { experience }),
        ...(skills !== undefined && { skills }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(phone !== undefined && { phone }),
    };

    const updatedProfile = await developerService.updateDeveloperProfile(developerId, profileData);
    successResponse(res, updatedProfile, 'Profile updated successfully', 200);
};

/**
 * Controller to upload resume
 * POST /api/developer/resume/upload
 */
export const uploadResumeController = async (req: AuthRequest, res: Response) => {
    const developerId = req.user?.userId;

    if (!developerId) {
        throw BadRequestError('User not authenticated');
    }

    if (!req.file) {
        throw BadRequestError('No file uploaded');
    }

    // Get file details
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    // Update user's resume URL in database
    const result = await developerService.updateResumeUrl(developerId, resumeUrl, fileName, fileSize);

    successResponse(res, result, 'Resume uploaded successfully', 200);
};

/**
 * Controller to get resume details
 * GET /api/developer/resume
 */
export const getResumeDetailsController = async (req: AuthRequest, res: Response) => {
    const developerId = req.user?.userId;

    if (!developerId) {
        throw BadRequestError('User not authenticated');
    }

    const resumeDetails = await developerService.getResumeDetails(developerId);

    if (!resumeDetails) {
        successResponse(res, null, 'No resume found', 200);
    } else {
        successResponse(res, resumeDetails, 'Resume details retrieved successfully', 200);
    }
};

/**
 * Controller to delete resume
 * DELETE /api/developer/resume
 */
export const deleteResumeController = async (req: AuthRequest, res: Response) => {
    const developerId = req.user?.userId;

    if (!developerId) {
        throw BadRequestError('User not authenticated');
    }

    // Get current resume URL to delete file
    const currentResume = await developerService.getResumeDetails(developerId);

    if (currentResume && currentResume.resumeUrl) {
        // Delete file from filesystem
        const filePath = path.join(process.cwd(), 'uploads', 'resumes', path.basename(currentResume.resumeUrl));

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    // Delete from database
    const result = await developerService.deleteResume(developerId);
    successResponse(res, result, 'Resume deleted successfully', 200);
};
