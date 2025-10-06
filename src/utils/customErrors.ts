// Custom error type
export interface HttpError extends Error {
    status: number;
}

// Factory function to create HTTP errors
export const createHttpError = (message: string, status: number): HttpError => {
    const error = new Error(message) as HttpError;
    error.status = status;
    error.name = 'HttpError';
    Error.captureStackTrace(error, createHttpError);
    return error;
};

// Factory function for Bad Request Error (400)
export const BadRequestError = (message = 'Bad Request'): HttpError => {
    const error = new Error(message) as HttpError;
    error.status = 400;
    error.name = 'BadRequestError';
    Error.captureStackTrace(error, BadRequestError);
    return error;
};

// Factory function for Unauthorized Error (401)
export const UnauthorizedError = (message = 'Unauthorized'): HttpError => {
    const error = new Error(message) as HttpError;
    error.status = 401;
    error.name = 'UnauthorizedError';
    Error.captureStackTrace(error, UnauthorizedError);
    return error;
};

// Factory function for Forbidden Error (403)
export const ForbiddenError = (message = 'Forbidden'): HttpError => {
    const error = new Error(message) as HttpError;
    error.status = 403;
    error.name = 'ForbiddenError';
    Error.captureStackTrace(error, ForbiddenError);
    return error;
};

// Factory function for Not Found Error (404)
export const NotFoundError = (message = 'Not Found'): HttpError => {
    const error = new Error(message) as HttpError;
    error.status = 404;
    error.name = 'NotFoundError';
    Error.captureStackTrace(error, NotFoundError);
    return error;
};

// Factory function for Conflict Error (409)
export const ConflictError = (message = 'Conflict'): HttpError => {
    const error = new Error(message) as HttpError;
    error.status = 409;
    error.name = 'ConflictError';
    Error.captureStackTrace(error, ConflictError);
    return error;
};

// Factory function for Internal Server Error (500)
export const InternalServerError = (message = 'Internal Server Error'): HttpError => {
    const error = new Error(message) as HttpError;
    error.status = 500;
    error.name = 'InternalServerError';
    Error.captureStackTrace(error, InternalServerError);
    return error;
};
