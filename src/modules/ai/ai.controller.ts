import { Request, Response } from 'express';
import * as aiService from './ai.service';
import { successResponse } from '../../utils/response';

/**
 * Controller to generate interview questions
 * POST /api/ai/generate-questions
 * Body: { techStack: ["React", "Node.js", "TypeScript"] }
 */
export const generateQuestionsController = async (req: Request, res: Response) => {
    const { techStack } = req.body;

    const questions = await aiService.generateInterviewQuestions(techStack);

    successResponse(
        res,
        {
            questions,
            count: questions.length,
            techStack,
        },
        'Interview questions generated successfully',
        200
    );
};

/**
 * Controller to generate cover letter
 * POST /api/ai/generate-cover-letter
 * Body: { 
 *   userDetails: { name, email, experience, skills, ... },
 *   jobDescription: { title, companyName, description, ... }
 * }
 */
export const generateCoverLetterController = async (req: Request, res: Response) => {
    const { userDetails, jobDescription } = req.body;

    const coverLetter = await aiService.generateCoverLetter(userDetails, jobDescription);

    successResponse(
        res,
        {
            coverLetter,
            generatedAt: new Date().toISOString(),
            userDetails: {
                name: userDetails.name,
                email: userDetails.email,
            },
            jobDetails: {
                title: jobDescription.title,
                companyName: jobDescription.companyName,
            },
        },
        'Cover letter generated successfully',
        200
    );
};
