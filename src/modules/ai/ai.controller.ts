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
