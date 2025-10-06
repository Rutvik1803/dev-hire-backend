import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { signUpController, loginController } from './auth.controller';

const router = Router();

router.post('/signup', asyncHandler(signUpController));
router.post('/login', asyncHandler(loginController));

export default router;
