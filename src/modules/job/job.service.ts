import { prisma } from '../../config/prisma';
import { BadRequestError, NotFoundError } from '../../utils/customErrors';
import { JobType } from '@prisma/client';

// Type for creating a job
export type CreateJobData = {
    title: string;
    companyName: string;
    location: string;
    jobType: JobType;
    salaryRange: string;
    requiredSkills: string[];
    description: string;
    recruiterId: number;
};

/**
 * Service to create a new job posting
 */
export const createJob = async (jobData: CreateJobData) => {
    // Validate required fields
    if (
        !jobData.title ||
        !jobData.companyName ||
        !jobData.location ||
        !jobData.jobType ||
        !jobData.salaryRange ||
        !jobData.requiredSkills ||
        !jobData.description
    ) {
        throw BadRequestError('All job fields are required');
    }

    // Validate job type
    const validJobTypes = Object.values(JobType);
    if (!validJobTypes.includes(jobData.jobType)) {
        throw BadRequestError(
            `Invalid job type. Must be one of: ${validJobTypes.join(', ')}`,
        );
    }

    // Validate required skills array
    if (!Array.isArray(jobData.requiredSkills) || jobData.requiredSkills.length === 0) {
        throw BadRequestError('Required skills must be a non-empty array');
    }

    // Validate recruiter exists
    const recruiter = await prisma.user.findUnique({
        where: { id: jobData.recruiterId },
    });

    if (!recruiter) {
        throw NotFoundError('Recruiter not found');
    }

    if (recruiter.role !== 'RECRUITER') {
        throw BadRequestError('Only recruiters can post jobs');
    }

    // Create job
    const job = await prisma.job.create({
        data: {
            title: jobData.title,
            companyName: jobData.companyName,
            location: jobData.location,
            jobType: jobData.jobType,
            salaryRange: jobData.salaryRange,
            requiredSkills: jobData.requiredSkills,
            description: jobData.description,
            recruiterId: jobData.recruiterId,
        },
        include: {
            recruiter: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    return job;
};

/**
 * Service to get all jobs
 */
export const getAllJobs = async () => {
    const jobs = await prisma.job.findMany({
        include: {
            recruiter: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return jobs;
};

/**
 * Service to get a single job by ID
 */
export const getJobById = async (jobId: number) => {
    const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
            recruiter: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    if (!job) {
        throw NotFoundError('Job not found');
    }

    return job;
};

/**
 * Service to get all jobs posted by a specific recruiter
 */
export const getJobsByRecruiterId = async (recruiterId: number) => {
    const jobs = await prisma.job.findMany({
        where: { recruiterId },
        include: {
            recruiter: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return jobs;
};

/**
 * Service to update a job posting
 */
export const updateJob = async (jobId: number, recruiterId: number, updateData: Partial<CreateJobData>) => {
    // Check if job exists
    const job = await prisma.job.findUnique({
        where: { id: jobId },
    });

    if (!job) {
        throw NotFoundError('Job not found');
    }

    // Check if the recruiter owns the job
    if (job.recruiterId !== recruiterId) {
        throw BadRequestError('You are not authorized to update this job');
    }

    // Validate job type if provided
    if (updateData.jobType) {
        const validJobTypes = Object.values(JobType);
        if (!validJobTypes.includes(updateData.jobType)) {
            throw BadRequestError(
                `Invalid job type. Must be one of: ${validJobTypes.join(', ')}`,
            );
        }
    }

    // Validate required skills array if provided
    if (updateData.requiredSkills !== undefined) {
        if (!Array.isArray(updateData.requiredSkills) || updateData.requiredSkills.length === 0) {
            throw BadRequestError('Required skills must be a non-empty array');
        }
    }

    // Update job
    const updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: {
            ...(updateData.title && { title: updateData.title }),
            ...(updateData.companyName && { companyName: updateData.companyName }),
            ...(updateData.location && { location: updateData.location }),
            ...(updateData.jobType && { jobType: updateData.jobType }),
            ...(updateData.salaryRange && { salaryRange: updateData.salaryRange }),
            ...(updateData.requiredSkills && { requiredSkills: updateData.requiredSkills }),
            ...(updateData.description && { description: updateData.description }),
            updatedAt: new Date(),
        },
        include: {
            recruiter: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    return updatedJob;
};

/**
 * Service to delete a job posting
 */
export const deleteJob = async (jobId: number, recruiterId: number) => {
    // Check if job exists
    const job = await prisma.job.findUnique({
        where: { id: jobId },
    });

    if (!job) {
        throw NotFoundError('Job not found');
    }

    // Check if the recruiter owns the job
    if (job.recruiterId !== recruiterId) {
        throw BadRequestError('You are not authorized to delete this job');
    }

    // Delete job (will cascade delete applications due to onDelete: Cascade)
    await prisma.job.delete({
        where: { id: jobId },
    });

    return { message: 'Job deleted successfully' };
};
