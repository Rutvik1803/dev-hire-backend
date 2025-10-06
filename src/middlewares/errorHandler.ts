import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../utils/response';
import { HttpError } from '../utils/customErrors';

export const errorHandler = (
  err: HttpError | Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('Error:', err);

  const status = 'status' in err ? err.status : 500;
  const message = err.message || 'Internal Server Error';

  errorResponse(res, message, status);
};
