import { prisma } from '../../config/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/customErrors';
import { ApplicationStatus, InterviewStatus } from '@prisma/client';

// Type for scheduling interview
export type ScheduleInterviewData = {
    applicationId: number;
    scheduledDate: Date | string;
    duration: number; // in minutes (60, 90, 120, etc.)
    meetingLink?: string;
    location?: string;
    interviewerNotes?: string;
};

// Type for updating interview
export type UpdateInterviewData = {
    scheduledDate?: Date | string;
    duration?: number;
    meetingLink?: string;
    location?: string;
    interviewerNotes?: string;
    status?: InterviewStatus;
};

/**
 * Service to schedule an interview for an application
 */
export const scheduleInterview = async (
    data: ScheduleInterviewData,
    recruiterId: number
): Promise<any> => {
    // Validate input
    if (!data.applicationId) {
        throw BadRequestError('Application ID is required');
    }

    if (!data.scheduledDate) {
        throw BadRequestError('Scheduled date is required');
    }

    if (!data.duration || data.duration <= 0) {
        throw BadRequestError('Duration must be a positive number (in minutes)');
    }

    // Validate duration (must be reasonable - between 15 and 480 minutes / 8 hours)
    if (data.duration < 15 || data.duration > 480) {
        throw BadRequestError('Duration must be between 15 and 480 minutes (8 hours)');
    }

    // Parse and validate date
    const scheduledDate = new Date(data.scheduledDate);
    if (isNaN(scheduledDate.getTime())) {
        throw BadRequestError('Invalid date format');
    }

    // Check if date is in the future
    const now = new Date();
    if (scheduledDate <= now) {
        throw BadRequestError('Interview date must be in the future');
    }

    // Get application with job details
    const application = await prisma.application.findUnique({
        where: { id: data.applicationId },
        include: {
            job: true,
            applicant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    if (!application) {
        throw NotFoundError('Application not found');
    }

    // Verify that the recruiter owns the job
    if (application.job.recruiterId !== recruiterId) {
        throw ForbiddenError('You are not authorized to schedule interviews for this application');
    }

    // Check if interview already exists
    const existingInterview = await prisma.interview.findUnique({
        where: { applicationId: data.applicationId },
    });

    if (existingInterview) {
        throw BadRequestError('Interview already scheduled for this application. Use update endpoint to modify.');
    }

    // Create interview and update application status in a transaction
    const result = await prisma.$transaction(async (tx) => {
        // Create interview
        const interview = await tx.interview.create({
            data: {
                applicationId: data.applicationId,
                scheduledDate,
                duration: data.duration,
                meetingLink: data.meetingLink,
                location: data.location || 'Virtual',
                interviewerNotes: data.interviewerNotes,
                status: InterviewStatus.SCHEDULED,
            },
        });

        // Update application status to IN_REVIEW
        const updatedApplication = await tx.application.update({
            where: { id: data.applicationId },
            data: {
                status: ApplicationStatus.IN_REVIEW,
                updatedDate: new Date(),
            },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        companyName: true,
                    },
                },
                applicant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        return { interview, application: updatedApplication };
    });

    return result;
};

/**
 * Service to get interview details
 */
export const getInterviewById = async (
    interviewId: number,
    userId: number,
    userRole: string
): Promise<any> => {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
            application: {
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
                            phone: true,
                            experience: true,
                            skills: true,
                            resumeUrl: true,
                            linkedinUrl: true,
                            githubUrl: true,
                        },
                    },
                },
            },
        },
    });

    if (!interview) {
        throw NotFoundError('Interview not found');
    }

    // Check authorization
    const isRecruiter = userRole === 'RECRUITER' && interview.application.job.recruiterId === userId;
    const isDeveloper = userRole === 'DEVELOPER' && interview.application.applicantId === userId;

    if (!isRecruiter && !isDeveloper) {
        throw ForbiddenError('You are not authorized to view this interview');
    }

    return interview;
};

/**
 * Service to get interview by application ID
 */
export const getInterviewByApplicationId = async (
    applicationId: number,
    userId: number,
    userRole: string
): Promise<any> => {
    const interview = await prisma.interview.findUnique({
        where: { applicationId },
        include: {
            application: {
                include: {
                    job: {
                        select: {
                            id: true,
                            title: true,
                            companyName: true,
                            recruiterId: true,
                        },
                    },
                    applicant: {
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

    if (!interview) {
        return null; // No interview scheduled yet
    }

    // Check authorization
    const isRecruiter = userRole === 'RECRUITER' && interview.application.job.recruiterId === userId;
    const isDeveloper = userRole === 'DEVELOPER' && interview.application.applicantId === userId;

    if (!isRecruiter && !isDeveloper) {
        throw ForbiddenError('You are not authorized to view this interview');
    }

    return interview;
};

/**
 * Service to update interview details
 */
export const updateInterview = async (
    interviewId: number,
    updateData: UpdateInterviewData,
    recruiterId: number
): Promise<any> => {
    // Get interview with application details
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
            application: {
                include: {
                    job: true,
                },
            },
        },
    });

    if (!interview) {
        throw NotFoundError('Interview not found');
    }

    // Verify authorization
    if (interview.application.job.recruiterId !== recruiterId) {
        throw ForbiddenError('You are not authorized to update this interview');
    }

    // Validate date if provided
    let scheduledDate: Date | undefined;
    if (updateData.scheduledDate) {
        scheduledDate = new Date(updateData.scheduledDate);
        if (isNaN(scheduledDate.getTime())) {
            throw BadRequestError('Invalid date format');
        }

        // Check if date is in the future
        const now = new Date();
        if (scheduledDate <= now) {
            throw BadRequestError('Interview date must be in the future');
        }
    }

    // Validate duration if provided
    if (updateData.duration !== undefined) {
        if (updateData.duration < 15 || updateData.duration > 480) {
            throw BadRequestError('Duration must be between 15 and 480 minutes (8 hours)');
        }
    }

    // Update interview
    const updatedInterview = await prisma.interview.update({
        where: { id: interviewId },
        data: {
            ...(scheduledDate && { scheduledDate }),
            ...(updateData.duration && { duration: updateData.duration }),
            ...(updateData.meetingLink !== undefined && { meetingLink: updateData.meetingLink }),
            ...(updateData.location !== undefined && { location: updateData.location }),
            ...(updateData.interviewerNotes !== undefined && { interviewerNotes: updateData.interviewerNotes }),
            ...(updateData.status && { status: updateData.status }),
            updatedAt: new Date(),
        },
        include: {
            application: {
                include: {
                    job: {
                        select: {
                            id: true,
                            title: true,
                            companyName: true,
                        },
                    },
                    applicant: {
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

    return updatedInterview;
};

/**
 * Service to cancel interview
 */
export const cancelInterview = async (
    interviewId: number,
    recruiterId: number
): Promise<any> => {
    // Get interview with application details
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
            application: {
                include: {
                    job: true,
                },
            },
        },
    });

    if (!interview) {
        throw NotFoundError('Interview not found');
    }

    // Verify authorization
    if (interview.application.job.recruiterId !== recruiterId) {
        throw ForbiddenError('You are not authorized to cancel this interview');
    }

    // Update interview status to CANCELLED
    const cancelledInterview = await prisma.interview.update({
        where: { id: interviewId },
        data: {
            status: InterviewStatus.CANCELLED,
            updatedAt: new Date(),
        },
        include: {
            application: {
                include: {
                    job: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    applicant: {
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

    return cancelledInterview;
};

/**
 * Service to get all interviews for a recruiter
 */
export const getRecruiterInterviews = async (
    recruiterId: number,
    filters: {
        status?: InterviewStatus;
        upcoming?: boolean;
        limit?: number;
        offset?: number;
    }
): Promise<{ interviews: any[]; total: number }> => {
    // Get all job IDs for this recruiter
    const recruiterJobs = await prisma.job.findMany({
        where: { recruiterId },
        select: { id: true },
    });

    const jobIds = recruiterJobs.map(job => job.id);

    if (jobIds.length === 0) {
        return { interviews: [], total: 0 };
    }

    // Build where clause
    const whereClause: any = {
        application: {
            jobId: { in: jobIds },
        },
    };

    if (filters.status) {
        whereClause.status = filters.status;
    }

    if (filters.upcoming) {
        whereClause.scheduledDate = { gte: new Date() };
        whereClause.status = { in: [InterviewStatus.SCHEDULED, InterviewStatus.RESCHEDULED] };
    }

    // Get total count
    const total = await prisma.interview.count({ where: whereClause });

    // Get interviews with pagination
    const interviews = await prisma.interview.findMany({
        where: whereClause,
        include: {
            application: {
                include: {
                    job: {
                        select: {
                            id: true,
                            title: true,
                            companyName: true,
                        },
                    },
                    applicant: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            skills: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            scheduledDate: 'asc',
        },
        take: filters.limit || 50,
        skip: filters.offset || 0,
    });

    return { interviews, total };
};

/**
 * Service to get all interviews for a developer
 */
export const getDeveloperInterviews = async (
    developerId: number,
    filters: {
        status?: InterviewStatus;
        upcoming?: boolean;
        limit?: number;
        offset?: number;
    }
): Promise<{ interviews: any[]; total: number }> => {
    // Build where clause
    const whereClause: any = {
        application: {
            applicantId: developerId,
        },
    };

    if (filters.status) {
        whereClause.status = filters.status;
    }

    if (filters.upcoming) {
        whereClause.scheduledDate = { gte: new Date() };
        whereClause.status = { in: [InterviewStatus.SCHEDULED, InterviewStatus.RESCHEDULED] };
    }

    // Get total count
    const total = await prisma.interview.count({ where: whereClause });

    // Get interviews with pagination
    const interviews = await prisma.interview.findMany({
        where: whereClause,
        include: {
            application: {
                include: {
                    job: {
                        select: {
                            id: true,
                            title: true,
                            companyName: true,
                            location: true,
                            jobType: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            scheduledDate: 'asc',
        },
        take: filters.limit || 50,
        skip: filters.offset || 0,
    });

    return { interviews, total };
};
