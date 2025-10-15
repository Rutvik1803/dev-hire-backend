import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import * as interviewService from './interview.service';
import { successResponse } from '../../utils/response';
import { InterviewStatus } from '@prisma/client';

/**
 * Controller to schedule an interview
 * POST /api/interviews/schedule
 */
export const scheduleInterviewController = async (req: AuthRequest, res: Response) => {
    const recruiterId = req.user!.userId;
    const { applicationId, scheduledDate, duration, meetingLink, location, interviewerNotes } = req.body;

    const result = await interviewService.scheduleInterview(
        {
            applicationId: Number(applicationId),
            scheduledDate,
            duration: Number(duration),
            meetingLink,
            location,
            interviewerNotes,
        },
        recruiterId
    );

    successResponse(
        res,
        {
            interview: result.interview,
            application: result.application,
        },
        'Interview scheduled successfully',
        201
    );
};

/**
 * Controller to get interview by ID
 * GET /api/interviews/:id
 */
export const getInterviewController = async (req: AuthRequest, res: Response) => {
    const interviewId = Number(req.params.id);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const interview = await interviewService.getInterviewById(interviewId, userId, userRole);

    successResponse(res, { interview }, 'Interview details retrieved successfully', 200);
};

/**
 * Controller to get interview by application ID
 * GET /api/interviews/application/:applicationId
 */
export const getInterviewByApplicationController = async (req: AuthRequest, res: Response) => {
    const applicationId = Number(req.params.applicationId);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const interview = await interviewService.getInterviewByApplicationId(applicationId, userId, userRole);

    if (!interview) {
        successResponse(res, { interview: null }, 'No interview scheduled for this application', 200);
    } else {
        successResponse(res, { interview }, 'Interview details retrieved successfully', 200);
    }
};

/**
 * Controller to update interview
 * PATCH /api/interviews/:id
 */
export const updateInterviewController = async (req: AuthRequest, res: Response) => {
    const interviewId = Number(req.params.id);
    const recruiterId = req.user!.userId;
    const { scheduledDate, duration, meetingLink, location, interviewerNotes, status } = req.body;

    const updatedInterview = await interviewService.updateInterview(
        interviewId,
        {
            scheduledDate,
            duration: duration ? Number(duration) : undefined,
            meetingLink,
            location,
            interviewerNotes,
            status: status as InterviewStatus,
        },
        recruiterId
    );

    successResponse(res, { interview: updatedInterview }, 'Interview updated successfully', 200);
};

/**
 * Controller to cancel interview
 * DELETE /api/interviews/:id
 */
export const cancelInterviewController = async (req: AuthRequest, res: Response) => {
    const interviewId = Number(req.params.id);
    const recruiterId = req.user!.userId;

    const cancelledInterview = await interviewService.cancelInterview(interviewId, recruiterId);

    successResponse(res, { interview: cancelledInterview }, 'Interview cancelled successfully', 200);
};

/**
 * Controller to get all interviews for recruiter
 * GET /api/interviews/recruiter/all
 */
export const getRecruiterInterviewsController = async (req: AuthRequest, res: Response) => {
    const recruiterId = req.user!.userId;
    const { status, upcoming, limit, offset } = req.query;

    const result = await interviewService.getRecruiterInterviews(recruiterId, {
        status: status as InterviewStatus,
        upcoming: upcoming === 'true',
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
    });

    successResponse(
        res,
        {
            interviews: result.interviews,
            total: result.total,
            count: result.interviews.length,
        },
        'Interviews retrieved successfully',
        200
    );
};

/**
 * Controller to get all interviews for developer
 * GET /api/interviews/developer/all
 */
export const getDeveloperInterviewsController = async (req: AuthRequest, res: Response) => {
    const developerId = req.user!.userId;
    const { status, upcoming, limit, offset } = req.query;

    const result = await interviewService.getDeveloperInterviews(developerId, {
        status: status as InterviewStatus,
        upcoming: upcoming === 'true',
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
    });

    successResponse(
        res,
        {
            interviews: result.interviews,
            total: result.total,
            count: result.interviews.length,
        },
        'Interviews retrieved successfully',
        200
    );
};
