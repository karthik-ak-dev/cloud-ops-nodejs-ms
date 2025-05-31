import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  
  // Log error
  logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${err.message}`);
  
  // Only send stack trace in development
  const errorResponse = {
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };
  
  res.status(statusCode).json(errorResponse);
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error: AppError = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export class ApiError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;
  
  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }
  
  static unauthorized(message: string): ApiError {
    return new ApiError(401, message);
  }
  
  static forbidden(message: string): ApiError {
    return new ApiError(403, message);
  }
  
  static notFound(message: string): ApiError {
    return new ApiError(404, message);
  }
  
  static internalError(message: string): ApiError {
    return new ApiError(500, message, false);
  }
}