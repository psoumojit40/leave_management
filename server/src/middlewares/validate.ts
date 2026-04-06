import { Request, Response, NextFunction } from 'express';
// FIX: Switched AnyZodObject to ZodObject as requested by your compiler
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          // Using .issues (the correct Zod property)
          errors: error.issues.map(issue => ({
            // If path[1] exists (the field), use it. Otherwise use path[0] (the object type).
            path: issue.path.length > 1 ? issue.path[1] : issue.path[0],
            message: issue.message
          }))
        });
      }
      
      // Pass other errors to your global errorHandler
      next(error);
    }
  };
};