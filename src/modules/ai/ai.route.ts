import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { generateQuestionsController, generateCoverLetterController } from './ai.controller';

const router = Router();

/**
 * @route   POST /api/ai/generate-questions
 * @desc    Generate interview MCQ questions based on tech stack
 * @access  Public (can be protected later if needed)
 * @body    { techStack: string[] }
 */
router.post('/generate-questions', asyncHandler(generateQuestionsController));

/**
 * @route   POST /api/ai/generate-cover-letter
 * @desc    Generate personalized cover letter based on user details and job description
 * @access  Public (can be protected later if needed)
 * @body    { userDetails: UserDetails, jobDescription: JobDescription }
 */
router.post('/generate-cover-letter', asyncHandler(generateCoverLetterController));

export default router;
