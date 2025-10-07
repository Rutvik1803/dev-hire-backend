import { prisma } from '../../config/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/customErrors';
import { ApplicationStatus } from '@prisma/client';

/**
 * Service to get developer dashboard statistics
 */
export const getDeveloperDashboardStats = async (developerId: number) => {
    // Get all applications for this developer
    const allApplications = await prisma.application.findMany({
        where: { applicantId: developerId },
        select: { status: true, updatedDate: true },
    });

    const appliedJobs = allApplications.length;

    const inReview = allApplications.filter(app => app.status === ApplicationStatus.IN_REVIEW).length;

    const interviews = allApplications.filter(app => app.status === ApplicationStatus.ACCEPTED).length;

    // Count offers (accepted applications)
    const offers = interviews;

    // Recent activity - status changes in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newResponsesThisWeek = allApplications.filter(
        app => new Date(app.updatedDate) >= sevenDaysAgo && app.status !== ApplicationStatus.APPLIED
    ).length;

    // Upcoming interviews (for now, same as accepted)
    const upcomingInterviews = interviews;

    return {
        appliedJobs,
        inReview,
        interviews,
        offers,
        recentActivity: {
            newResponsesThisWeek,
            upcomingInterviews,
        },
    };
};

/**
 * Service to get all applications for a developer
 */
export const getDeveloperApplications = async (
    developerId: number,
    filters: {
        status?: ApplicationStatus;
        limit?: number;
        offset?: number;
        sort?: 'asc' | 'desc';
    }
) => {
    const whereClause: any = {
        applicantId: developerId,
    };

    if (filters.status) {
        whereClause.status = filters.status;
    }

    // Get total count
    const total = await prisma.application.count({ where: whereClause });

    // Get applications with pagination
    const applications = await prisma.application.findMany({
        where: whereClause,
        include: {
            job: {
                select: {
                    id: true,
                    title: true,
                    companyName: true,
                    location: true,
                    jobType: true,
                    salaryRange: true,
                },
            },
        },
        orderBy: {
            appliedDate: filters.sort || 'desc',
        },
        take: filters.limit || 50,
        skip: filters.offset || 0,
    });

    return { applications, total };
};

/**
 * Service to get recent applications for developer
 */
export const getRecentDeveloperApplications = async (developerId: number, limit: number = 10) => {
    // Get applications from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const applications = await prisma.application.findMany({
        where: {
            applicantId: developerId,
            appliedDate: { gte: thirtyDaysAgo },
        },
        include: {
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
        take: Math.min(limit, 20), // Max 20
    });

    return applications;
};

/**
 * Service to check application status for a specific job
 */
export const checkApplicationStatus = async (jobId: number, developerId: number) => {
    const application = await prisma.application.findUnique({
        where: {
            jobId_applicantId: {
                jobId,
                applicantId: developerId,
            },
        },
        select: {
            id: true,
            status: true,
            appliedDate: true,
        },
    });

    if (application) {
        return {
            hasApplied: true,
            applicationId: application.id,
            status: application.status,
            appliedDate: application.appliedDate,
        };
    }

    return {
        hasApplied: false,
    };
};

/**
 * Service to withdraw an application
 */
export const withdrawApplication = async (applicationId: number, developerId: number) => {
    // Get application
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
    });

    if (!application) {
        throw NotFoundError('Application not found');
    }

    // Verify ownership
    if (application.applicantId !== developerId) {
        throw ForbiddenError('You are not authorized to withdraw this application');
    }

    // Check if can withdraw (not if accepted or rejected)
    if (application.status === ApplicationStatus.ACCEPTED || application.status === ApplicationStatus.REJECTED) {
        throw BadRequestError('Cannot withdraw application that has been accepted or rejected');
    }

    // Delete application
    await prisma.application.delete({
        where: { id: applicationId },
    });

    return { message: 'Your application has been withdrawn' };
};

/**
 * Service to get developer profile
 */
export const getDeveloperProfile = async (developerId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: developerId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            experience: true,
            skills: true,
            resumeUrl: true,
            linkedinUrl: true,
            githubUrl: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw NotFoundError('User not found');
    }

    return user;
};

/**
 * Service to update developer profile
 */
export const updateDeveloperProfile = async (
    developerId: number,
    profileData: {
        experience?: string;
        skills?: string[];
        linkedinUrl?: string;
        githubUrl?: string;
        phone?: string;
    }
) => {
    // Validate skills if provided
    if (profileData.skills !== undefined) {
        if (!Array.isArray(profileData.skills)) {
            throw BadRequestError('Skills must be an array');
        }
    }

    // Validate URLs if provided
    if (profileData.linkedinUrl && !isValidUrl(profileData.linkedinUrl)) {
        throw BadRequestError('Invalid LinkedIn URL');
    }

    if (profileData.githubUrl && !isValidUrl(profileData.githubUrl)) {
        throw BadRequestError('Invalid GitHub URL');
    }

    // Update profile
    const updatedUser = await prisma.user.update({
        where: { id: developerId },
        data: {
            ...(profileData.experience && { experience: profileData.experience }),
            ...(profileData.skills && { skills: profileData.skills }),
            ...(profileData.linkedinUrl !== undefined && { linkedinUrl: profileData.linkedinUrl }),
            ...(profileData.githubUrl !== undefined && { githubUrl: profileData.githubUrl }),
            ...(profileData.phone !== undefined && { phone: profileData.phone }),
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            experience: true,
            skills: true,
            resumeUrl: true,
            linkedinUrl: true,
            githubUrl: true,
            phone: true,
        },
    });

    return updatedUser;
};

/**
 * Service to update resume URL
 */
export const updateResumeUrl = async (developerId: number, resumeUrl: string, fileName: string, fileSize: number) => {
    const updatedUser = await prisma.user.update({
        where: { id: developerId },
        data: { resumeUrl },
        select: {
            id: true,
            resumeUrl: true,
        },
    });

    return {
        resumeUrl: updatedUser.resumeUrl,
        fileName,
        fileSize,
        uploadedAt: new Date(),
    };
};

/**
 * Service to get resume details
 */
export const getResumeDetails = async (developerId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: developerId },
        select: {
            resumeUrl: true,
        },
    });

    if (!user) {
        throw NotFoundError('User not found');
    }

    if (!user.resumeUrl) {
        return null;
    }

    // Extract file name from URL
    const fileName = user.resumeUrl.split('/').pop() || 'resume.pdf';

    return {
        resumeUrl: user.resumeUrl,
        fileName,
        fileSize: 0, // Would need to read file system to get actual size
        uploadedAt: new Date(), // Would need to store this in DB
    };
};

/**
 * Service to delete resume
 */
export const deleteResume = async (developerId: number) => {
    await prisma.user.update({
        where: { id: developerId },
        data: { resumeUrl: null },
    });

    return { message: 'Your resume has been deleted' };
};

/**
 * Helper function to validate URL
 */
const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};
