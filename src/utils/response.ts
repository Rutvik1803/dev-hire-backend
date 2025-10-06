import { Response } from 'express';

export const successResponse = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const errorResponse = (res: Response, message = 'Error', statusCode = 500) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};
