import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { generateQuestionsController } from './ai.controller';

const router = Router();

/**
 * @route   POST /api/ai/generate-questions
 * @desc    Generate interview MCQ questions based on tech stack
 * @access  Public (can be protected later if needed)
 * @body    { techStack: string[] }
 */
router.post('/generate-questions', asyncHandler(generateQuestionsController));

export default router;
