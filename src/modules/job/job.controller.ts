import { Response } from 'express';
import * as jobService from './job.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { BadRequestError } from '../../utils/customErrors';

/**
 * Controller to create a new job posting
 * Only accessible by recruiters
 */
export const createJobController = async (req: AuthRequest, res: Response) => {
    // Get recruiter ID from authenticated user
    const recruiterId = req.user?.userId;

    if (!recruiterId) {
        throw BadRequestError('User not authenticated');
    }

    // Create job with data from request body
    const job = await jobService.createJob({
        ...req.body,
        recruiterId,
    });

    successResponse(res, job, 'Job posted successfully', 201);
};

/**
 * Controller to get all jobs
 */
export const getAllJobsController = async (req: AuthRequest, res: Response) => {
    const jobs = await jobService.getAllJobs();
    successResponse(res, jobs, 'Jobs retrieved successfully', 200);
};

/**
 * Controller to get a single job by ID
 */
export const getJobByIdController = async (req: AuthRequest, res: Response) => {
    const jobId = parseInt(req.params.id);

    if (isNaN(jobId)) {
        throw BadRequestError('Invalid job ID');
    }

    const job = await jobService.getJobById(jobId);
    successResponse(res, job, 'Job retrieved successfully', 200);
};

/**
 * Controller to get all jobs posted by the authenticated recruiter
 */
export const getMyJobsController = async (req: AuthRequest, res: Response) => {
    const recruiterId = req.user?.userId;

    if (!recruiterId) {
        throw BadRequestError('User not authenticated');
    }

    const jobs = await jobService.getJobsByRecruiterId(recruiterId);
    successResponse(res, jobs, 'Your jobs retrieved successfully', 200);
};

/**
 * Controller to update a job posting
 */
export const updateJobController = async (req: AuthRequest, res: Response) => {
    const jobId = parseInt(req.params.id);
    const recruiterId = req.user?.userId;

    if (isNaN(jobId)) {
        throw BadRequestError('Invalid job ID');
    }

    if (!recruiterId) {
        throw BadRequestError('User not authenticated');
    }

    const updatedJob = await jobService.updateJob(jobId, recruiterId, req.body);
    successResponse(res, updatedJob, 'Job updated successfully', 200);
};

/**
 * Controller to delete a job posting
 */
export const deleteJobController = async (req: AuthRequest, res: Response) => {
    const jobId = parseInt(req.params.id);
    const recruiterId = req.user?.userId;

    if (isNaN(jobId)) {
        throw BadRequestError('Invalid job ID');
    }

    if (!recruiterId) {
        throw BadRequestError('User not authenticated');
    }

    const result = await jobService.deleteJob(jobId, recruiterId);
    successResponse(res, result, 'Job deleted successfully', 200);
};
