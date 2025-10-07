import { prisma } from '../../config/prisma';
import { BadRequestError, NotFoundError, ForbiddenError, ConflictError } from '../../utils/customErrors';
import { ApplicationStatus } from '@prisma/client';

/**
 * Service to create a new job application
 */
export const applyToJob = async (jobId: number, applicantId: number, coverLetter?: string) => {
    // Check if job exists
    const job = await prisma.job.findUnique({
        where: { id: jobId },
    });

    if (!job) {
        throw NotFoundError('Job not found');
    }

    // Check if user is a developer
    const applicant = await prisma.user.findUnique({
        where: { id: applicantId },
    });

    if (!applicant) {
        throw NotFoundError('User not found');
    }

    if (applicant.role !== 'DEVELOPER') {
        throw ForbiddenError('Only developers can apply to jobs');
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
        where: {
            jobId_applicantId: {
                jobId,
                applicantId,
            },
        },
    });

    if (existingApplication) {
        throw ConflictError('You have already applied to this job');
    }

    // Create application
    const application = await prisma.application.create({
        data: {
            jobId,
            applicantId,
            coverLetter,
            status: ApplicationStatus.APPLIED,
        },
        include: {
            job: {
                include: {
                    recruiter: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            applicant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    experience: true,
                    skills: true,
                    resumeUrl: true,
                    linkedinUrl: true,
                    githubUrl: true,
                    phone: true,
                },
            },
        },
    });

    return application;
};

/**
 * Service to get all applications for a specific job
 */
export const getApplicationsByJobId = async (
    jobId: number,
    recruiterId: number,
    status?: ApplicationStatus,
    sort: 'asc' | 'desc' = 'desc'
) => {
    // Verify job exists and belongs to recruiter
    const job = await prisma.job.findUnique({
        where: { id: jobId },
    });

    if (!job) {
        throw NotFoundError('Job not found');
    }

    if (job.recruiterId !== recruiterId) {
        throw ForbiddenError('You are not authorized to view applications for this job');
    }

    // Build where clause
    const whereClause: any = { jobId };
    if (status) {
        whereClause.status = status;
    }

    // Get applications
    const applications = await prisma.application.findMany({
        where: whereClause,
        include: {
            applicant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    experience: true,
                    skills: true,
                    resumeUrl: true,
                    linkedinUrl: true,
                    githubUrl: true,
                    phone: true,
                },
            },
        },
        orderBy: {
            appliedDate: sort,
        },
    });

    return applications;
};

/**
 * Service to get all applications for all recruiter's jobs
 */
export const getAllRecruiterApplications = async (
    recruiterId: number,
    filters: {
        status?: ApplicationStatus;
        limit?: number;
        offset?: number;
        recent?: boolean;
    }
) => {
    // Get all job IDs for this recruiter
    const recruiterJobs = await prisma.job.findMany({
        where: { recruiterId },
        select: { id: true },
    });

    const jobIds = recruiterJobs.map(job => job.id);

    if (jobIds.length === 0) {
        return { applications: [], total: 0 };
    }

    // Build where clause
    const whereClause: any = {
        jobId: { in: jobIds },
    };

    if (filters.status) {
        whereClause.status = filters.status;
    }

    if (filters.recent) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        whereClause.appliedDate = { gte: thirtyDaysAgo };
    }

    // Get total count
    const total = await prisma.application.count({ where: whereClause });

    // Get applications with pagination
    const applications = await prisma.application.findMany({
        where: whereClause,
        include: {
            applicant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    experience: true,
                    skills: true,
                },
            },
            job: {
                select: {
                    id: true,
                    title: true,
                    companyName: true,
                },
            },
        },
        orderBy: {
            appliedDate: 'desc',
        },
        take: filters.limit || 50,
        skip: filters.offset || 0,
    });

    return { applications, total };
};

/**
 * Service to get recent applications for dashboard
 */
export const getRecentApplications = async (recruiterId: number, limit: number = 10) => {
    // Get all job IDs for this recruiter
    const recruiterJobs = await prisma.job.findMany({
        where: { recruiterId },
        select: { id: true },
    });

    const jobIds = recruiterJobs.map(job => job.id);

    if (jobIds.length === 0) {
        return [];
    }

    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const applications = await prisma.application.findMany({
        where: {
            jobId: { in: jobIds },
            appliedDate: { gte: sevenDaysAgo },
        },
        include: {
            applicant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            job: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
        orderBy: {
            appliedDate: 'desc',
        },
        take: Math.min(limit, 20), // Max 20
    });

    return applications;
};

/**
 * Service to get single application details
 */
export const getApplicationById = async (applicationId: number, userId: number, userRole: string) => {
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
            applicant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    experience: true,
                    skills: true,
                    resumeUrl: true,
                    linkedinUrl: true,
                    githubUrl: true,
                },
            },
            job: {
                include: {
                    recruiter: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });

    if (!application) {
        throw NotFoundError('Application not found');
    }

    // Check authorization
    // Recruiter can view if they own the job, Developer can view if they own the application
    const isRecruiterOwner = userRole === 'RECRUITER' && application.job.recruiterId === userId;
    const isDeveloperOwner = userRole === 'DEVELOPER' && application.applicantId === userId;

    if (!isRecruiterOwner && !isDeveloperOwner) {
        throw ForbiddenError('You are not authorized to view this application');
    }

    return application;
};

/**
 * Service to update application status
 */
export const updateApplicationStatus = async (
    applicationId: number,
    recruiterId: number,
    status: ApplicationStatus,
    note?: string
) => {
    // Validate status
    const validStatuses = Object.values(ApplicationStatus);
    if (!validStatuses.includes(status)) {
        throw BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Get application and verify ownership
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
            job: true,
        },
    });

    if (!application) {
        throw NotFoundError('Application not found');
    }

    if (application.job.recruiterId !== recruiterId) {
        throw ForbiddenError('You are not authorized to update this application');
    }

    // Update application
    const updatedApplication = await prisma.application.update({
        where: { id: applicationId },
        data: {
            status,
            notes: note,
            updatedDate: new Date(),
        },
        include: {
            applicant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            job: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });

    return updatedApplication;
};

/**
 * Service to get dashboard statistics
 */
export const getDashboardStats = async (recruiterId: number) => {
    // Get all job IDs for this recruiter
    const recruiterJobs = await prisma.job.findMany({
        where: { recruiterId },
        select: { id: true },
    });

    const jobIds = recruiterJobs.map(job => job.id);
    const jobsPosted = recruiterJobs.length;

    if (jobIds.length === 0) {
        return {
            jobsPosted: 0,
            totalApplicants: 0,
            inReview: 0,
            hired: 0,
            recentActivity: {
                newApplicationsToday: 0,
                newApplicationsThisWeek: 0,
            },
        };
    }

    // Get all applications counts
    const totalApplicants = await prisma.application.count({
        where: { jobId: { in: jobIds } },
    });

    const inReview = await prisma.application.count({
        where: {
            jobId: { in: jobIds },
            status: ApplicationStatus.IN_REVIEW,
        },
    });

    const hired = await prisma.application.count({
        where: {
            jobId: { in: jobIds },
            status: ApplicationStatus.ACCEPTED,
        },
    });

    // Get recent activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const newApplicationsToday = await prisma.application.count({
        where: {
            jobId: { in: jobIds },
            appliedDate: { gte: today },
        },
    });

    const newApplicationsThisWeek = await prisma.application.count({
        where: {
            jobId: { in: jobIds },
            appliedDate: { gte: oneWeekAgo },
        },
    });

    return {
        jobsPosted,
        totalApplicants,
        inReview,
        hired,
        recentActivity: {
            newApplicationsToday,
            newApplicationsThisWeek,
        },
    };
};
