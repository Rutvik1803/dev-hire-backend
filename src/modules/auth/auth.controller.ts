import { Request, Response } from 'express';
import * as authService from './auth.service';
import { successResponse } from '../../utils/response';

// Create a contoller to handle the sign up request
export const signUpController = async (req: Request, res: Response) => {
  const user = await authService.signUp(req.body);
  return successResponse(res, user, 'User registered Successfully', 201);
};
