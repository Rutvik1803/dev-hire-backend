import { Request, Response } from 'express';
import * as authService from './auth.service';
import { successResponse } from '../../utils/response';

// Controller to handle the sign up request
export const signUpController = async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.signUp(req.body);

  // Set refreshToken as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  // Return accessToken in JSON response
  successResponse(
    res,
    {
      user,
      accessToken,
    },
    'User registered successfully',
    201,
  );
};

// Controller to handle the login request
export const loginController = async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  // Set refreshToken as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  // Return accessToken in JSON response
  successResponse(
    res,
    {
      user,
      accessToken,
    },
    'Login successful',
    200,
  );
};
