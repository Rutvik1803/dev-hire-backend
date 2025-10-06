import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { signUpController } from './auth.controller';

const router = Router();

router.post('/signup', asyncHandler(signUpController));

export default router;
