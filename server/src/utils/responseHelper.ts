import { Request, Response, NextFunction } from 'express';

/**
 * Success response helper
 */
export const successResponse = (res: Response, data: any, message: string = 'Success', statusCode: number = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Error response helper
 */
export const errorResponse = (res: Response, message: string, statusCode: number = 400, errors?: any) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

/**
 * Validation error response helper
 */
export const validationErrorResponse = (res: Response, errors: any[]) => {
  res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors
  });
};

/**
 * Not found response helper
 */
export const notFoundResponse = (res: Response, resource: string = 'Resource') => {
  res.status(404).json({
    success: false,
    message: `${resource} not found`
  });
};

/**
 * Unauthorized response helper
 */
export const unauthorizedResponse = (res: Response, message: string = 'Unauthorized') => {
  res.status(401).json({
    success: false,
    message
  });
};

/**
 * Forbidden response helper
 */
export const forbiddenResponse = (res: Response, message: string = 'Forbidden') => {
  res.status(403).json({
    success: false,
    message
  });
};

/**
 * Pagination helper
 */
export const paginateResults = (results: any[], page: number = 1, limit: number = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalItems = results.length;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    data: results.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};